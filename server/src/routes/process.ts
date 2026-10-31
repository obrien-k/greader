import { Router, Request, Response } from "express";
import multer from "multer";
import { storage, BUCKET_NAME } from "../config/gcp.js";
import {
  parseTakeoutZipStream,
  createHtmlTakeoutParserStream,
  parseJsonTakeoutStream,
} from "../services/parser.js";
import { DashboardAggregator } from "../services/aggregator.js";
import { Readable } from "stream";

const router = Router();
const upload = multer({
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
});

/**
 * In-memory cache for recent user dashboards (when running locally or before Firestore reads)
 */
export const memoryDashboardCache = new Map<string, any>();

/**
 * POST /api/process-gcs
 * Triggered by PubSub/Eventarc on GCS Object Finalized or called directly by frontend.
 */
router.post("/process-gcs", async (req: Request, res: Response): Promise<void> => {
  try {
    const { objectPath, uid = "default_user", bucket = BUCKET_NAME } = req.body;

    if (!objectPath) {
      res.status(400).json({ error: "objectPath is required" });
      return;
    }

    const file = storage.bucket(bucket).file(objectPath);
    const readStream = file.createReadStream();
    const aggregator = new DashboardAggregator(uid);

    console.log(`Starting GCS streaming parse for ${objectPath}...`);

    if (objectPath.endsWith(".zip")) {
      await parseTakeoutZipStream(readStream, {
        onRecord: (record) => aggregator.addRecord(record),
      });
    } else if (objectPath.endsWith(".html")) {
      const htmlParserStream = createHtmlTakeoutParserStream({
        onRecord: (record) => aggregator.addRecord(record),
      });
      await new Promise<void>((resolve, reject) => {
        readStream.pipe(htmlParserStream).on("finish", resolve).on("error", reject);
      });
    } else if (objectPath.endsWith(".json")) {
      await parseJsonTakeoutStream(readStream, {
        onRecord: (record) => aggregator.addRecord(record),
      });
    }

    const dashboard = aggregator.computeDashboard();
    await aggregator.saveToFirestore(dashboard);
    memoryDashboardCache.set(uid, dashboard);

    res.json({
      success: true,
      message: "Takeout activity processing complete",
      dashboard,
    });
  } catch (err: any) {
    console.error("GCS processing error:", err);
    res.status(500).json({ error: "Failed to process GCS file", details: err.message });
  }
});

/**
 * POST /api/parse-direct
 * Direct streaming upload route for local development or direct browser upload
 */
router.post("/parse-direct", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    const uid = (req.query.uid as string) || req.body.uid || "default_user";

    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const filename = req.file.originalname.toLowerCase();
    const bufferStream = Readable.from(req.file.buffer);
    const aggregator = new DashboardAggregator(uid);

    console.log(`Direct stream parsing started for ${filename} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)...`);

    if (filename.endsWith(".zip")) {
      await parseTakeoutZipStream(bufferStream, {
        onRecord: (record) => aggregator.addRecord(record),
      });
    } else if (filename.endsWith(".html") || filename.endsWith(".htm")) {
      const htmlParserStream = createHtmlTakeoutParserStream({
        onRecord: (record) => aggregator.addRecord(record),
      });
      await new Promise<void>((resolve, reject) => {
        bufferStream.pipe(htmlParserStream).on("finish", resolve).on("error", reject);
      });
    } else if (filename.endsWith(".json")) {
      await parseJsonTakeoutStream(bufferStream, {
        onRecord: (record) => aggregator.addRecord(record),
      });
    } else {
      res.status(400).json({ error: "Unsupported file format. Please upload .zip, .html, or .json" });
      return;
    }

    const dashboard = aggregator.computeDashboard();
    await aggregator.saveToFirestore(dashboard);
    memoryDashboardCache.set(uid, dashboard);

    console.log(`Direct parsing complete! Processed ${dashboard.summary.totalLoggedItems} items.`);

    res.json({
      success: true,
      message: "Parsing and aggregation completed successfully",
      dashboard,
    });
  } catch (err: any) {
    console.error("Direct parsing error:", err);
    res.status(500).json({ error: "Direct parsing failed", details: err.message });
  }
});

export default router;

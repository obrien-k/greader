import { Router, Request, Response } from "express";
import { storage, BUCKET_NAME, isGcpConfigured } from "../config/gcp.js";

const router = Router();

/**
 * POST /api/upload-url
 * Generates a direct GCS Signed PUT URL for the client.
 * Bypasses web server memory bottlenecks for large 100MB+ zip files.
 */
router.post("/upload-url", async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, contentType = "application/zip", uid = "default_user" } = req.body;

    if (!filename) {
      res.status(400).json({ error: "Filename is required" });
      return;
    }

    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `uploads/${uid}/${Date.now()}_${sanitizedFilename}`;

    if (!isGcpConfigured()) {
      // Local development fallback
      res.json({
        uploadUrl: `/api/parse-direct?uid=${uid}`,
        objectPath,
        isDirectUpload: true,
        expiresInSeconds: 900,
        message: "GCS credentials not detected: fallback direct streaming route active",
      });
      return;
    }

    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(objectPath);

    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes TTL
      contentType,
    });

    res.json({
      uploadUrl: signedUrl,
      objectPath,
      bucket: BUCKET_NAME,
      expiresInSeconds: 900,
    });
  } catch (err: any) {
    console.error("Error generating signed upload URL:", err);
    res.status(500).json({ error: "Failed to generate upload URL", details: err.message });
  }
});

export default router;

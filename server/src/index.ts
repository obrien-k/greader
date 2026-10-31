import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoutes from "./routes/upload.js";
import processRoutes from "./routes/process.js";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || "8080", 10);

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Route registrations
app.use("/api", uploadRoutes);
app.use("/api", processRoutes);
app.use("/api", dashboardRoutes);

app.listen(port, () => {
  console.log(`🚀 Takeout Activity Parser & Aggregation Server listening on port ${port}`);
  console.log(`📡 Endpoints:`);
  console.log(`   - POST /api/upload-url (GCS Direct Signed URL generation)`);
  console.log(`   - POST /api/process-gcs (GCS background worker event trigger)`);
  console.log(`   - POST /api/parse-direct (Multipart streaming parser)`);
  console.log(`   - GET  /api/dashboard/:uid (Firestore aggregated dashboard)`);
  console.log(`   - GET  /api/sample-data (2007-2026 reference analytical dataset)`);
  console.log(`   - GET  /api/health`);
});

export default app;

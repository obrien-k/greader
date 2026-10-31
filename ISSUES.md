# Repository Issues & Backlog

## Issue #1: Differentiate UI/UX Workflows between Instant Streaming Parser and Cloud Run GCS Signed URL Ingestion

### Status: Open / In Progress
**Category**: UX / UI Enhancement  
**Priority**: Medium  
**Components**: `web/src/components/FileUploadModal.tsx`, `server/src/routes/upload.ts`

### Problem Description
Currently, when users open the Takeout Ingestion Modal and toggle between:
1. **Instant Streaming Parser (Client / Server)**
2. **Cloud Run + GCS Signed URL**

Both tabs share a similar drag-and-drop box without sufficient visual differentiation of the underlying architectural execution paths, prerequisites, and data flows.

### Desired Technical & Visual Differentiation
1. **Instant Streaming Parser (Local / Client Stream)**:
   - Emphasize zero-cloud footprint, client-side Web Streams parsing, and local privacy guarantees.
   - Recommended for single-file exports (`MyActivity.html`, `MyActivity.json`) and users running locally without active GCP IAM credentials.
   - Show streaming parsing telemetry (chunks read, events parsed per second).

2. **Cloud Run + GCS Signed URL (Enterprise Cloud Storage Pipeline)**:
   - Provide an architectural step visualizer:
     - Step 1: Client requests signed PUT URL with 15-minute TTL.
     - Step 2: Client streams multi-GB archive directly into GCS bucket (bypassing web server memory).
     - Step 3: GCS Eventarc / PubSub notification triggers background Cloud Run worker.
     - Step 4: Worker batch-writes summary collections into Cloud Firestore.
   - Display target GCS bucket name, upload progress bar, and Cloud Run async job status.
   - Support file size indicators up to 10GB+ archives.

---

## Issue #2: Persistent User Session & Empty State Onboarding Experience

### Status: Resolved in v1.1
**Category**: UX Flow  
**Description**: Differentiate the first-time landing experience (no dataset loaded) from returning users with cached dashboards in `localStorage` or cookies.

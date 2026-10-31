---
name: "Differentiate Ingestion Mode UI/UX"
about: "UX improvements for Instant Streaming Parser vs Cloud Run GCS Signed URL"
title: "[UX]: Differentiate UI/UX Workflows between Instant Streaming Parser and Cloud Run GCS Ingestion"
labels: ["enhancement", "ui/ux", "ingestion"]
assignees: []
---

## Summary
The Ingest modal provides two distinct ingestion pipelines:
1. **Instant Streaming Parser**: Client Web Streams / local chunked memory parsing for zero-cloud testing.
2. **Cloud Run + GCS Signed URL**: Enterprise streaming pipeline directly into Google Cloud Storage with Firestore batch pre-aggregation.

## Proposed Enhancements
- Differentiate visual branding, background gradients, and icons between the two options.
- Add an architectural workflow breadcrumb for the GCS Signed URL path.
- Display GCP bucket and IAM connection status when GCS mode is active.
- Emphasize zero-upload privacy for the local instant streaming parser.

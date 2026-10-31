import { Storage } from "@google-cloud/storage";
import { Firestore } from "@google-cloud/firestore";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT || "takeout-dashboard";
export const BUCKET_NAME = process.env.GCS_BUCKET_NAME || `${projectId}-takeout-uploads`;

// Initialize Google Cloud Storage
export const storage = new Storage({
  projectId,
});

// Initialize Firestore
export const firestore = new Firestore({
  projectId,
  databaseId: process.env.FIRESTORE_DATABASE_ID || "(default)",
});

// Initialize Gemini API client (optional API key fallback)
export const geminiApiKey = process.env.GEMINI_API_KEY || "";
export const genai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export const isGcpConfigured = (): boolean => {
  return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE);
};

// src/types.ts

export interface ResumeFile {
  name: string;
  url: string;
  uploadedAt: string;
  size: number;
}

export interface OptimizationRequest {
  jobDescription: string;
  additionalInfo?: string;
}
// context/ResumeContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { ResumeFile, OptimizationRequest } from '../types/types';
import { useAuth } from './AuthContext';

interface ResumeContextType {
  uploadedFiles: ResumeFile[];
  selectedFile: ResumeFile | null;
  isUploading: boolean;
  isOptimizing: boolean;
  isLoading: boolean;
  optimizationForm: OptimizationRequest;
  optimizedResult: any | null;
  parsedResume: any;
  setUploadedFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<ResumeFile | null>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOptimizing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOptimizationForm: React.Dispatch<React.SetStateAction<OptimizationRequest>>;
  setOptimizedResult: React.Dispatch<React.SetStateAction<any | null>>;
  setParsedResume: React.Dispatch<React.SetStateAction<any>>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fetchFiles: () => Promise<void>;
  handleOptimization: () => Promise<void>;
  generateResume: (resume_data: any, optimized_content: any) => Promise<any>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  const [uploadedFiles, setUploadedFiles] = useState<ResumeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ResumeFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationForm, setOptimizationForm] = useState<OptimizationRequest>({
    jobDescription: '',
    additionalInfo: ''
  });
  const [optimizedResult, setOptimizedResult] = useState<any | null>(null);
  const [parsedResume, setParsedResume] = useState<any>(null);

  // Upload file
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return alert('Please select a file');
      if (!token) return alert('User not authenticated');

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/files/upload`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        const newFile: ResumeFile = {
          name: result.filename,
          url: result.url,
          uploadedAt: new Date().toISOString().split('T')[0],
          size: file.size
        };
        setUploadedFiles(prev => [newFile, ...prev]);
      } catch (error: any) {
        alert(`Upload failed: ${error.message || error}`);
      } finally {
        setIsUploading(false);
        if (event.target) event.target.value = '';
      }
    },
    [token]
  );

  // Fetch user files
  const fetchFiles = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/files/all_files`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch files');
      const files: ResumeFile[] = await response.json();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Optimize resume (parse + optimize in one call)
  const handleOptimization = useCallback(async () => {
    if (!selectedFile?.name) {
      alert('Please select a resume file first');
      return;
    }
    if (!optimizationForm.jobDescription) {
      alert('Enter job description before optimizing');
      return;
    }
    setIsOptimizing(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/optimize/?filename=${encodeURIComponent(selectedFile.name)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            job_description: optimizationForm.jobDescription,
            additional_info: optimizationForm.additionalInfo
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Optimization failed');
      }

      const data = await response.json();
      setParsedResume(data.final_resume); // parsed + optimized structure
      setOptimizedResult(data.final_resume);
    } catch (error: any) {
      alert('Optimization failed: ' + (error.message || error));
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedFile, optimizationForm, token]);

  // Generate resume
  const generateResume = useCallback(
    async (resume_data: any, optimized_content: any) => {
      try {
        const res = await axios.post(
          `${API_BASE}/api/generate/`,
          { resume_data, optimized_content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return res.data;
      } catch (error) {
        console.error('Generate resume error:', error);
        throw error;
      }
    },
    [token]
  );

  const value: ResumeContextType = {
    uploadedFiles,
    selectedFile,
    isUploading,
    isOptimizing,
    isLoading,
    optimizationForm,
    optimizedResult,
    parsedResume,
    setUploadedFiles,
    setSelectedFile,
    setIsUploading,
    setIsOptimizing,
    setIsLoading,
    setOptimizationForm,
    setOptimizedResult,
    setParsedResume,
    handleFileUpload,
    fetchFiles,
    handleOptimization,
    generateResume
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) throw new Error('useResume must be used within a ResumeProvider');
  return context;
};

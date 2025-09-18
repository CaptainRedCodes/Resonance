// context/ResumeContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ResumeFile, OptimizationRequest } from '../types/types';
import { useAuth } from './AuthContext';

interface ResumeContextType {
  uploadedFiles: ResumeFile[];
  selectedFile: ResumeFile | null;
  isUploading: boolean;
  isOptimizing: boolean;
  isLoading: boolean;
  optimizationForm: OptimizationRequest;
  optimizedResult: string;
  setUploadedFiles: React.Dispatch<React.SetStateAction<ResumeFile[]>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<ResumeFile | null>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOptimizing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setOptimizationForm: React.Dispatch<React.SetStateAction<OptimizationRequest>>;
  setOptimizedResult: React.Dispatch<React.SetStateAction<string>>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fetchFiles: () => Promise<void>;
  handleOptimization: () => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);
const URL = 'http://127.0.0.1:8000/';

export const ResumeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();

  const [uploadedFiles, setUploadedFiles] = useState<ResumeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ResumeFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationForm, setOptimizationForm] = useState<OptimizationRequest>({
    jobDescription: '',
    additionalInfo: ''
  });
  const [optimizedResult, setOptimizedResult] = useState<string>('');

  // Upload a single .tex file
  const handleFileUpload = useCallback(
  async (event: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
    const file = event.target.files?.[0];
    if (!file) {
      alert('Please select a file');
      return false;
    }

    if (!token) {
      alert('User not authenticated');
      return false;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${URL}files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const newFile: ResumeFile = {
          name: result.filename,
          url: result.url,
          uploadedAt: new Date().toISOString().split('T')[0],
          size: file.size,
        };
        setUploadedFiles(prev => [newFile, ...prev]);
        return true;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      alert(`Upload failed. Please try again: ${error}`);
      return false;
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  },
  [token]
);


  // Fetch resumes of the logged-in user
  const fetchFiles = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${URL}files/all_files`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const files: ResumeFile[] = await response.json();
        setUploadedFiles(files);
      } else {
        console.error('Failed to fetch user files');
      }
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Optimize selected resume
  const handleOptimization = useCallback(async () => {
  if (!selectedFile || !optimizationForm.jobDescription) {
    alert('Please select a file and provide job description');
    return;
  }

  setIsOptimizing(true);
  try {
    const response = await fetch(
      `${URL}api/optimize/?filename=${encodeURIComponent(selectedFile.name)}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify({
          job_description: optimizationForm.jobDescription,
          additional_info: optimizationForm.additionalInfo
        })
      }
    );

    if (response.ok) {
      const optimizedContent = await response.text();
      setOptimizedResult(optimizedContent);
    } else {
      const errText = await response.text();
      throw new Error(errText || 'Optimization failed');
    }
  } catch (error) {
    alert('Optimization failed. Please try again: ' + error);
  } finally {
    setIsOptimizing(false);
  }
}, [selectedFile, optimizationForm]);



  const value: ResumeContextType = {
    uploadedFiles,
    selectedFile,
    isUploading,
    isOptimizing,
    isLoading,
    optimizationForm,
    optimizedResult,
    setUploadedFiles,
    setSelectedFile,
    setIsUploading,
    setIsOptimizing,
    setIsLoading,
    setOptimizationForm,
    setOptimizedResult,
    handleFileUpload,
    fetchFiles,
    handleOptimization
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = (): ResumeContextType => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

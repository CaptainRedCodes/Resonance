import React, { useState, useCallback, useRef, useEffect } from 'react';
import './index.css';
import type { ResumeFile, OptimizationRequest } from './types';
import HomePage from './components/HomePage';
import { UploadPage } from './components/UploadPage';
import { FilesPage } from './components/FilesPage';
import { OptimizePage } from './components/OptimizePage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'upload' | 'files' | 'optimize'>('home');
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const URL = 'http://127.0.0.1:8000/';

  // ✅ Upload a single .tex file
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith('.tex')) {
      alert('Please select a .tex file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${URL}files/upload`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const newFile: ResumeFile = {
          name: result.filename,
          url: result.url,
          uploadedAt: new Date().toISOString().split('T')[0],
          size: file.size
        };
        setUploadedFiles(prev => [newFile, ...prev]);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      alert(`Upload failed. Please try again: ${error}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // ✅ Fetch all uploaded files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${URL}files/all_files`);
      if (response.ok) {
        const files: ResumeFile[] = await response.json();
        setUploadedFiles(files);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigateToFiles = useCallback(() => {
    setCurrentPage('files');
    fetchFiles();
  }, [fetchFiles]);

  // ✅ Auto-fetch when entering "files" page
  useEffect(() => {
    if (currentPage === 'files') {
      fetchFiles();
    }
  }, [currentPage, fetchFiles]);

  // ✅ Select a file to optimize
  const handleFileSelect = (file: ResumeFile) => {
    setSelectedFile(file);
    setCurrentPage('optimize');
  };

  // ✅ Optimize selected resume
  const handleOptimization = async () => {
    if (!selectedFile || !optimizationForm.jobDescription) {
      alert('Please select a file and provide job description');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch(
        `${URL}api/optimize/?file_url=${encodeURIComponent(selectedFile.url)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
        throw new Error('Optimization failed');
      }
    } catch (error) {
      alert('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // ✅ Page Router
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} navigateToFiles={navigateToFiles} />;
      case 'upload':
        return (
          <UploadPage
            setCurrentPage={setCurrentPage}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        );
      case 'files':
        return (
          <FilesPage
            setCurrentPage={setCurrentPage}
            uploadedFiles={uploadedFiles}
            handleFileSelect={handleFileSelect}
            isLoading={isLoading}
            navigateToFiles={navigateToFiles}
          />
        );
      case 'optimize':
        return (
          <OptimizePage
            setCurrentPage={setCurrentPage}
            selectedFile={selectedFile}
            optimizationForm={optimizationForm}
            setOptimizationForm={setOptimizationForm}
            handleOptimization={handleOptimization}
            isOptimizing={isOptimizing}
            optimizedResult={optimizedResult}
          />
        );
      default:
        return <HomePage setCurrentPage={setCurrentPage} navigateToFiles={navigateToFiles} />;
    }
  };

  return renderCurrentPage();
};

export default App;

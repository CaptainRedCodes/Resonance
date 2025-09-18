import React from 'react';
import { FileText, ArrowRight, Upload } from 'lucide-react';
import type { ResumeFile } from '../types';

interface Props {
  uploadedFiles: ResumeFile[];
  setCurrentPage: React.Dispatch<React.SetStateAction<'home' | 'upload' | 'files' | 'optimize'>>;
  handleFileSelect: (file: ResumeFile) => void;
  isLoading: boolean,
  navigateToFiles: () => void;
}

export const FilesPage: React.FC<Props> = ({
    setCurrentPage,
    uploadedFiles,
    handleFileSelect,
    isLoading,
    navigateToFiles
  }) =>(
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => setCurrentPage('home')}
          className="mb-8 text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 font-medium"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="p-8 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Resume Files</h1>
                <p className="text-slate-600">Select a file to optimize for a specific job</p>
              </div>
              <button 
                onClick={navigateToFiles}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-6"></div>
                <p className="text-slate-600 text-lg">Loading your files...</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg mb-6">No resume files uploaded yet</p>
                <button 
                  onClick={() => setCurrentPage('upload')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium"
                >
                  Upload Your First Resume
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    onClick={() => handleFileSelect(file)}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-indigo-50 rounded-2xl border border-slate-200/50 hover:border-indigo-300 cursor-pointer transition-all duration-200 hover:shadow-lg group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{file.name}</h3>
                        <p className="text-sm text-slate-600">
                          Uploaded on {file.uploadedAt} • {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-indigo-600 font-medium group-hover:text-indigo-700">
                        Click to optimize
                      </span>
                      <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:text-indigo-700 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
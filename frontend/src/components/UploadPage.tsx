import { ArrowRight, FileText, Upload } from "lucide-react";
import React from "react";

interface UploadPageProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<'home' | 'upload' | 'files' | 'optimize'>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export const UploadPage: React.FC<UploadPageProps> = ({
  setCurrentPage,
  fileInputRef,
  handleFileUpload,
  isUploading
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => setCurrentPage('home')}
        className="mb-8 text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 font-medium"
      >
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
        <div className="p-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Upload Your Resume</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload your LaTeX resume file (.tex) and we'll prepare it for optimization
            </p>
          </div>

          <div 
            className="border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer bg-indigo-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  Drop your .tex file here or click to browse
                </p>
                <p className="text-slate-600">
                  Only LaTeX (.tex) files are supported
                </p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".tex"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isUploading && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-3 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full">
                <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                <span className="font-medium">Uploading your resume...</span>
              </div>
            </div>
          )}

          <div className="mt-12 text-center">
            <button 
              onClick={() => setCurrentPage('files')}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline underline-offset-4"
            >
              Or view your existing files
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

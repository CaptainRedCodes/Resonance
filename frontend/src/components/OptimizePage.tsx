// components/OptimizePage.tsx
import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useResume } from '../context/ResumeContext';

export const OptimizePage: React.FC = () => {
  const {
    selectedFile,
    optimizationForm,
    setOptimizationForm,
    handleOptimization,
    isOptimizing,
    optimizedResult,
    uploadedFiles
  } = useResume();
  
  const navigate = useNavigate();
  const { fileId } = useParams();

  // If no selected file but fileId in URL, try to find and select it
  useEffect(() => {
    if (!selectedFile && fileId && uploadedFiles.length > 0) {
      const file = uploadedFiles.find(f => f.name === fileId);
      if (file) {
        // setSelectedFile(file); // You might want to add this to context
      }
    }
  }, [selectedFile, fileId, uploadedFiles]);

  // Redirect if no file selected
  useEffect(() => {
    if (!selectedFile && !fileId) {
      navigate('/files');
    }
  }, [selectedFile, fileId, navigate]);

  if (!selectedFile) {
    return (
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No File Selected</h1>
          <p className="text-gray-600 mb-6">Please select a resume file to optimize.</p>
          <Link
            to="/files"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Select a File
          </Link>
        </div>
      </div>
    );
  }

  const handleFormChange = (field: 'jobDescription' | 'additionalInfo', value: string) => {
    setOptimizationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const downloadOptimizedResume = () => {
    if (!optimizedResult) return;
    
    const blob = new Blob([optimizedResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_${selectedFile.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/files"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Files
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Optimize Resume</h1>
          <p className="text-gray-600 mt-2">
            Customize your resume for specific job requirements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Selected File Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Selected Resume</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-lg mr-3 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-900">{selectedFile.name}</p>
                  <p className="text-sm text-blue-600">Uploaded: {selectedFile.uploadedAt}</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                id="jobDescription"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste the job description here. Include key requirements, responsibilities, and qualifications..."
                value={optimizationForm.jobDescription}
                onChange={(e) => handleFormChange('jobDescription', e.target.value)}
                disabled={isOptimizing}
              />
              <p className="text-sm text-gray-500 mt-2">
                Provide the complete job description for the role you're applying to.
              </p>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                id="additionalInfo"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any specific requirements, company culture info, or optimization preferences..."
                value={optimizationForm.additionalInfo}
                onChange={(e) => handleFormChange('additionalInfo', e.target.value)}
                disabled={isOptimizing}
              />
              <p className="text-sm text-gray-500 mt-2">
                Provide any additional context that might help optimize your resume.
              </p>
            </div>

            {/* Optimize Button */}
            <button
              onClick={handleOptimization}
              disabled={isOptimizing || !optimizationForm.jobDescription.trim()}
              className={`
                w-full py-3 px-4 rounded-lg font-medium text-white
                ${isOptimizing || !optimizationForm.jobDescription.trim()
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
                }
              `}
            >
              {isOptimizing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Optimizing Resume...
                </div>
              ) : (
                'Optimize Resume'
              )}
            </button>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Optimization Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Optimized Resume</h3>
                  {optimizedResult && (
                    <button
                      onClick={downloadOptimizedResume}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {!optimizedResult && !isOptimizing && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      Your optimized resume will appear here after processing
                    </p>
                  </div>
                )}

                {isOptimizing && (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">Processing your resume optimization...</p>
                  </div>
                )}

                {optimizedResult && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-800 font-medium">
                          Resume optimization completed successfully!
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                        {optimizedResult}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Optimization Tips</h4>
              <ul className="text-yellow-800 text-sm space-y-1">
                <li>• Be specific with job requirements in the description</li>
                <li>• Include company values and culture information</li>
                <li>• Mention specific technologies or skills mentioned</li>
                <li>• Review the optimized version before using it</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
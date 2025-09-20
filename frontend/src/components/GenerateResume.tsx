// components/GenerateResumePage.tsx
import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { useNavigate } from 'react-router-dom';

export const GenerateResumePage: React.FC = () => {
  const { selectedFile, optimizedResult, generateResume } = useResume();
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  if (!selectedFile || !optimizedResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold mb-4">No Resume Data</h1>
        <p className="mb-6">Please upload and optimize a resume first.</p>
        <button
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate('/upload')}
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateResume(selectedFile, optimizedResult);
      setHtmlPreview(res.html_preview || '<p>No preview available</p>');
    } catch (error) {
      alert('Failed to generate preview. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Preview Resume: {selectedFile.name}</h1>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`px-4 py-2 rounded text-white ${
          isGenerating ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isGenerating ? 'Generating...' : 'Generate Preview'}
      </button>

      {htmlPreview && (
        <div className="mt-6 border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-bold mb-2">HTML Preview</h2>
          <div
            className="prose max-w-full overflow-auto"
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
          />
        </div>
      )}
    </div>
  );
};

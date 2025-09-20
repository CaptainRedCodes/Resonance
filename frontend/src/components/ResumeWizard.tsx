// components/ResumeWizard.tsx
import React, { useState } from 'react';
import { UploadPage } from './UploadPage';
import { OptimizePage } from './OptimizePage';
import { GenerateResumePage } from './GenerateResume';
import { useResume } from '../context/ResumeContext';
import { ResumeEditor } from './EditResumePage';

export const ResumeWizard: React.FC = () => {
  const { selectedFile, parsedResume, optimizedResult } = useResume();
  const [step, setStep] = useState<number>(1);

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Step Indicator */}
      <div className="flex justify-center gap-4 py-4 bg-gray-100">
        <span className={`px-3 py-1 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          1. Upload
        </span>
        <span className={`px-3 py-1 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          2. Review & Optimize
        </span>
        <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
          3. Preview
        </span>
      </div>

      {/* Step Content */}
      <div className="flex-1">
        {step === 1 && <UploadPage />}
        {step === 2 && <><OptimizePage /> <ResumeEditor/></>}
        {step === 3 && <GenerateResumePage />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between p-4 border-t">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={
            (step === 1 && !selectedFile) || 
            (step === 2 && !optimizedResult)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

import { ArrowRight, Download, FileText, Zap } from "lucide-react";
import type { OptimizationRequest, ResumeFile } from "../types";


interface Props {
  setCurrentPage: React.Dispatch<React.SetStateAction<'home' | 'upload' | 'files' | 'optimize'>>;
  selectedFile: ResumeFile | null;
  optimizationForm: OptimizationRequest;
  setOptimizationForm: React.Dispatch<React.SetStateAction<OptimizationRequest>>;
  handleOptimization: () => void;
  isOptimizing: boolean;
  optimizedResult: string;
}


export const OptimizePage: React.FC<Props> = ({
  setCurrentPage,
  selectedFile,
  optimizationForm,
  setOptimizationForm,
  handleOptimization,
  isOptimizing,
  optimizedResult
}) => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentPage('files')}
          className="mb-8 text-indigo-600 hover:text-indigo-800 flex items-center space-x-2 font-medium"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Files</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Selected File</h2>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <p className="font-semibold text-slate-900">{selectedFile?.name}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedFile?.url}  Uploaded {selectedFile?.uploadedAt}
                </p>
                </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Job Description *
                </label>
                <textarea
                  value={optimizationForm.jobDescription}
                  onChange={(e) => setOptimizationForm(prev => ({ ...prev, jobDescription: e.target.value }))}
                  placeholder="Paste the job description here. Include key requirements, skills, and qualifications..."
                  className="w-full h-40 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Additional Information (Optional)
                </label>
                <textarea
                  value={optimizationForm.additionalInfo}
                  onChange={(e) => setOptimizationForm(prev => ({ ...prev, additionalInfo: e.target.value }))}
                  placeholder="Any specific instructions or areas of focus for the optimization..."
                  className="w-full h-24 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={handleOptimization}
                disabled={isOptimizing || !optimizationForm.jobDescription}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center space-x-3"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Optimizing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    <span>Optimize Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Optimized Resume</h2>
              </div>
              {optimizedResult && (
                <button
                  onClick={() => {
                    const blob = new Blob([optimizedResult], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `optimized_${selectedFile?.name}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              )}
            </div>

            <div className="h-96 border border-slate-300 rounded-xl overflow-hidden">
              {optimizedResult ? (
                <pre className="p-4 h-full overflow-auto text-sm text-slate-800 bg-slate-50 font-mono leading-relaxed">
                  {optimizedResult}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Ready to Optimize</p>
                    <p className="text-sm">Your optimized resume will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
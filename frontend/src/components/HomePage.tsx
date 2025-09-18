import { ArrowRight, CheckCircle, FileText, Sparkles, Target, Upload, Zap } from 'lucide-react';
import React from 'react';

interface HomePageProps {
  setCurrentPage: React.Dispatch<React.SetStateAction<'home' | 'upload' | 'files' | 'optimize'>>;
  navigateToFiles: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ setCurrentPage }) => {
    return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Resonance
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">Features</a>
                        <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 transition-colors font-medium">How it Works</a>
                        <button
                            onClick={() => setCurrentPage('upload')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
                    <Zap className="w-4 h-4" />
                    <span>AI-Powered Resume Optimization</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                    Transform Your
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 bg-clip-text text-transparent block">
                        Resume Magic
                    </span>
                </h1>

                <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                    Upload your LaTeX resume and watch it transform into a perfectly tailored document that matches any job description. Our AI understands what recruiters want.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => setCurrentPage('upload')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center space-x-3"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Start Optimizing</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setCurrentPage('files')}
                        className="bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg border border-slate-200 flex items-center space-x-3"
                    >
                        <FileText className="w-5 h-5" />
                        <span>View Files</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50">
                        <div className="text-3xl font-bold text-indigo-600 mb-2">98%</div>
                        <div className="text-slate-600 font-medium">Match Rate</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50">
                        <div className="text-3xl font-bold text-purple-600 mb-2">5min</div>
                        <div className="text-slate-600 font-medium">Average Time</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-slate-200/50">
                        <div className="text-3xl font-bold text-teal-600 mb-2">10K+</div>
                        <div className="text-slate-600 font-medium">Resumes Optimized</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Choose Resonance?</h2>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Our advanced AI doesn't just match keywords—it understands context, intent, and industry standards.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-6">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Smart Matching</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Advanced AI analyzes job descriptions and tailors your resume to highlight the most relevant skills and experiences.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Lightning Fast</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Get your optimized resume in minutes, not hours. Our streamlined process ensures quick turnaround times.
                        </p>
                    </div>

                    <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-green-50 border border-teal-100">
                        <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-6">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">LaTeX Perfect</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Maintains your LaTeX formatting while optimizing content. No broken layouts or formatting issues.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>;
};

  export default HomePage;
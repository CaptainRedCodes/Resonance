// components/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl"></div>
        <div className="relative px-6 py-16 sm:py-24 text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-8 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Welcome Message */}
          {user && (
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-blue-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Welcome back, <span className="text-blue-600 font-semibold">{user.email.split('@')[0]}</span>!
                </span>
              </div>
            </div>
          )}

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Resume</span>
            <br />
            with AI Power
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Upload your LaTeX resume and get it optimized for any job description using cutting-edge AI technology. 
            Stand out from the crowd with a perfectly tailored resume.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/upload"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Start Optimizing
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/files"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View My Files
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">Resumes Optimized</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-300"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">2 Min</div>
              <div className="text-sm text-gray-600">Average Process Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Lightning Fast Upload</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Drag and drop your LaTeX resume files (.tex) and get started in seconds. 
            Our system supports all standard LaTeX formats.
          </p>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">AI-Powered Optimization</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Advanced AI algorithms analyze job descriptions and tailor your resume 
            to highlight the most relevant skills and experiences.
          </p>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Instant Download</h3>
          <p className="text-gray-600 text-center leading-relaxed">
            Download your optimized resume in multiple formats instantly. 
            Get LaTeX source code, PDF, and Word formats ready to submit.
          </p>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your resume in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-green-300 transform -translate-y-1/2"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Upload Resume</h3>
            <p className="text-gray-600">Upload your LaTeX resume file to our secure platform</p>
          </div>

          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-300 to-purple-300 transform -translate-y-1/2"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Analysis</h3>
            <p className="text-gray-600">Our AI analyzes and optimizes your content for target jobs</p>
          </div>

          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Download Results</h3>
            <p className="text-gray-600">Get your optimized resume in multiple formats instantly</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/upload"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl mr-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Upload New Resume</h3>
              <p className="text-sm text-gray-600 mt-1">Add a new LaTeX resume file to get started</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            to="/files"
            className="group flex items-center p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl mr-4 flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Manage Files</h3>
              <p className="text-sm text-gray-600 mt-1">View and organize your resume files</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Testimonial/Social Proof */}
      <div className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by Job Seekers Worldwide</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah M.</div>
                  <div className="text-sm text-gray-600">Software Engineer</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Got 3 interview calls within a week of using the optimized resume!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Mike R.</div>
                  <div className="text-sm text-gray-600">Data Scientist</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The AI optimization perfectly highlighted my relevant skills."
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  A
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex K.</div>
                  <div className="text-sm text-gray-600">Product Manager</div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Simple, fast, and incredibly effective. Landed my dream job!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
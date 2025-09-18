// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SignUp from './components/auth/SignUp';
import SignIn from './components/auth/SignIn';
import ForgotPassword from './components/auth/ForgotPassword';
import SignInOTP from './components/auth/SignInOTP';
import Profile from './components/auth/Profile';
import HomePage from './components/HomePage';
import { UploadPage } from './components/UploadPage';
import { FilesPage } from './components/FilesPage';
import { OptimizePage } from './components/OptimizePage';
import Layout from './components/Layout';
import './index.css';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/signin-otp" element={<SignInOTP />} />
              <Route path="/home" element={<HomePage/>}/>
              {/* Protected Routes with Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="upload" element={<UploadPage />} />
                <Route path="files" element={<FilesPage />} />
                <Route path="optimize" element={<OptimizePage />} />
                <Route path="optimize/:fileId" element={<OptimizePage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="dashboard" element={<Dashboard/>}/>
              </Route>
              
              {/* Catch all route - redirect to signin */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </div>
        </Router>
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;
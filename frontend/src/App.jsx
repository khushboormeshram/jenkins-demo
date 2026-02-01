import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, TeacherRoute } from './components/ProtectedRoute'
import { NavbarDemo } from './components/nav-bardemo.jsx'
import Login from './components/auth/login.jsx'
import Signup from './components/auth/signup.jsx'
import ForgotPassword from './components/auth/forgot-password.jsx'
import GoogleOAuthTest from './components/debug/GoogleOAuthTest.jsx'
import NotFound from './components/not-found.jsx'
import Home from "./pages/Home";
import Practice from './pages/Practice.jsx';
import PracticeWorkspace from './pages/PracticeWorkspace.jsx';
import CompilerPage from './pages/Compiler.jsx';
import Contest from "./pages/Contest";
import ContestInfo from "./pages/ContestInfo";
import ContestProblem from "./pages/ContestProblem";
import Workspace from "./pages/Workspace";
import TeacherDashboard from "./pages/TeacherDashboard";
import ContestSubmissions from "./components/teacher/ContestSubmissions";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/debug/google-oauth" element={<GoogleOAuthTest />} />

          {/* Protected Routes */}
          <Route path="/practice" element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          } />
          <Route path="/practice/:problemId/workspace" element={
            <ProtectedRoute>
              <PracticeWorkspace />
            </ProtectedRoute>
          } />
          <Route path="/compiler" element={
            <ProtectedRoute>
              <CompilerPage />
            </ProtectedRoute>
          } />
          <Route path="/contest" element={
            <ProtectedRoute>
              <Contest />
            </ProtectedRoute>
          } />
          <Route path="/contest/:id" element={
            <ProtectedRoute>
              <ContestInfo />
            </ProtectedRoute>
          } />
          <Route path="/contest/:id/problems" element={
            <ProtectedRoute>
              <ContestProblem />
            </ProtectedRoute>
          } />
          <Route path="/contest/:id/problems/:pid/workspace" element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          } />

          {/* Teacher Only Routes */}
          <Route path="/teacher/dashboard" element={
            <TeacherRoute>
              <TeacherDashboard />
            </TeacherRoute>
          } />
          <Route path="/teacher/contest/:contestId/submissions" element={
            <TeacherRoute>
              <ContestSubmissions />
            </TeacherRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

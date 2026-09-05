import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

// Public Pages
import { LandingPage } from './pages/public/LandingPage'
import { LoginPage } from './pages/public/LoginPage'
import { RegisterPage } from './pages/public/RegisterPage'

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard'
import { JobsPage } from './pages/recruiter/JobsPage'
import { CreateJobPage } from './pages/recruiter/CreateJobPage'
import { JobDetailPage } from './pages/recruiter/JobDetailPage'
import { UploadResumesPage } from './pages/recruiter/UploadResumesPage'
import { CandidateRankingPage } from './pages/recruiter/CandidateRankingPage'
import { CandidateDetailPage } from './pages/recruiter/CandidateDetailPage'
import { CandidateComparisonPage } from './pages/recruiter/CandidateComparisonPage'
import { SkillGapPage } from './pages/recruiter/SkillGapPage'
import { WhatIfSimulatorPage } from './pages/recruiter/WhatIfSimulatorPage'
import { AnalyticsPage } from './pages/recruiter/AnalyticsPage'
import { InterviewQuestionsPage } from './pages/recruiter/InterviewQuestionsPage'
import { NotificationsPage } from './pages/recruiter/NotificationsPage'

// Candidate Pages
import { CandidateDashboard } from './pages/candidate/CandidateDashboard'
import { MyProfilePage } from './pages/candidate/MyProfilePage'
import { MyResumePage } from './pages/candidate/MyResumePage'
import { ResumeAnalysisPage } from './pages/candidate/ResumeAnalysisPage'
import { ResumeQualityPage } from './pages/candidate/ResumeQualityPage'
import { ATSScorePage } from './pages/candidate/ATSScorePage'
import { RecommendedJobsPage } from './pages/candidate/RecommendedJobsPage'
import { ApplicationsPage } from './pages/candidate/ApplicationsPage'
import { InterviewPrepPage } from './pages/candidate/InterviewPrepPage'
import { CandidateSettingsPage } from './pages/candidate/CandidateSettingsPage'

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { UserManagementPage } from './pages/admin/UserManagementPage'
import { JobManagementPage } from './pages/admin/JobManagementPage'
import { AuditLogsPage } from './pages/admin/AuditLogsPage'
import { SettingsPage } from './pages/admin/SettingsPage'

function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Recruiter Routes */}
        <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']} />}>
          <Route index element={<RecruiterDashboard />} />
          <Route path="dashboard" element={<Navigate to="/recruiter" replace />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/create" element={<CreateJobPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="upload" element={<UploadResumesPage />} />
          <Route path="ranking" element={<CandidateRankingPage />} />
          <Route path="candidates" element={<CandidateRankingPage />} />
          <Route path="candidates/:id" element={<CandidateDetailPage />} />
          <Route path="compare" element={<CandidateComparisonPage />} />
          <Route path="skill-gap" element={<SkillGapPage />} />
          <Route path="what-if" element={<WhatIfSimulatorPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="interview-questions/:id" element={<InterviewQuestionsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>
        <Route path="/recruiter/dashboard" element={<Navigate to="/recruiter" replace />} />

        {/* Candidate Routes */}
        <Route path="/candidate" element={<ProtectedRoute allowedRoles={['candidate', 'admin']} />}>
          <Route index element={<CandidateDashboard />} />
          <Route path="dashboard" element={<Navigate to="/candidate" replace />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="resume" element={<MyResumePage />} />
          <Route path="analysis" element={<ResumeAnalysisPage />} />
          <Route path="quality" element={<ResumeQualityPage />} />
          <Route path="ats-score" element={<ATSScorePage />} />
          <Route path="recommended-jobs" element={<RecommendedJobsPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="interview-prep" element={<InterviewPrepPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<CandidateSettingsPage />} />
        </Route>
        <Route path="/candidate/dashboard" element={<Navigate to="/candidate" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="jobs" element={<JobManagementPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

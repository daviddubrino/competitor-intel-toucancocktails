import { Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MessagesPage from './pages/MessagesPage'
import MessageDetail from './pages/MessageDetail'
import CompetitorPage from './pages/CompetitorPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AddMessagePage from './pages/AddMessagePage'
import UnmatchedPage from './pages/UnmatchedPage'

export default function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:id" element={<MessageDetail />} />
          <Route path="/competitor/:id" element={<CompetitorPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/add" element={<AddMessagePage />} />
          <Route path="/unmatched" element={<UnmatchedPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

import { Routes, Route } from 'react-router-dom'
import Layout from './app/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Faves from './pages/Faves'
import Account from './pages/Account'
import History from './pages/History'
import SeekerDetail from './pages/SeekerDetail'
import SwipeMode from './pages/SwipeMode'
import Messages from './pages/Messages'
import Checklist from './pages/Checklist/Checklist'
import BulletinBoard from './pages/BulletinBoard'
import BillboardUpload from './pages/billboard/Upload'
import BillboardEdit from './pages/billboard/Edit'

function App() {
  return (
    <Routes>
      {/* Public authentication routes */}
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      } />
      <Route path="/register" element={
        <ProtectedRoute requireAuth={false}>
          <Register />
        </ProtectedRoute>
      } />
      
      {/* Layout with mixed public/protected routes */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/" element={<Home />} />
            <Route path="/swipe" element={<SwipeMode />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/bulletin" element={<BulletinBoard />} />
            <Route path="/billboard/upload" element={<BillboardUpload />} />
            <Route path="/billboard/edit/:id" element={<BillboardEdit />} />
            <Route path="/faves" element={<Faves />} />
            <Route path="/history" element={<History />} />
            <Route path="/seeker/:id" element={<SeekerDetail />} />
            
            {/* Protected routes - authentication required */}
            <Route path="/messages" element={
              <ProtectedRoute requireAuth={true}>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute requireAuth={true}>
                <Account />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

export default App
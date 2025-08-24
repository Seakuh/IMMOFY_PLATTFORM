import { Routes, Route } from 'react-router-dom'
import Layout from './app/Layout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Faves from './pages/Faves'
import Account from './pages/Account'
import History from './pages/History'
import SeekerDetail from './pages/SeekerDetail'
import SwipeMode from './pages/SwipeMode'
import Messages from './pages/Messages'
import Checklist from './pages/Checklist/Checklist'
import BulletinBoard from './pages/BulletinBoard'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/swipe" element={<SwipeMode />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/bulletin" element={<BulletinBoard />} />
        <Route path="/faves" element={<Faves />} />
        <Route path="/account" element={<Account />} />
        <Route path="/history" element={<History />} />
        <Route path="/seeker/:id" element={<SeekerDetail />} />
      </Routes>
    </Layout>
  )
}

export default App
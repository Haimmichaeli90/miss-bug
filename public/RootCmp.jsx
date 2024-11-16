const Router = ReactRouterDOM.HashRouter
const { Route, Routes } = ReactRouterDOM

import { AppHeader } from './cmps/AppHeader.jsx'
import { AppFooter } from './cmps/AppFooter.jsx'
import { HomePage } from './pages/HomePage.jsx'
import { AboutUs } from './pages/AboutUs.jsx'
import { BugIndex } from './pages/BugIndex.jsx'
import { BugDetails } from './pages/BugDetails.jsx'
import { UserProfile } from './pages/UserProfile.jsx'
import { AdminDashboard } from './pages/AdminDashboard.jsx'


export function App() {
  return (
    <Router>
      <div className='app-container'>
        <AppHeader />
        <main>
          <Routes>
            <Route element={<HomePage />} path={'/'} />
            <Route element={<BugIndex />} path={'/bug'} />
            <Route element={<BugDetails />} path={'/bug/:bugId'} />
            <Route element={<AboutUs />} path={'/about'} />
            <Route element={<UserProfile />} path={'/user'} />
            <Route element={<AdminDashboard />} path={'/admin'} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </Router>
  )
}

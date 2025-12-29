import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import './login.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Plays from './pages/Plays'
import Tickets from './pages/Tickets'
import Seating from './pages/seating'
import Payment from './pages/Payment'
import BookingConfirmed from './pages/BookingConfirmed'
import UserProfile from './pages/Userdetail'
import ProtectedRoute from './components/ProtectedRoute'

// Admin imports
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import PlaysManagement from './admin/pages/PlaysManagement'
import SchedulesManagement from './admin/pages/SchedulesManagement'
import UsersManagement from './admin/pages/UsersManagement'
import OrdersManagement from './admin/pages/OrdersManagement'

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: isAdminRoute ? 0 : 16 }}>
      {!isAdminRoute && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plays" element={<Plays />} />
        <Route path='/plays/:id' element={<Tickets />} />

        {/* Protected user routes */}
        <Route path="/seating" element={
          <ProtectedRoute>
            <Seating />
          </ProtectedRoute>
        } />
        <Route path='/payment' element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path='/booking-confirmed' element={
          <ProtectedRoute>
            <BookingConfirmed />
          </ProtectedRoute>
        } />
        <Route path='/profile' element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />

        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="plays" element={<PlaysManagement />} />
          <Route path="schedules" element={<SchedulesManagement />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="orders" element={<OrdersManagement />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Footer/>}
    </div>
  )
} 
import { Routes, Route, Link } from 'react-router-dom'
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
import UserProfile from './pages/Userdetail'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <Header>
        <Link to="/">Home</Link>
        <Link to="/plays">Plays</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/profile">My Account</Link>
      </Header>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plays" element={<Plays />} />
        <Route path='/plays/:id' element={<Tickets />} />
        <Route path="/seating" element={<Seating />} />
        <Route path='/payment' element={<Payment />} />
        <Route path='/profile' element={<UserProfile />} />
      </Routes>
      
      <Footer/>
    </div>
  )
} 
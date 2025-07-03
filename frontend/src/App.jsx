import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import LoginPage from './pages/LoginPage';
// import ServicesPage from './pages/ServicesPage'; 

import ServiceDashboard from "./pages/ServiceDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="*" element={<LoginPage />} /> {/* 默认显示 LoginPage */}
        {/* <Route path="/services" element={<ServicesPage />} /> */}
        
        <Route path="/admin/services" element={<ServiceDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

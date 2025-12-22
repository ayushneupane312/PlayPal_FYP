import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage"
import LandingPage from "./pages/LandingPage";
import Navbar from "./pages/Navbar.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AdminDashboard from "./SuperAdmin/AdminDashboard.jsx";
import FutsalCenter from "./Players/FutsalCenter.jsx";
import UserDirectory from "./SuperAdmin/UserDirectory.jsx";
import NotificationsCenter from "./pages/NotificationsCenter.jsx";
import Payment from "./pages/Payment.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgetPassword.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import AdminSidebar from "./SuperAdmin/AdminSidebar.jsx";
import FutsalOwner from "./FutsalOwner/FutsalOwner.jsx";
import FraudDetection from "./SuperAdmin/FraudDetection.jsx";
import Analytics from "./SuperAdmin/Analytics.jsx";
import SystemSettings from "./SuperAdmin/SystemSettings.jsx"
import PlayerDashboard from "./Players/PlayerDashboard.jsx";




function App() {
  const location = useLocation();

  const showNavbar = ["/", "/login", "/signup"]. includes(location.pathname);
  return (

    <div className="min-h-screen bg-[#17153B] flex flex-col">

    
    {showNavbar && <Navbar />}

    <div className="flex-1">
    <Routes>

      {/* <Route
          path="/signup"
          element={
            <RedirectAuthenticatedUser>
              <SignUpPage />
            </RedirectAuthenticatedUser>
          }
        />
   
        <Route
          path="/login"
          element={
            <RedirectAuthenticatedUser>
              <LoginPage />
            </RedirectAuthenticatedUser>
          }
        /> */}
      <Route path="*" element={<Navigate to="/" replace />} />

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/admin/futsal-centers" element={<FutsalCenter />} />
      
      <Route path="/admin/user-management" element={<UserDirectory />} />
      <Route path="/NotificationsCenter" element={<NotificationsCenter />} />
      <Route path="/Payment" element={<Payment />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/forgetpassword" element={<ForgotPassword />}/>
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      <Route path="/FutsalOwner" element={<FutsalOwner/>} />

      <Route path="/AdminSidebar" element={<AdminSidebar/>} />
      <Route path="/admin/fraud-detection" element={<FraudDetection/>}/>
      <Route path="/admin/analytics" element={<Analytics/>}/>
      <Route path="/admin/settings" element={<SystemSettings/>}/>


      <Route path="/playerdashboard" element={<PlayerDashboard/>}/>

    
   
     
    
    </Routes>
    </div>

  </div>




    
  
  );
}

export default App;
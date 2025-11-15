import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage"
import LandingPage from "./pages/LandingPage";
import Navbar from "./pages/Navbar.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import FutsalCenter from "./pages/FutsalCenter.jsx";
import SystemSetting from "./pages/SystemSetting.jsx";
import UserDirectory from "./pages/UserDirectory.jsx";
import NotificationsCenter from "./pages/NotificationsCenter.jsx";
import Payment from "./pages/Payment.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgetPassword.jsx";
function App() {
  return (

    <>
    <Navbar />
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

      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/futsalcenter" element={<FutsalCenter />} />
      <Route path="/systemsettings" element={<SystemSetting />} />
      <Route path="/usermanagemnet" element={<UserDirectory />} />
      <Route path="/NotificationsCenter" element={<NotificationsCenter />} />
      <Route path="/Payment" element={<Payment />} />
      <Route path="/ResetPassword" element={<ResetPassword />} />
      <Route path="/ForgetPassword" element={<ForgotPassword />}/>
   
     
    
    </Routes>

    </>

    // <Toaster />


    
  
  );
}

export default App;
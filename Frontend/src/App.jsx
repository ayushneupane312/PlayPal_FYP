import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage"
import LandingPage from "./pages/LandingPage";
import Navbar from "./pages/Navbar.jsx";
import SignupPage from "./pages/SignupPage.jsx";



import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgetPassword.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";

import FutsalOwner from "./FutsalOwner/FutsalOwner.jsx";

import PlayerDashboard from "./Players/PlayerDashboard.jsx";
import BookingPage from "./Players/BookingPage.jsx";
import PaymentPage from "./Players/SplitPaymentPage.jsx";
import HighlightsPage from "./Players/HighlightsPage.jsx";
import HealthPage from "./Players/HealthPage.jsx";
import FormPage from "./FutsalOwner/FormPage.jsx";
import VenuePage from "./FutsalOwner/VenuePage.jsx";
import CostAndPricing from "./FutsalOwner/CourtsAndPricing.jsx";
import FutsalBooking from "./FutsalOwner/FutsalBooking.jsx";
import Tournaments from "./FutsalOwner/Tournaments.jsx";
import FutsalFacilities from "./FutsalOwner/FutsalFacilities.jsx";
import FutsalOwnerSettings from "./FutsalOwner/FutsalOwnerSettings.jsx";
import EarningPage from "./FutsalOwner/EarningsPage.jsx";
import ToastProvider from "./FutsalOwner/components/ToastProvider.jsx";

import PlayerSettings from "./Players/PlayerSettings.jsx";
import PlayersTournaments from "./Players/PlayersTournaments.jsx";

import FutsalOwnerDetails from "./SuperAdmin/FutsalOwnerDetails.jsx";
import FutsalOwnerApproval from "./SuperAdmin/FutsalOwnerApproval.jsx";
import AdminDashboard from "./SuperAdmin/AdminDashboard.jsx";
import FutsalCenter from "./SuperAdmin/FutsalCenter.jsx";
import UserDirectory from "./SuperAdmin/UserDirectory.jsx";
import Analytics from "./SuperAdmin/Analytics.jsx";
import SystemSettings from "./SuperAdmin/SystemSettings.jsx"
import AdminSidebar from "./SuperAdmin/AdminSidebar.jsx";





function App() {
  const location = useLocation();

  const showNavbar = ["/", "/login", "/signup"]. includes(location.pathname);
  return (
    <ToastProvider> 

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
     
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/forgetpassword" element={<ForgotPassword />}/>
      <Route path="/verify-email" element={<EmailVerificationPage />} />

      <Route path="/FutsalOwner" element={<FutsalOwner/>} />
      <Route path="/FormPage" element={<FormPage/>} />
      <Route path="/VenuePage" element={<VenuePage/>} />
      <Route path="/CourtsAndPricing" element={<CostAndPricing/>} />
      <Route path="/FutsalBooking" element={<FutsalBooking/>}/>
      <Route path="/Tournaments" element={<Tournaments/>}/>
      <Route path="/FutsalFacilities" element={<FutsalFacilities/>}/>
      <Route path="/FutsalOwnerSettings" element={<FutsalOwnerSettings/>} />
      <Route path="/EarningsPage" element={<EarningPage/>}/>
      <Route path="/futsalownerdetails/:id" element={<FutsalOwnerDetails/>} />






    
      

      <Route path="/admin/futsal-centers" element={<FutsalCenter />} />
      <Route path="/admin/user-management" element={<UserDirectory />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/AdminSidebar" element={<AdminSidebar/>} />
      <Route path="/admin/futsalownerapproval" element={<FutsalOwnerApproval/>} />
      <Route path="/admin/analytics" element={<Analytics/>}/>
      <Route path="/admin/settings" element={<SystemSettings/>}/>



      <Route path="/playerdashboard" element={<PlayerDashboard/>}/>
      <Route path="/BookingPage" element={<BookingPage/>}/>
      <Route path="/SplitPaymentPage" element={<PaymentPage/>}/>
      <Route path="/HighlightsPage" element={<HighlightsPage/>}/>
      <Route path="/HealthPage" element={<HealthPage/>}/>
      <Route path="/PlayerSettings" element={<PlayerSettings/>} />
      <Route path="/PlayersTournaments" element={<PlayersTournaments/>} />

      

    
   
     
    
    </Routes>
    </div>

  </div>
   </ToastProvider>




    
  
  );
}

export default App;
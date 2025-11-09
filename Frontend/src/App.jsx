import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage"
import LandingPage from "./pages/LandingPage";
import Navbar from "./pages/Navbar.jsx";
import SignupPage from "./pages/SignupPage.jsx";






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
   
     
    
    </Routes>

    </>

    // <Toaster />


    
  
  );
}

export default App;
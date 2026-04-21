import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore"; 

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
import HighlightsPage from "./Players/HighlightsPage.jsx";
import HealthPage from "./Players/HealthPage.jsx";
import VenueDetailsPage from "./Players/VenueDetailsPage.jsx";

import FormPage from "./FutsalOwner/FormPage.jsx";
import VenuePage from "./FutsalOwner/VenuePage.jsx";
import CostAndPricing from "./FutsalOwner/CourtsAndPricing.jsx";
import FutsalBooking from "./FutsalOwner/FutsalBooking.jsx";
import Tournaments from "./FutsalOwner/Tournaments.jsx";
import TournamentList from "./FutsalOwner/TournamentList.jsx";
import OwnerTournamentDetailPage from "./FutsalOwner/OwnerTournamentDetailPage.jsx";
import FutsalFacilities from "./FutsalOwner/FutsalFacilities.jsx";
import FutsalOwnerSettings from "./FutsalOwner/FutsalOwnerSettings.jsx";
import EarningPage from "./FutsalOwner/EarningsPage.jsx";
import ToastProvider from "./FutsalOwner/components/ToastProvider.jsx";
import OwnerDetailPage from "./FutsalOwner/OwnerDetailPage.jsx";



import PlayerSettings from "./Players/PlayerSettings.jsx";
import PlayersTournaments from "./Players/PlayersTournaments.jsx";
import PlayerTournamentDetailPage from "./Players/PlayerTournamentDetailPage.jsx";
import PlayerTournamentRegisterPage from "./Players/PlayerTournamentRegisterPage.jsx";
import VenuesPage from "./Players/VenuesPage.jsx";
import BookVenuePage from "./Players/BookVenuePage.jsx";
import PaymentCallbackPage from "./Players/PaymentCallbackPage.jsx";
import SplitPaymentCallbackPage from "./Players/SplitPaymentCallbackPage.jsx";
import SplitPaymentPage from "./Players/SplitPaymentPage.jsx";
import BookingDetailPage from "./Players/BookingDetailsPage.jsx";
import BookingList from "./Players/BookingList.jsx"
import PlayerProfilePage from "./Players/PlayerProfilePage.jsx";

import MatchmakingDashboard from "./Players/TeamMatchMaking/MatchMakingDashboard.jsx";
import MyTeamsPage from "./Players/TeamMatchMaking/MyTeamsPage.jsx";
import TeamDetailPage from "./Players/TeamMatchMaking/TeamDetailPage.jsx";
import ConfirmBookingPage from "./Players/TeamMatchMaking/ConfirmBookingPage.jsx";
import CreateTeamPage from "./Players/TeamMatchMaking/CreateTeamPage.jsx";
import SoloQueuePage from "./Players/TeamMatchMaking/SoloQueuePage.jsx";
import BrowseTeamsPage from "./Players/TeamMatchMaking/BrowseTeamsPage.jsx";
import BrowsePlayersPage from "./Players/TeamMatchMaking/BrowsePlayerPage.jsx";
import TeamInvitePage from "./Players/TeamMatchMaking/TeamInvitePage.jsx";
import MyInvitationPage from "./Players/TeamMatchMaking/MyInvitationPage.jsx";

import BrowseOpponentPage from "./Players/TeamMatchMaking/BrowseOpponentPage.jsx";
import MatchDetailPage from "./Players/TeamMatchMaking/MatchDetailPage.jsx";
import MyChallengesPage from "./Players/TeamMatchMaking/MyChallangesPage.jsx";

import FutsalOwnerApproval from "./SuperAdmin/FutsalOwnerApproval.jsx";
import AdminDashboard from "./SuperAdmin/AdminDashboard.jsx";
import FutsalCenter from "./SuperAdmin/FutsalCenter.jsx";
import UserDirectory from "./SuperAdmin/UserDirectory.jsx";
import Analytics from "./SuperAdmin/Analytics.jsx";
import SystemSettings from "./SuperAdmin/SystemSettings.jsx"
import ApplicationStatus from "./FutsalOwner/ApplicationStatus.jsx";
import HelpPage from "./pages/HelpPage.jsx";
import GlobalSearchPage from "./pages/GlobalSearchPage.jsx";
import VenueDashboard from "./FutsalOwner/VenueDashboard.jsx";
import BookingManagementPage from "./FutsalOwner/BookingManagementPage.jsx";
import OwnerBookingDetailPage from "./FutsalOwner/OwnerBookingDetailPage.jsx";

import TournamentBracket from "./FutsalOwner/TournamentSchedule/TournamentBracket.jsx";

import CheckoutPage from "./Khalti/CheckoutPage.jsx";
import PaymentCallback from "./Khalti/PaymentCallback.jsx";


function App() {
  const location = useLocation();
  
  // ✅ Get checkAuth and isCheckingAuth from store
  const { checkAuth, isCheckingAuth } = useAuthStore();

  // Check authentication on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const showNavbar = ["/login", "/signup"].includes(location.pathname);

  // ✅ Show loading spinner while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#17153B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider> 
      <div className="min-h-screen bg-[#17153B] flex flex-col">
        {showNavbar && <Navbar />}
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgetpassword" element={<ForgotPassword />}/>
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/search" element={<GlobalSearchPage />} />

            {/* Futsal Owner Routes */}
            <Route path="/futsalownerdashboard" element={<FutsalOwner/>} />
            <Route path="/FormPage" element={<FormPage/>} />
            <Route path="/futsalowner/VenuePage" element={<VenuePage/>} />
            <Route path="/futsalowner/CourtsAndPricing" element={<CostAndPricing/>} />
            <Route path="/FutsalBooking" element={<FutsalBooking/>}/>
            <Route path="/futsalowner/my-tournaments" element={<TournamentList/>}/>
            <Route path="/futsalowner/my-tournaments/:id" element={<OwnerTournamentDetailPage/>}/>
            <Route path="/futsalowner/Tournaments" element={<Tournaments/>}/>
            <Route path="/FutsalFacilities" element={<FutsalFacilities/>}/>
            <Route path="/FutsalOwnerSettings" element={<FutsalOwnerSettings/>} />
            <Route path="/EarningsPage" element={<EarningPage/>}/>
            <Route path="/futsalownerdetails/:id" element={<OwnerDetailPage/>} />
            <Route path="/applicationstatus" element={<ApplicationStatus/>}/>
            <Route path="/futsalowner/myvenue" element={<VenueDashboard/>}/>
            <Route path="/futsalowner/booking-management" element={<BookingManagementPage/>}/>
            <Route path="/futsalowner/booking-management/:id" element={<OwnerBookingDetailPage/>}/>
          
            {/* Admin Routes */}
            <Route path="/admin/futsal-centers" element={<FutsalCenter />} />
            <Route path="/admin/user-management" element={<UserDirectory />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/admin/futsalownerapproval" element={<FutsalOwnerApproval/>} />
            <Route path="/admin/analytics" element={<Analytics/>}/>
            <Route path="/admin/settings" element={<SystemSettings/>}/>

            {/* Player Routes */}
            <Route path="/playerdashboard" element={<PlayerDashboard/>}/>
            <Route path="/player/venues" element={<VenuesPage/>}/>
            <Route path="/player/venue/:venueId/book" element={<BookVenuePage/>}/>
            <Route path="/booking/payment-callback" element={<PaymentCallbackPage/>}/>
            <Route path="/player/booking/payment-callback" element={<PaymentCallbackPage/>}/>
            <Route path="/player/booking/split-payment-callback" element={<SplitPaymentCallbackPage/>}/>
            <Route path="/player/booking/split/:bookingId" element={<SplitPaymentPage/>}/>
            <Route path="/player/bookings" element={<BookingPage/>}/>
            <Route path="/help" element={<HelpPage />} />
            <Route path="/HighlightsPage" element={<HighlightsPage/>}/>
            <Route path="/HealthPage" element={<HealthPage/>}/>
            <Route path="/PlayerSettings" element={<PlayerSettings/>} />
            <Route path="/PlayersTournaments" element={<PlayersTournaments/>} />
            <Route path="/PlayersTournaments/:id" element={<PlayerTournamentDetailPage/>} />
            <Route path="/PlayersTournaments/:id/register" element={<PlayerTournamentRegisterPage/>} />
            <Route path="/player/mybookings" element={<BookingList/>} />
            <Route path="/player/bookings/:id" element={<BookingDetailPage />} />
            <Route path="/player/venues/:id" element={<VenueDetailsPage />} />
            <Route path="/player/profile" element={<PlayerProfilePage />} />
            <Route path="/player/profile/:playerId" element={<PlayerProfilePage />} />


            {/* Matchmaking */}
            <Route path="/player/matchmaking" element={<MatchmakingDashboard />} />
            <Route path="/player/matchmaking/create-team" element={<CreateTeamPage />} />
            <Route path="/player/matchmaking/solo-queue" element={<SoloQueuePage />} />
            <Route path="/player/matchmaking/browse-teams" element={<BrowseTeamsPage />} />
            <Route path="/player/matchmaking/browse-players" element={<BrowsePlayersPage />} />
            <Route path="/player/teams" element={<MyTeamsPage />} />
            <Route path="/player/teams/:id" element={<TeamDetailPage />} />
            <Route path="/player/teams/:teamId/confirm-booking" element={<ConfirmBookingPage />} />

            <Route path="/player/team-invite/:teamId" element={<TeamInvitePage />} />   
            <Route path="/player/my-invitations" element={<MyInvitationPage />} />
            
            <Route path="/player/matchmaking/browse-opponents" element={<BrowseOpponentPage />} />
            <Route path="/player/matches/challenges"           element={<MyChallengesPage />} />
            <Route path="/player/matches/:matchId"             element={<MatchDetailPage />} />


            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />

            <Route path="/tournament/tournament-bracket" element={<TournamentBracket />} />
            <Route path="/futsalowner/my-tournaments/:id/schedule" element={<TournamentBracket />} />

            {/* Catch-all route - MUST BE LAST */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;

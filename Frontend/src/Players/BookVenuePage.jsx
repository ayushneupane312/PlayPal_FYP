// src/pages/player/BookVenuePage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerSidebar from './PlayerSidebar';
import {
  Calendar, Clock, MapPin, Users, CreditCard, Loader2, AlertCircle,
  CheckCircle, ArrowLeft, ChevronRight, Info, Banknote, Wallet, Smartphone
} from 'lucide-react';
import { showToast } from '../FutsalOwner/components/Toast';
import ConfirmationModal from '../components/ConfirmationModel';
import { getVenueById } from '../store/venueService';
import { getAvailableSlots, createBooking, initiatePayment, initiateEsewaPayment } from '../store/bookingStore';

function bookingErrorMessage(err) {
  if (!err) return 'Something went wrong.';
  if (typeof err === 'string') return err;
  if (err.response?.data?.message) return err.response.data.message;
  if (typeof err.message === 'string' && err.message) return err.message;
  return 'Something went wrong.';
}

/** eSewa ePay V2 expects a real HTML form POST */
function submitEsewaForm(gatewayUrl, fields) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = gatewayUrl;
  form.acceptCharset = 'UTF-8';
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value === undefined || value === null ? '' : String(value);
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

const BookVenuePage = () => {
  const { venueId } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  // Booking form state
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(10);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashSplitEnabled, setCashSplitEnabled] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const splittingCount = Math.min(20, Math.max(1, Number(numberOfPlayers) || 1));
  const courtFeeTotal = Number(selectedSlot?.price);
  const sharePerPlayerPreview =
    Number.isFinite(courtFeeTotal) && courtFeeTotal > 0
      ? Math.round((courtFeeTotal / splittingCount) * 100) / 100
      : null;

  useEffect(() => {
    if (paymentMethod !== 'cash') setCashSplitEnabled(false);
  }, [paymentMethod]);

  useEffect(() => {
    if (!venueId) {
      navigate('/player/venues');
    } else {
      fetchVenue();
    }
  }, [venueId, navigate]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchVenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVenueById(venueId);
      if (!response.data) {
        throw new Error('Venue not found');
      }
      setVenue(response.data);
    } catch (err) {
      console.error('❌ Fetch venue error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch venue';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await getAvailableSlots(venueId, selectedCourt._id, selectedDate);
      setAvailableSlots(response.data?.availableSlots || []);
      setBookedSlots(response.data?.bookedSlots || []);
    } catch (err) {
      console.error('❌ Fetch slots error:', err);
      setAvailableSlots([]);
      setBookedSlots([]);
      showToast.error('Failed to load time slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleCourtSelect = (court) => {
    setSelectedCourt(court);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setBookedSlots([]);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedCourt) {
      setStep(2);
    } else if (step === 2 && selectedDate && selectedSlot) {
      setStep(3);
    } else if (step === 3 && paymentMethod) {
      setStep(4);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleBooking = () => {
    setShowConfirmModal(true);
  };

  const confirmAndCreateBooking = async () => {
    try {
      setProcessing(true);
      setError(null);

      const bookingData = {
        venueId,
        courtId: selectedCourt._id,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration: 1,
        numberOfPlayers: splittingCount,
        specialRequests,
        paymentMethod,
        cashSplitAmongPlayers: paymentMethod === 'cash' && cashSplitEnabled
      };

      const bookingResponse = await createBooking(bookingData);
      const bookingDoc = bookingResponse?.data;
      const bookingId = bookingDoc?._id;

      if (!bookingId) {
        const m = bookingResponse?.message || 'Server did not return a booking. Check pricing and try again.';
        setError(m);
        showToast.error(m);
        setProcessing(false);
        return;
      }

      if (paymentMethod === 'khalti') {
        try {
          const paymentResponse = await initiatePayment(bookingId);
          const payUrl =
            paymentResponse.data?.paymentUrl || paymentResponse.data?.payment_url;
          if (!payUrl) {
            const m =
              'Khalti did not return a payment link. Try eSewa or cash, or set KHALTI_SECRET_KEY on the server.';
            setError(m);
            showToast.error(m);
            setProcessing(false);
            return;
          }
          sessionStorage.setItem('playpal_khalti_booking_id', bookingId);
          setShowConfirmModal(false);
          window.location.href = payUrl;
          return;
        } catch (khErr) {
          const km = bookingErrorMessage(khErr);
          setError(km);
          showToast.error(
            `${km} If Khalti is not set up, choose eSewa or cash and try again.`
          );
          setProcessing(false);
          return;
        }
      }

      if (paymentMethod === 'esewa') {
        try {
          const esewaRes = await initiateEsewaPayment(bookingId);
          const d = esewaRes?.data;
          if (!d?.gatewayUrl || !d?.fields) {
            const m =
              esewaRes?.message ||
              'eSewa is not ready (set ESEWA_SECRET_KEY and ESEWA_PRODUCT_CODE in backend .env).';
            setError(m);
            showToast.error(m);
            setProcessing(false);
            return;
          }
          sessionStorage.setItem('playpal_esewa_booking_id', bookingId);
          setShowConfirmModal(false);
          submitEsewaForm(d.gatewayUrl, d.fields);
          return;
        } catch (ewErr) {
          const em = bookingErrorMessage(ewErr);
          setError(em);
          showToast.error(em);
          setProcessing(false);
          return;
        }
      }

      showToast.success('Booking created successfully! Waiting for venue approval.');
      setShowConfirmModal(false);
      setTimeout(() => {
        navigate(`/player/bookings/${bookingId}`);
      }, 1500);
    } catch (err) {
      console.error('❌ Booking error:', err);

      if (err.httpStatus === 409 || err.response?.status === 409) {
        setError('This time slot has just been booked by someone else. Please select a different time slot.');
        showToast.error('Slot already booked! Please choose another time.');
        if (selectedCourt && selectedDate) fetchAvailableSlots();
        setStep(2);
      } else {
        const msg = bookingErrorMessage(err);
        setError(msg);
        showToast.error(msg);
      }

      setProcessing(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        <div 
          className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  if (error && !venue) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <PlayerSidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        <div 
          className={`flex-1 flex items-center justify-center transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
          style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
        >
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/player/venues')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Back to Venues
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />
      
      {/* ✅ FIX: Added width calculation like PlayerDashboard */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/player/venues')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Venues
            </button>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{venue?.venueName}</h1>
                  <div className="flex items-center text-gray-600 mt-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{venue?.fullAddress}</span>
                  </div>
                </div>
                {venue?.media?.images?.[0]?.url && (
                  <img
                    src={venue.media.images[0].url}
                    alt={venue.venueName}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {[1, 2, 3, 4].map((s, idx) => (
                <div key={s} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= s ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  {idx < 3 && (
                    <div className={`w-20 h-1 mx-2 ${
                      step > s ? 'bg-emerald-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2 text-sm space-x-4">
              <span className={`w-24 text-center ${step === 1 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
                Select Court
              </span>
              <span className={`w-24 text-center ${step === 2 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
                Date & Time
              </span>
              <span className={`w-24 text-center ${step === 3 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
                Payment
              </span>
              <span className={`w-24 text-center ${step === 4 ? 'text-emerald-600 font-semibold' : 'text-gray-600'}`}>
                Confirm
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Booking Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Select Court */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Court</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {venue?.courts?.filter(court => court.isActive).map((court) => (
                  <div
                    key={court._id}
                    onClick={() => handleCourtSelect(court)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCourt?._id === court._id
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{court.name}</h3>
                      {selectedCourt?._id === court._id && (
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{court.surfaceType}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Weekday:</span> Rs. {court.pricing.weekdayRate}/hr
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Weekend:</span> Rs. {court.pricing.weekendRate}/hr
                      </p>
                      {court.pricing.peakHourRate && (
                        <p className="text-gray-700">
                          <span className="font-medium">Peak Hour:</span> Rs. {court.pricing.peakHourRate}/hr
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNextStep}
                  disabled={!selectedCourt}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Date & Time</h2>
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-800">
                  <span className="font-semibold">Selected Court:</span> {selectedCourt?.name} ({selectedCourt?.surfaceType})
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time Slots ({availableSlots.length} available, {bookedSlots.length} booked)
                  </label>
                  
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                  ) : availableSlots.length === 0 && bookedSlots.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Info className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No slots available for this date</p>
                    </div>
                  ) : (
                    <div>
                      {/* Available Slots */}
                      {availableSlots.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Available Slots</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {availableSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSlotSelect(slot)}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition-all text-center ${
                                  selectedSlot?.startTime === slot.startTime
                                    ? 'border-emerald-600 bg-emerald-50'
                                    : 'border-gray-200 hover:border-emerald-300'
                                }`}
                              >
                                <div className="font-semibold text-gray-900">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-emerald-600 font-bold mt-2">
                                  Rs. {slot.price}
                                </div>
                                {slot.isPeakHour && (
                                  <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                                    Peak Hour
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Booked Slots */}
                      {bookedSlots.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Already Booked</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {bookedSlots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 text-center opacity-60 cursor-not-allowed"
                              >
                                <div className="font-semibold text-gray-500">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                                <div className="text-red-600 text-sm mt-2">
                                  Booked
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  by {slot.bookedBy}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={!selectedDate || !selectedSlot}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Cash Payment */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Banknote className="w-8 h-8 text-emerald-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-lg">Cash Payment</h3>
                        <p className="text-sm text-gray-600">Pay at venue</p>
                      </div>
                    </div>
                    {paymentMethod === 'cash' && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Pay when you arrive at the venue</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Booking confirmed after owner approval</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>No online payment required</span>
                      </li>
                    </ul>

                    {paymentMethod === 'cash' && (
                      <div
                        className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                        onClick={(e) => e.stopPropagation()}
                        role="group"
                        aria-label="Cash split options"
                      >
                        <label className="flex items-start gap-2 cursor-pointer text-gray-800">
                          <input
                            type="checkbox"
                            checked={cashSplitEnabled}
                            onChange={(e) => setCashSplitEnabled(e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>
                            <span className="font-medium">Split the court fee equally</span> — everyone pays
                            the same share <strong>at the venue after your game</strong> (e.g. 10 or 12
                            players).
                          </span>
                        </label>

                        {cashSplitEnabled && (
                          <>
                            <div>
                              <label
                                htmlFor="split-player-count"
                                className="block text-xs font-medium text-gray-600 mb-1"
                              >
                                Number of players splitting the fee
                              </label>
                              <input
                                id="split-player-count"
                                type="number"
                                min={1}
                                max={20}
                                value={numberOfPlayers}
                                onChange={(e) => {
                                  const raw = parseInt(e.target.value, 10);
                                  if (!Number.isFinite(raw)) {
                                    setNumberOfPlayers(1);
                                    return;
                                  }
                                  setNumberOfPlayers(Math.min(20, Math.max(1, raw)));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-gray-900"
                              />
                            </div>
                            {sharePerPlayerPreview != null && (
                              <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-900">
                                <p className="font-semibold">After the game (at venue)</p>
                                <p className="mt-1">
                                  Court fee <strong>Rs. {courtFeeTotal}</strong> ÷{' '}
                                  <strong>{splittingCount}</strong> players ≈{' '}
                                  <strong>Rs. {sharePerPlayerPreview}</strong> each
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Khalti */}
                <div
                  onClick={() => setPaymentMethod('khalti')}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    paymentMethod === 'khalti'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Wallet className="w-8 h-8 text-purple-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-lg">Khalti</h3>
                        <p className="text-sm text-gray-600">Wallet / bank via Khalti</p>
                      </div>
                    </div>
                    {paymentMethod === 'khalti' && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Instant confirmation after payment</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Requires server Khalti keys</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* eSewa */}
                <div
                  onClick={() => setPaymentMethod('esewa')}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    paymentMethod === 'esewa'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Smartphone className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-lg">eSewa</h3>
                        <p className="text-sm text-gray-600">Pay with eSewa wallet</p>
                      </div>
                    </div>
                    {paymentMethod === 'esewa' && (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Good alternative if Khalti fails</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Requires ESEWA_* keys in backend .env</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    {paymentMethod === 'cash' ? (
                      <>
                        <p className="font-medium mb-1">Cash Payment Notice</p>
                        {cashSplitEnabled ? (
                          <p>
                            Your group plans to split the court fee equally after the game. The venue still
                            collects the <strong>full court fee</strong>; your team settles shares among
                            yourselves. Booking stays pending until the owner approves.
                          </p>
                        ) : (
                          <p>
                            Your booking will be pending until the venue owner confirms. Please arrive at the
                            venue on time and make the payment there.
                          </p>
                        )}
                      </>
                    ) : paymentMethod === 'khalti' ? (
                      <>
                        <p className="font-medium mb-1">Khalti</p>
                        <p>You will be redirected to Khalti. The booking is confirmed after payment succeeds.</p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium mb-1">eSewa</p>
                        <p>You will be sent to eSewa to pay. When you return, we confirm the booking using eSewa&apos;s status API.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handlePreviousStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm & Complete */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Booking</h2>

              {/* Booking Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Venue:</span>
                    <span className="font-medium">{venue?.venueName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Court:</span>
                    <span className="font-medium">{selectedCourt?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{selectedSlot?.startTime} - {selectedSlot?.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize flex items-center">
                      {paymentMethod === 'cash' ? (
                        <>
                          <Banknote className="w-4 h-4 mr-1" />
                          Cash{cashSplitEnabled ? ' (split at venue)' : ''}
                        </>
                      ) : paymentMethod === 'khalti' ? (
                        <>
                          <Wallet className="w-4 h-4 mr-1" />
                          Khalti
                        </>
                      ) : (
                        <>
                          <Smartphone className="w-4 h-4 mr-1" />
                          eSewa
                        </>
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold text-gray-900">Total Amount:</span>
                      <span className="font-bold text-emerald-600">Rs. {selectedSlot?.price}</span>
                    </div>
                    {paymentMethod === 'cash' && cashSplitEnabled && sharePerPlayerPreview != null && (
                      <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-950">
                        <p className="font-medium">Split after the game (at venue)</p>
                        <p className="mt-1">
                          ~<strong>Rs. {sharePerPlayerPreview}</strong> per person if{' '}
                          <strong>{splittingCount}</strong> players share the{' '}
                          <strong>Rs. {courtFeeTotal}</strong> court fee equally.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Players
                    {paymentMethod === 'cash' && cashSplitEnabled && (
                      <span className="text-gray-500 font-normal"> (also used for the cash split)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfPlayers}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      if (!Number.isFinite(raw)) {
                        setNumberOfPlayers(1);
                        return;
                      }
                      setNumberOfPlayers(Math.min(20, Math.max(1, raw)));
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows="3"
                    placeholder="Any special requirements or notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={handlePreviousStep}
                  disabled={processing}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleBooking}
                  disabled={processing}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center font-semibold"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'khalti' || paymentMethod === 'esewa' ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Booking
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAndCreateBooking}
        title="Confirm Booking"
        message={`Confirm booking at ${venue?.venueName} on ${new Date(selectedDate).toLocaleDateString()} from ${selectedSlot?.startTime} to ${selectedSlot?.endTime} for Rs. ${selectedSlot?.price}?`}
        confirmText={paymentMethod === 'khalti' || paymentMethod === 'esewa' ? 'Confirm & Pay' : 'Confirm Booking'}
        cancelText="Cancel"
        type="info"
        isLoading={processing}
      />
    </div>
  );
};

export default BookVenuePage;
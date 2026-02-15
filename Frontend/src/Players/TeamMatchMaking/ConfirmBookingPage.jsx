import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerSidebar from '../PlayerSidebar';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { getAllVenues } from '../../store/venueService';
import { getVenueById } from '../../store/venueService';
import { getAvailableSlots } from '../../store/bookingStore';
import { initiatePayment } from '../../store/bookingStore';
import matchmakingService from '../../store/matchmakingService';
import { showToast } from '../../FutsalOwner/components/Toast';

const ConfirmBookingPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [venue, setVenue] = useState(null);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllVenues({ limit: 100 });
        setVenues(res.data || []);
      } catch (e) {
        showToast.error('Failed to load venues');
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedVenueId) {
      setVenue(null);
      setSelectedCourt(null);
      setSlots([]);
      return;
    }
    (async () => {
      try {
        const res = await getVenueById(selectedVenueId);
        setVenue(res?.data ?? res);
        setSelectedCourt(null);
        setSlots([]);
      } catch (e) {
        setVenue(null);
      }
    })();
  }, [selectedVenueId]);

  useEffect(() => {
    if (!venue || !selectedCourt || !selectedDate) {
      setSlots([]);
      return;
    }
    (async () => {
      try {
        const res = await getAvailableSlots(selectedVenueId, selectedCourt._id, selectedDate);
        setSlots(res?.availableSlots || res?.data?.availableSlots || []);
      } catch (e) {
        setSlots([]);
      }
    })();
  }, [venue, selectedCourt, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot || !selectedCourt || !selectedDate) {
      showToast.error('Please select venue, court, date and time slot');
      return;
    }
    try {
      setLoading(true);
      const [startTime, endTime] = selectedSlot.endTime ? [selectedSlot.startTime, selectedSlot.endTime] : [selectedSlot.startTime, selectedSlot.startTime];
      const duration = selectedSlot.duration || 1;
      const res = await matchmakingService.confirmTeamBooking({
        teamId,
        venueId: selectedVenueId,
        courtId: selectedCourt._id,
        bookingDate: selectedDate,
        startTime,
        endTime,
        duration,
        paymentMethod
      });
      setCreatedBooking(res.data?.booking);
      showToast.success('Booking created');
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePayKhalti = async () => {
    if (!createdBooking?._id) return;
    try {
      const res = await initiatePayment(createdBooking._id);
      if (res?.data?.paymentUrl) window.location.href = res.data.paymentUrl;
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Payment failed');
    }
  };

  const isSidebarCollapsed = false;
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PlayerSidebar onCollapseChange={() => {}} />
      <div className={`flex-1 p-6 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`} style={{ width: `calc(100% - 16rem)` }}>
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(`/player/teams/${teamId}`)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to team
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm match booking</h1>

          {!createdBooking ? (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select venue</option>
                  {venues.map((v) => (
                    <option key={v._id} value={v._id}>{v.venueName}</option>
                  ))}
                </select>
              </div>
              {venue?.courts?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                  <select
                    value={selectedCourt?._id || ''}
                    onChange={(e) => setSelectedCourt(venue.courts.find(c => c._id === e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">Select court</option>
                    {venue.courts.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              {slots.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time slot</label>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`px-3 py-2 rounded-lg border text-sm ${selectedSlot?.startTime === slot.startTime ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300'}`}
                      >
                        {slot.startTime} {slot.price && `Rs.${slot.price}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="khalti">Khalti</option>
                  <option value="cash">Cash at venue</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create booking'}
              </button>
            </form>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">Booking created. {paymentMethod === 'khalti' ? 'Pay with Khalti to confirm.' : 'Pay at venue.'}</p>
              {paymentMethod === 'khalti' && (
                <button onClick={handlePayKhalti} className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                  Pay with Khalti
                </button>
              )}
              <button onClick={() => navigate(`/player/bookings/${createdBooking._id}`)} className="w-full mt-2 py-2 border border-gray-300 rounded-lg">
                View booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingPage;

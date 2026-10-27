import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { roomsAPI, bookingsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { IoCalendarOutline, IoPeopleOutline, IoArrowBack, IoChevronForward, IoDocumentTextOutline, IoPersonOutline, IoCardOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import './BookingPage.css';

const BookingPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guestCount = parseInt(searchParams.get('guests')) || 2;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Guest details form state
  const [guests, setGuests] = useState(
    Array.from({ length: guestCount }, (_, i) => ({
      name: i === 0 ? user?.name || '' : '',
      age: '',
      idType: i === 0 ? user?.idType || '' : '',
      idNumber: i === 0 ? user?.idNumber || '' : '',
      isPrimary: i === 0,
    }))
  );

  const [specialRequests, setSpecialRequests] = useState('');

  // Calculate pricing estimates
  const [pricing, setPricing] = useState({
    pricePerNight: 0,
    totalNights: 0,
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    if (!checkIn || !checkOut || !roomId) {
      toast.error('Missing booking search dates or room choice');
      navigate('/rooms');
      return;
    }
    fetchRoomAndPricing();
  }, [roomId, checkIn, checkOut, guestCount]);

  const fetchRoomAndPricing = async () => {
    try {
      const res = await roomsAPI.getRoomDetail(roomId);
      const roomData = res.data.data.room;
      setRoom(roomData);

      // Nights calculation
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));

      // Calculate server pricing mock-style (equivalent to backend helper)
      const basePrice = roomData.category.basePrice;
      const sub = basePrice * nights;
      const tax = Math.round(sub * 0.18);
      const tot = sub + tax;

      setPricing({
        pricePerNight: basePrice,
        totalNights: nights,
        subtotal: sub,
        taxAmount: tax,
        totalAmount: tot,
      });
    } catch (err) {
      toast.error('Error fetching room booking details');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestChange = (index, field, value) => {
    const updated = [...guests];
    updated[index][field] = value;
    setGuests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic verification
    const invalidGuest = guests.find((g) => !g.name.trim());
    if (invalidGuest) {
      toast.error('Please enter the name of all guests');
      return;
    }

    setBookingLoading(true);
    try {
      // 1. Create booking (returns booking + payment)
      const bookingRes = await bookingsAPI.create({
        roomId,
        checkIn,
        checkOut,
        guests: { adults: guestCount, children: 0 },
        specialRequests,
      });

      const { booking } = bookingRes.data.data;

      // 2. Add guest details
      await bookingsAPI.addGuests(booking._id, { guests });

      toast.success('Sanctuary booked! Proceeding to secure payment.');
      navigate(`/payment/${booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page-loading">
        <Spinner size="lg" />
        <p>Configuring sanctuary reservation parameters...</p>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <IoArrowBack /> Back to search results
        </button>

        <div className="booking-grid">
          {/* Left Side: Guest Info Input */}
          <div className="booking-form-container">
            <h1 className="booking-page-title font-display">Confirm Your Sanctuary</h1>
            <p className="booking-page-subtitle">Enter details for all guests staying in the room.</p>

            <form onSubmit={handleSubmit} className="booking-form-element">
              {guests.map((guest, idx) => (
                <div key={idx} className="guest-info-card glass">
                  <h3 className="guest-card-title">
                    <IoPersonOutline /> {idx === 0 ? 'Primary Guest (Account Holder)' : `Guest ${idx + 1}`}
                  </h3>
                  
                  <div className="guest-fields">
                    <Input
                      label="Full Name"
                      value={guest.name}
                      onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                      placeholder="Enter guest's full name"
                      required
                    />
                    <Input
                      label="Age"
                      type="number"
                      value={guest.age}
                      onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                      placeholder="Age"
                      min="0"
                      max="120"
                      required
                    />
                    <div className="input-group">
                      <label className="input-label">Identity Document Type</label>
                      <select
                        className="input-field"
                        value={guest.idType}
                        onChange={(e) => handleGuestChange(idx, 'idType', e.target.value)}
                        required={idx === 0}
                      >
                        <option value="">Select ID type</option>
                        <option value="aadhar">Aadhaar Card</option>
                        <option value="passport">Passport</option>
                        <option value="national_id">Voter ID / National ID</option>
                        <option value="driving_license">Driving License</option>
                      </select>
                    </div>
                    <Input
                      label="ID Number"
                      value={guest.idNumber}
                      onChange={(e) => handleGuestChange(idx, 'idNumber', e.target.value)}
                      placeholder="ID Number"
                      required={idx === 0}
                    />
                  </div>
                </div>
              ))}

              <div className="special-requests-card glass">
                <h3 className="guest-card-title">
                  <IoDocumentTextOutline /> Special Requests & Notes
                </h3>
                <Input
                  type="textarea"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="E.g., early check-in preference, dietary requests, pillow type choice, flower setup, etc."
                />
              </div>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                fullWidth
                loading={bookingLoading}
                className="booking-submit-btn"
              >
                Confirm Sanctuary & Pay ₹{pricing.totalAmount.toLocaleString()} <IoChevronForward />
              </Button>
            </form>
          </div>

          {/* Right Side: Stay Summary and Price breakdown */}
          <div className="booking-summary-sidebar">
            <div className="summary-card glass">
              <h2 className="summary-title font-heading">Stay Summary</h2>

              <div className="summary-room-info">
                <div className="summary-room-placeholder">
                  {room.category.name.charAt(0)}
                </div>
                <div className="summary-room-details">
                  <h3>{room.category.name}</h3>
                  <p>Room Number: <strong>{room.roomNumber}</strong> (Floor {room.floor})</p>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-dates">
                <div className="date-block">
                  <span className="date-label">Check-In</span>
                  <span className="date-value">{new Date(checkIn).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="date-time">From 2:00 PM</span>
                </div>
                <div className="date-arrow">→</div>
                <div className="date-block">
                  <span className="date-label">Check-Out</span>
                  <span className="date-value">{new Date(checkOut).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="date-time">Before 11:00 AM</span>
                </div>
              </div>

              <div className="summary-details-list">
                <div className="summary-detail-item">
                  <IoPeopleOutline />
                  <span>{guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                <div className="summary-detail-item">
                  <IoCalendarOutline />
                  <span>{pricing.totalNights} {pricing.totalNights === 1 ? 'Night' : 'Nights'}</span>
                </div>
              </div>

              <div className="summary-divider" />

              {/* Price Breakdown */}
              <h3 className="breakdown-title font-heading">Price Breakdown</h3>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span>₹{pricing.pricePerNight.toLocaleString()} × {pricing.totalNights} nights</span>
                  <span>₹{pricing.subtotal.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Resort Service Tax (18%)</span>
                  <span>₹{pricing.taxAmount.toLocaleString()}</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total Booking Amount</span>
                  <span>₹{pricing.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-cancellation-policy">
                <h4>Cancellation Policy</h4>
                <p>Free cancellation up to 24 hours before check-in. Cancellations within 24 hours are subject to a 20% penalty fee.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

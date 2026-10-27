import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI, paymentsAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoCardOutline, IoChevronForwardCircleOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import './PaymentPage.css';

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Simulation switches
  const [willSucceed, setWillSucceed] = useState(true);

  useEffect(() => {
    fetchBookingAndPayment();
  }, [bookingId]);

  const fetchBookingAndPayment = async () => {
    try {
      const res = await bookingsAPI.getDetail(bookingId);
      setBooking(res.data.data.booking);

      // Initiate payment in backend
      const payRes = await paymentsAPI.initiate({
        bookingId,
        method: 'mock',
      });
      setPaymentDetails(payRes.data.data);
    } catch (err) {
      toast.error('Could not initiate payment session');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    setProcessing(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const txId = willSucceed ? `TXN_${Date.now()}` : '';
      const gatewayResponse = willSucceed 
        ? { transactionId: txId, method: paymentMethod }
        : { error: 'Customer cancelled transaction or card declined' };

      const verifyRes = await paymentsAPI.verify({
        paymentId: booking.payment,
        gatewayResponse,
      });

      if (verifyRes.data.data.payment.status === 'successful') {
        toast.success('Payment verified! Booking confirmed.');
        navigate(`/my-bookings/${bookingId}`);
      } else {
        toast.error('Payment failed: Card was declined or cancelled.');
        navigate(`/my-bookings/${bookingId}`);
      }
    } catch (err) {
      toast.error('Payment verification failed server-side');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page-loading">
        <Spinner size="lg" />
        <p>Connecting to secure payment gateway...</p>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container-sm">
        <div className="payment-card glass">
          <div className="payment-header">
            <IoCardOutline className="pay-card-icon" />
            <h1 className="payment-title font-heading">Secure Payment Gateway</h1>
            <p className="payment-subtitle">AJIIS RESORT Booking checkout portal</p>
          </div>

          <div className="booking-summary-box">
            <div className="sum-row">
              <span>Booking Code</span>
              <strong>{booking.bookingCode}</strong>
            </div>
            <div className="sum-row">
              <span>Sanctuary Room</span>
              <span>{booking.category.name} ({booking.room.roomNumber})</span>
            </div>
            <div className="sum-row">
              <span>Nights Stay</span>
              <span>{booking.totalNights} Nights</span>
            </div>
            <div className="sum-divider" />
            <div className="sum-row total">
              <span>Amount Payable</span>
              <strong>₹{booking.totalAmount.toLocaleString()}</strong>
            </div>
          </div>

          <div className="payment-options">
            <h3 className="options-title font-heading">Choose Payment Method</h3>
            <div className="options-grid">
              {['card', 'upi', 'net_banking'].map((method) => (
                <label key={method} className={`option-label ${paymentMethod === method ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="pay-method"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method.replace('_', ' ').toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Simulation Tools */}
          <div className="simulation-box">
            <p className="sim-title">GATEWAY SIMULATOR</p>
            <div className="sim-toggle-buttons">
              <button
                type="button"
                className={`sim-btn success ${willSucceed ? 'active' : ''}`}
                onClick={() => setWillSucceed(true)}
              >
                <IoCheckmarkCircle /> Simulate Success
              </button>
              <button
                type="button"
                className={`sim-btn fail ${!willSucceed ? 'active' : ''}`}
                onClick={() => setWillSucceed(false)}
              >
                <IoCloseCircle /> Simulate Decline/Fail
              </button>
            </div>
          </div>

          {processing ? (
            <div className="processing-indicator">
              <Spinner size="md" />
              <p>Authorizing transaction, do not refresh or close window...</p>
            </div>
          ) : (
            <Button
              variant="accent"
              size="lg"
              fullWidth
              onClick={handlePayNow}
              className="pay-now-btn"
            >
              Pay Now ₹{booking.totalAmount.toLocaleString()} <IoChevronForwardCircleOutline />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

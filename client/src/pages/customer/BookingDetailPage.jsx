import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoCalendarOutline, IoPeopleOutline, IoCashOutline, IoArrowBack, IoChatbubbleEllipsesOutline, IoCardOutline, IoPersonOutline, IoStarSharp } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals / forms states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await bookingsAPI.getDetail(id);
      setData(res.data.data);
    } catch (err) {
      toast.error('Booking details not found');
      navigate('/my-bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (e) => {
    e.preventDefault();
    setCancelLoading(true);
    try {
      await bookingsAPI.cancel(id, { reason: cancelReason });
      toast.success('Reservation cancelled successfully');
      setCancelModalOpen(false);
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    setReviewLoading(true);
    try {
      await bookingsAPI.submitReview(id, {
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Thank you for your feedback! Review submitted.');
      fetchDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'checked_in': return 'info';
      case 'checked_out': return 'default';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="booking-detail-loading">
        <Spinner size="lg" />
        <p>Loading sanctuary stay itinerary details...</p>
      </div>
    );
  }

  const { booking, guests, review, refund } = data;

  const showCancelButton = ['pending', 'confirmed'].includes(booking.status);
  const showReviewForm = booking.status === 'checked_out' && !review;

  return (
    <div className="booking-detail-page">
      <div className="container">
        <Link to="/my-bookings" className="back-link">
          <IoArrowBack /> Back to My Bookings
        </Link>

        <div className="booking-detail-grid">
          {/* Main Info */}
          <div className="booking-detail-main">
            <div className="detail-card glass animate-fade-in-up">
              <div className="detail-header">
                <div>
                  <span className="booking-code-tag">Booking Reference</span>
                  <h1 className="booking-code font-display">{booking.bookingCode}</h1>
                </div>
                <Badge variant={getStatusVariant(booking.status)} size="md">
                  {booking.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="detail-row">
                <div className="detail-block-img">
                  {booking.category?.name?.charAt(0) || 'S'}
                </div>
                <div className="detail-block-info">
                  <h2>{booking.category?.name || 'Sanctuary Suite'}</h2>
                  <p>Room number: <strong>{booking.room?.roomNumber || 'Assigned at Check-in'}</strong> {booking.room?.floor !== undefined ? `(Floor ${booking.room.floor})` : ''}</p>
                </div>
              </div>

              <div className="detail-divider" />

              <div className="detail-dates-grid">
                <div className="date-box">
                  <span>CHECK-IN</span>
                  <strong>{new Date(booking.checkIn).toLocaleDateString()}</strong>
                  <small>From 2:00 PM</small>
                </div>
                <div className="date-box">
                  <span>CHECK-OUT</span>
                  <strong>{new Date(booking.checkOut).toLocaleDateString()}</strong>
                  <small>Before 11:00 AM</small>
                </div>
                <div className="date-box">
                  <span>TOTAL STAY</span>
                  <strong>{booking.totalNights} Nights</strong>
                </div>
              </div>

              <div className="detail-divider" />

              {/* Guest Information */}
              <div className="guests-section">
                <h3 className="section-title-md font-heading"><IoPersonOutline /> Registered Guests</h3>
                <div className="guests-list-detail">
                  {guests.map((g, idx) => (
                    <div key={g._id} className="guest-item-card">
                      <div className="guest-header">
                        <strong>{g.name}</strong>
                        {g.isPrimary && <Badge variant="primary">Primary Guest</Badge>}
                      </div>
                      <div className="guest-meta">
                        <span>Age: {g.age}</span>
                        {g.idType && (
                          <span>ID: {g.idType.toUpperCase()} - {g.idNumber}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {booking.specialRequests && (
                <>
                  <div className="detail-divider" />
                  <div className="special-requests-section">
                    <h3 className="section-title-md font-heading">Special Requests</h3>
                    <p className="special-req-text">"{booking.specialRequests}"</p>
                  </div>
                </>
              )}
            </div>

            {/* Refund info card */}
            {refund && (
              <div className="refund-card glass animate-fade-in-up stagger-1">
                <h3 className="refund-title font-heading">Refund Details</h3>
                <div className="refund-details">
                  <div className="ref-row">
                    <span>Refund Amount:</span>
                    <strong>₹{refund.amount.toLocaleString()}</strong>
                  </div>
                  <div className="ref-row">
                    <span>Reason:</span>
                    <span>{refund.reason}</span>
                  </div>
                  <div className="ref-row">
                    <span>Status:</span>
                    <Badge variant={refund.status === 'processed' ? 'success' : 'warning'}>
                      {refund.status}
                    </Badge>
                  </div>
                  {refund.transactionId && (
                    <div className="ref-row">
                      <span>Refund TXN ID:</span>
                      <small className="txn-id">{refund.transactionId}</small>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review feedback section */}
            {review && (
              <div className="review-feedback-card glass animate-fade-in-up stagger-1">
                <h3 className="section-title-md font-heading"><IoChatbubbleEllipsesOutline /> Your Sanctuary Review</h3>
                <div className="review-feedback-content">
                  <div className="review-stars-row">
                    {[...Array(5)].map((_, idx) => (
                      <IoStarSharp
                        key={idx}
                        className={idx < review.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                    <span className="review-rating-score">{review.rating} / 5</span>
                  </div>
                  {review.title && <h4 className="review-title-detail">{review.title}</h4>}
                  <p className="review-comment-detail">"{review.comment}"</p>

                  {review.managerReply && (
                    <div className="review-manager-reply">
                      <p className="reply-title">Reply from Resort Manager</p>
                      <p className="reply-text">"{review.managerReply}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post-Checkout Review Form */}
            {showReviewForm && (
              <div className="review-form-card glass animate-fade-in-up stagger-1">
                <h3 className="section-title-md font-heading"><IoChatbubbleEllipsesOutline /> Share Your Experience</h3>
                <p className="review-form-subtitle">We hope you enjoyed your sanctuary stay. Share your feedback with us!</p>

                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="rating-select-group">
                    <label>Your Overall Rating</label>
                    <div className="rating-stars-input">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          className={`star-input-btn ${rating >= num ? 'active' : ''}`}
                          onClick={() => setRating(num)}
                        >
                          <IoStarSharp />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Input
                    label="Review Title"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="E.g., Wonderful escape, outstanding service!"
                  />

                  <Input
                    type="textarea"
                    label="Detailed Comment"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the room, facilities, staff, dining, etc."
                    required
                  />

                  <Button type="submit" variant="accent" loading={reviewLoading}>
                    Submit Review & Rating
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Right Sidebar: Payment Summary & Booking Actions */}
          <div className="booking-detail-sidebar">
            <div className="payment-summary-card glass animate-fade-in-up">
              <h3 className="summary-title font-heading"><IoCardOutline /> Invoice & Payment</h3>
              
              <div className="pricing-rows">
                <div className="price-row">
                  <span>Price per night:</span>
                  <span>₹{booking.pricePerNight.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Nights:</span>
                  <span>{booking.totalNights}</span>
                </div>
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>₹{booking.subtotal.toLocaleString()}</span>
                </div>
                <div className="price-row">
                  <span>Service Tax (18%):</span>
                  <span>₹{booking.taxAmount.toLocaleString()}</span>
                </div>
                <div className="price-row total">
                  <span>Grand Total:</span>
                  <strong>₹{booking.totalAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div className="payment-status-block">
                <span>Payment Status:</span>
                <Badge variant={booking.payment?.status === 'successful' ? 'success' : 'warning'}>
                  {booking.payment?.status || 'initiated'}
                </Badge>
              </div>

              {booking.payment?.transactionId && (
                <div className="transaction-id-row">
                  <span>Transaction ID:</span>
                  <small className="txn-id">{booking.payment.transactionId}</small>
                </div>
              )}

              {/* Action buttons */}
              <div className="sidebar-action-buttons">
                {booking.status === 'pending' && (
                  <Link to={`/payment/${booking._id}`} style={{ width: '100%' }}>
                    <Button variant="accent" fullWidth>Complete Payment Now</Button>
                  </Link>
                )}
                {showCancelButton && (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setCancelModalOpen(true)}
                  >
                    Cancel Reservation
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Sanctuary Reservation"
      >
        <form onSubmit={handleCancelBooking} className="cancel-form">
          <p className="cancel-warning-text">
            Are you sure you want to cancel your stay reference <strong>{booking.bookingCode}</strong>? 
            Depending on our cancellation policy, a penalty of up to 20% may be deducted from the refund.
          </p>
          <Input
            type="textarea"
            label="Reason for Cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please share the reason for cancellation..."
            required
          />
          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button type="submit" variant="danger" loading={cancelLoading}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BookingDetailPage;

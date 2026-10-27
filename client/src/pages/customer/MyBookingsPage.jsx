import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../api';
import { IoCalendarOutline, IoLocationOutline, IoCashOutline, IoArrowForwardOutline, IoCalendarClearOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './MyBookingsPage.css';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchBookings();
  }, [filter, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filter) params.status = filter;
      const res = await bookingsAPI.getMyBookings(params);
      setBookings(res.data.data.bookings || []);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1 className="bookings-title font-display">My Sanctuary Bookings</h1>
        <p className="bookings-subtitle">Manage your reservations, view statuses, check-in info, and submit post-checkout feedback.</p>

        {/* Filters */}
        <div className="bookings-filters">
          {[
            { label: 'All Stays', value: '' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Pending Payment', value: 'pending' },
            { label: 'Checked In', value: 'checked_in' },
            { label: 'Completed', value: 'checked_out' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((item) => (
            <button
              key={item.value}
              className={`filter-btn ${filter === item.value ? 'active' : ''}`}
              onClick={() => { setFilter(item.value); setPage(1); }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="bookings-loading">
            <Spinner size="lg" />
            <p>Retrieving booking records...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings-card glass animate-fade-in">
            <IoCalendarClearOutline className="no-bookings-icon" />
            <h3>No Bookings Found</h3>
            <p>You do not have any reservations recorded under this status filter.</p>
            <Link to="/search">
              <Button variant="primary">Book a Sanctuary</Button>
            </Link>
          </div>
        ) : (
          <div className="bookings-list animate-fade-in-up">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-list-item glass">
                <div className="booking-list-img-placeholder">
                  {booking.category.name.charAt(0)}
                </div>
                
                <div className="booking-list-info">
                  <div className="booking-list-header">
                    <h3 className="booking-list-category-name font-heading">{booking.category?.name || 'Sanctuary Suite'}</h3>
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status ? booking.status.replace('_', ' ') : 'pending'}</Badge>
                  </div>

                  <div className="booking-list-details">
                    <span>Code: <strong>{booking.bookingCode}</strong></span>
                    <span>
                      <IoCalendarOutline />
                      {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '—'} – {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '—'}
                    </span>
                    <span>Room: {booking.room?.roomNumber || 'Assigned at Check-in'}</span>
                  </div>

                  <div className="booking-list-footer">
                    <span className="booking-list-price">
                      <IoCashOutline /> Total: <strong>₹{booking.totalAmount ? booking.totalAmount.toLocaleString() : '0'}</strong>
                    </span>
                    <Link to={`/my-bookings/${booking._id}`} className="view-booking-detail-btn">
                      View Details & Actions <IoArrowForwardOutline />
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pages > 1 && (
              <div className="bookings-pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="page-nav-btn"
                >
                  Previous
                </button>
                <span className="page-indicator">Page {page} of {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="page-nav-btn"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

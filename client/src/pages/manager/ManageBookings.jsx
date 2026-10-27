import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { toast } from 'react-hot-toast';
import {
  IoSearchOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoFilterOutline,
  IoBedOutline,
  IoPencilOutline,
} from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import './ManageBookings.css';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Assign Room Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchRooms();
  }, [statusFilter, searchCode, page]);

  const fetchRooms = async () => {
    try {
      const res = await managerAPI.getRooms();
      setRooms(res.data?.data?.rooms || []);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (searchCode) params.bookingCode = searchCode;
      const res = await managerAPI.getBookings(params);
      setBookings(res.data.data.bookings || []);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (booking) => {
    setSelectedBooking(booking);
    setSelectedRoomId(booking.room?._id || booking.room || '');
    setAssignModalOpen(true);
  };

  const handleAssignRoomSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      toast.error('Please select a room unit to assign');
      return;
    }

    setAssignLoading(true);
    try {
      await managerAPI.assignRoom(selectedBooking._id, selectedRoomId);
      toast.success(`Room assigned successfully to reservation ${selectedBooking.bookingCode}`);
      setAssignModalOpen(false);
      fetchBookings();
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign room');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCheckIn = async (bookingId) => {
    try {
      await managerAPI.checkIn(bookingId);
      toast.success('Guest checked in successfully! Room status set to Occupied.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await managerAPI.checkOut(bookingId);
      toast.success('Guest checked out successfully! Housekeeping task queued.');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed');
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
    <div className="manage-bookings">
      {/* Filters and search header */}
      <div className="bookings-header-bar glass">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="search-wrap">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Search by Booking Code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
          />
        </form>

        <div className="filter-wrap">
          <IoFilterOutline />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending Payment</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Completed (Checked Out)</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bookings-loading">
          <Spinner size="lg" />
          <p>Querying Guest Bookings Registry...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings-found glass">
          <h3>No Records Found</h3>
          <p>No reservations matching the search criteria were discovered.</p>
        </div>
      ) : (
        <div className="table-responsive glass">
          <table className="operations-table">
            <thead>
              <tr>
                <th>Booking Code</th>
                <th>Guest Details</th>
                <th>Stay Window</th>
                <th>Assigned Room</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <strong className="booking-ref-code">{b.bookingCode}</strong>
                  </td>
                  <td>
                    <div className="guest-profile">
                      <span className="guest-name">{b.user?.name || 'Guest'}</span>
                      <span className="guest-contact">{b.user?.phone || b.user?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="stay-window">
                      <span>{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '—'}</span>
                      <span className="stay-arrow">→</span>
                      <span>{b.checkOut ? new Date(b.checkOut).toLocaleDateString() : '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="room-summary">
                      <span className="room-no">Room {b.room?.roomNumber || 'Not Set'}</span>
                      <span className="room-cat">{b.category?.name || 'Standard'}</span>
                    </div>
                  </td>
                  <td>
                    <strong>₹{b.totalAmount ? b.totalAmount.toLocaleString() : '0'}</strong>
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(b.status)}>{b.status ? b.status.replace('_', ' ') : 'pending'}</Badge>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAssignModal(b)}
                        title="Assign or reallocate physical room number"
                      >
                        <IoBedOutline /> Assign Room
                      </Button>
                      {b.status === 'confirmed' && (
                        <Button variant="primary" size="sm" onClick={() => handleCheckIn(b._id)}>
                          Check In
                        </Button>
                      )}
                      {b.status === 'checked_in' && (
                        <Button variant="accent" size="sm" onClick={() => handleCheckOut(b._id)}>
                          Check Out
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="bookings-pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="page-nav-btn">Previous</button>
              <span className="page-indicator">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="page-nav-btn">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Assign Room Modal */}
      {selectedBooking && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Physical Room — Reservation ${selectedBooking.bookingCode}`}
        >
          <form onSubmit={handleAssignRoomSubmit} className="assign-room-form">
            <div className="booking-info-strip" style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-bg-warm)', border: '1px solid var(--color-border-subtle)' }}>
              <p><strong>Guest:</strong> {selectedBooking.user?.name || 'Guest'} ({selectedBooking.user?.phone || selectedBooking.user?.email || 'N/A'})</p>
              <p><strong>Suite Category:</strong> {selectedBooking.category?.name || 'Standard'}</p>
              <p><strong>Stay:</strong> {selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString() : '—'} to {selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString() : '—'}</p>
              <p><strong>Currently Assigned:</strong> Room {selectedBooking.room?.roomNumber || 'None'}</p>
            </div>

            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label">Select Physical Room Unit</label>
              <select
                className="input-field"
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
              >
                <option value="">Select Room Unit</option>
                {rooms
                  .filter((r) => r.isActive)
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      Room #{r.roomNumber} — {r.category?.name} (Floor {r.floor}, Status: {r.status})
                    </option>
                  ))}
              </select>
            </div>

            <div className="modal-actions-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={assignLoading}>
                Confirm Room Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ManageBookings;


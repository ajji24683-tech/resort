import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoGridOutline, IoAddOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './ManageRooms.css';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    category: '',
    floor: 0,
    notes: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRoomsAndCategories();
  }, []);

  const fetchRoomsAndCategories = async () => {
    setLoading(true);
    try {
      const [roomsRes, catsRes] = await Promise.all([
        managerAPI.getRooms(),
        managerAPI.getCategories(),
      ]);
      setRooms(roomsRes.data.data.rooms || []);
      setCategories(catsRes.data.data.categories || []);
    } catch (err) {
      console.error('Error fetching rooms data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.category) {
      toast.error('Please choose a room category');
      return;
    }
    setFormLoading(true);
    try {
      await managerAPI.createRoom(roomForm);
      toast.success(`Room ${roomForm.roomNumber} created successfully!`);
      setRoomModalOpen(false);
      setRoomForm({ roomNumber: '', category: '', floor: 0, notes: '' });
      fetchRoomsAndCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'info';
      case 'cleaning_required': return 'danger';
      case 'cleaning_in_progress': return 'warning';
      case 'inspection_pending': return 'warning';
      case 'maintenance': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="manage-rooms">
      <div className="rooms-header-actions glass">
        <h3>Sanctuary Rooms Registry</h3>
        <Button variant="primary" size="sm" onClick={() => setRoomModalOpen(true)}>
          <IoAddOutline /> Add Room
        </Button>
      </div>

      {loading ? (
        <div className="rooms-loading">
          <Spinner size="lg" />
          <p>Querying Physical Rooms Database...</p>
        </div>
      ) : (
        <div className="rooms-grid-board animate-fade-in-up">
          {rooms.map((room) => (
            <div key={room._id} className={`room-status-card glass ${room.status}`}>
              <div className="room-card-number-header">
                <span className="room-badge-number">{room.roomNumber}</span>
                <Badge variant={getStatusVariant(room.status)}>{room.status.replace('_', ' ')}</Badge>
              </div>

              <div className="room-card-details">
                <span className="room-card-category-name">{room.category.name}</span>
                <span className="room-card-floor">Floor: {room.floor}</span>
              </div>
              
              {room.notes && <p className="room-card-notes">"{room.notes}"</p>}
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      <Modal isOpen={roomModalOpen} onClose={() => setRoomModalOpen(false)} title="Register Physical Room">
        <form onSubmit={handleCreateRoom} className="room-create-form">
          <Input
            label="Room Number"
            name="roomNumber"
            value={roomForm.roomNumber}
            onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
            placeholder="E.g., 109, V4, C6"
            required
          />
          
          <div className="input-group">
            <label className="input-label">Room Category</label>
            <select
              className="input-field"
              value={roomForm.category}
              onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            label="Floor Level"
            name="floor"
            value={roomForm.floor}
            onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value) || 0 })}
            placeholder="Floor"
            min="0"
            required
          />

          <Input
            type="textarea"
            label="Operational Notes"
            name="notes"
            value={roomForm.notes}
            onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
            placeholder="Any specific room configurations..."
          />

          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setRoomModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading}>Create Room</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageRooms;

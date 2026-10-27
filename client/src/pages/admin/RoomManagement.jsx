import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import {
  IoBedOutline,
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoImageOutline,
  IoPeopleOutline,
  IoExpandOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline,
  IoStarOutline,
  IoStarSharp,
  IoEyeOutline,
  IoGridOutline,
  IoLayersOutline,
} from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './RoomManagement.css';

const COMMON_AMENITIES = [
  'Private Infinity Pool',
  'Panoramic Mountain View',
  'Jacuzzi Bathtub',
  'Private Balcony',
  'King Bed',
  'Separate Living Room',
  'Fireplace',
  'Outdoor Dining',
  'Espresso Machine',
  'High-Speed Wi-Fi',
  'Mini Bar',
  'Dedicated Butler Service',
  'Ayurvedic Bath Essentials',
  'Smart 4K TV',
  'Climate Control AC',
];

const PRESET_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85', label: 'Deluxe Suite Bedroom' },
  { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85', label: 'Garden Cottage Interior' },
  { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85', label: 'Panoramic Suite Living Area' },
  { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85', label: 'Pool Villa Deck' },
  { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85', label: 'Luxury Master Bedroom' },
  { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85', label: 'Hillside Modern Suite' },
];

const RoomManagement = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'rooms'
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Modal States
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    basePrice: '',
    maxGuests: 2,
    bedType: 'king',
    roomSize: 450,
    shortDescription: '',
    description: '',
    amenities: [],
    images: [],
    isActive: true,
  });
  const [newImageUrl, setNewImageUrl] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const [catFormLoading, setCatFormLoading] = useState(false);

  // Room Modal States
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    category: '',
    floor: 0,
    notes: '',
    status: 'available',
  });
  const [roomFormLoading, setRoomFormLoading] = useState(false);

  // Delete confirmation
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    open: false,
    type: '', // 'category' | 'room'
    id: null,
    name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, roomsRes] = await Promise.all([
        adminAPI.getCategories(),
        adminAPI.getRooms(),
      ]);
      setCategories(catsRes.data?.data?.categories || []);
      setRooms(roomsRes.data?.data?.rooms || []);
    } catch (err) {
      toast.error('Failed to load room and suite data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Category Handlers ─────────────────────────────────────
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      basePrice: '',
      maxGuests: 2,
      bedType: 'king',
      roomSize: 450,
      shortDescription: '',
      description: '',
      amenities: ['King Bed', 'High-Speed Wi-Fi', 'Panoramic Mountain View', 'Espresso Machine'],
      images: [
        {
          url: PRESET_PHOTOS[0].url,
          alt: 'Suite Main Photo',
          isPrimary: true,
        },
      ],
      isActive: true,
    });
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      basePrice: cat.basePrice || '',
      maxGuests: cat.maxGuests || 2,
      bedType: cat.bedType || 'king',
      roomSize: cat.roomSize || 0,
      shortDescription: cat.shortDescription || '',
      description: cat.description || '',
      amenities: cat.amenities || [],
      images: cat.images && cat.images.length > 0 ? cat.images : [{ url: PRESET_PHOTOS[0].url, isPrimary: true }],
      isActive: cat.isActive !== false,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Please provide a suite/category name');
      return;
    }
    if (!categoryForm.basePrice || parseFloat(categoryForm.basePrice) < 0) {
      toast.error('Please enter a valid base price per night');
      return;
    }
    if (!categoryForm.description.trim()) {
      toast.error('Please provide a suite description');
      return;
    }

    setCatFormLoading(true);
    try {
      const payload = {
        ...categoryForm,
        basePrice: parseFloat(categoryForm.basePrice),
        maxGuests: parseInt(categoryForm.maxGuests, 10),
        roomSize: parseInt(categoryForm.roomSize, 10) || 0,
      };

      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory._id, payload);
        toast.success(`Suite "${payload.name}" updated successfully!`);
      } else {
        await adminAPI.createCategory(payload);
        toast.success(`New suite "${payload.name}" created successfully!`);
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save suite category');
    } finally {
      setCatFormLoading(false);
    }
  };

  const handleToggleAmenity = (amenity) => {
    if (categoryForm.amenities.includes(amenity)) {
      setCategoryForm({
        ...categoryForm,
        amenities: categoryForm.amenities.filter((a) => a !== amenity),
      });
    } else {
      setCategoryForm({
        ...categoryForm,
        amenities: [...categoryForm.amenities, amenity],
      });
    }
  };

  const handleAddCustomAmenity = (e) => {
    e.preventDefault();
    if (customAmenity.trim() && !categoryForm.amenities.includes(customAmenity.trim())) {
      setCategoryForm({
        ...categoryForm,
        amenities: [...categoryForm.amenities, customAmenity.trim()],
      });
      setCustomAmenity('');
    }
  };

  const handleAddImageUrl = (e) => {
    if (e) e.preventDefault();
    if (!newImageUrl.trim()) return;
    const isFirst = categoryForm.images.length === 0;
    setCategoryForm({
      ...categoryForm,
      images: [...categoryForm.images, { url: newImageUrl.trim(), alt: categoryForm.name, isPrimary: isFirst }],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    const updated = categoryForm.images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setCategoryForm({ ...categoryForm, images: updated });
  };

  const handleSetPrimaryImage = (index) => {
    const updated = categoryForm.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setCategoryForm({ ...categoryForm, images: updated });
  };

  // ─── Room Handlers ─────────────────────────────────────────
  const handleOpenCreateRoom = () => {
    setEditingRoom(null);
    setRoomForm({
      roomNumber: '',
      category: categories[0]?._id || '',
      floor: 1,
      notes: '',
      status: 'available',
    });
    setRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      roomNumber: room.roomNumber || '',
      category: room.category?._id || room.category || '',
      floor: room.floor || 0,
      notes: room.notes || '',
      status: room.status || 'available',
    });
    setRoomModalOpen(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim()) {
      toast.error('Please enter a room number (e.g. 101, Villa 4)');
      return;
    }
    if (!roomForm.category) {
      toast.error('Please choose a suite category');
      return;
    }

    setRoomFormLoading(true);
    try {
      if (editingRoom) {
        await adminAPI.updateRoom(editingRoom._id, roomForm);
        toast.success(`Room Unit ${roomForm.roomNumber} updated successfully!`);
      } else {
        await adminAPI.createRoom(roomForm);
        toast.success(`Physical Room ${roomForm.roomNumber} created successfully!`);
      }
      setRoomModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save physical room');
    } finally {
      setRoomFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    const { type, id, name } = deleteConfirmModal;
    try {
      if (type === 'category') {
        await adminAPI.deleteCategory(id);
        toast.success(`Suite "${name}" deleted successfully.`);
      } else if (type === 'room') {
        await adminAPI.deleteRoom(id);
        toast.success(`Room Unit "${name}" deleted successfully.`);
      }
      setDeleteConfirmModal({ open: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'occupied':
        return <Badge variant="info">Occupied</Badge>;
      case 'cleaning_required':
        return <Badge variant="danger">Cleaning Needed</Badge>;
      case 'cleaning_in_progress':
        return <Badge variant="warning">Cleaning In Progress</Badge>;
      case 'inspection_pending':
        return <Badge variant="warning">Inspection Pending</Badge>;
      case 'maintenance':
        return <Badge variant="default">Under Maintenance</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="room-management-page">
      {/* Top Header & Navigation Tabs */}
      <div className="mgmt-header-panel">
        <div className="mgmt-title-wrap">
          <h1 className="mgmt-main-title font-serif">Sanctuary Suites & Inventory Management</h1>
          <p className="mgmt-main-subtitle">
            Configure suite categories, dynamic nightly pricing, photo galleries, amenities, and individual room units.
          </p>
        </div>

        <div className="mgmt-tab-actions">
          <div className="mgmt-tab-group">
            <button
              type="button"
              className={`mgmt-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <IoBedOutline />
              <span>Suites & Pricing ({categories.length})</span>
            </button>
            <button
              type="button"
              className={`mgmt-tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
              onClick={() => setActiveTab('rooms')}
            >
              <IoLayersOutline />
              <span>Room Units ({rooms.length})</span>
            </button>
          </div>

          <div className="mgmt-primary-actions">
            {activeTab === 'categories' ? (
              <Button variant="primary" onClick={handleOpenCreateCategory}>
                <IoAddOutline /> Add New Suite Type
              </Button>
            ) : (
              <Button variant="primary" onClick={handleOpenCreateRoom}>
                <IoAddOutline /> Register Physical Room
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mgmt-loading-state">
          <Spinner size="lg" />
          <p>Loading Sanctuary Suites & Inventory...</p>
        </div>
      ) : activeTab === 'categories' ? (
        /* ═════════════════════════════════════════════════════════════
            TAB 1: SUITE CATEGORIES & PRICING
           ═════════════════════════════════════════════════════════════ */
        <div className="suite-categories-grid animate-fade-in">
          {categories.map((cat) => {
            const validHttpImage =
              cat.images?.find((img) => img.isPrimary && img.url?.startsWith('http'))?.url ||
              cat.images?.find((img) => img.url?.startsWith('http'))?.url;
            const primaryImage = validHttpImage || PRESET_PHOTOS[0].url;

            return (
              <div key={cat._id} className="suite-category-card">
                <div className="suite-card-media">
                  <img
                    src={primaryImage}
                    alt={cat.name}
                    className="suite-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PRESET_PHOTOS[0].url;
                    }}
                  />
                  <div className="suite-card-price-tag font-serif">
                    ₹{cat.basePrice?.toLocaleString()}
                    <small>/night</small>
                  </div>
                  <div className="suite-card-rooms-count">
                    {cat.totalRooms || 0} {(cat.totalRooms === 1 ? 'unit' : 'units')}
                  </div>
                </div>

                <div className="suite-card-body">
                  <div className="suite-card-header">
                    <h3 className="suite-card-title font-serif">{cat.name}</h3>
                    <Badge variant={cat.isActive ? 'success' : 'default'}>
                      {cat.isActive ? 'Active' : 'Archived'}
                    </Badge>
                  </div>

                  <p className="suite-card-desc">
                    {cat.shortDescription || cat.description}
                  </p>

                  <div className="suite-card-specs">
                    <span><IoPeopleOutline /> Up to {cat.maxGuests} Guests</span>
                    {cat.roomSize > 0 && <span><IoExpandOutline /> {cat.roomSize} sq. ft.</span>}
                    {cat.bedType && <span><IoBedOutline /> {cat.bedType.toUpperCase()} Bed</span>}
                  </div>

                  <div className="suite-card-amenities">
                    {cat.amenities?.slice(0, 4).map((a, i) => (
                      <span key={i} className="suite-amenity-chip">{a}</span>
                    ))}
                    {cat.amenities?.length > 4 && (
                      <span className="suite-amenity-chip more">+{cat.amenities.length - 4} more</span>
                    )}
                  </div>

                  <div className="suite-card-footer">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditCategory(cat)}
                    >
                      <IoPencilOutline /> Edit Suite & Pricing
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-danger-ghost"
                      onClick={() =>
                        setDeleteConfirmModal({
                          open: true,
                          type: 'category',
                          id: cat._id,
                          name: cat.name,
                        })
                      }
                    >
                      <IoTrashOutline />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═════════════════════════════════════════════════════════════
            TAB 2: PHYSICAL ROOMS REGISTRY
           ═════════════════════════════════════════════════════════════ */
        <div className="rooms-registry-wrap animate-fade-in">
          <div className="rooms-table-card">
            <table className="mgmt-table">
              <thead>
                <tr>
                  <th>Room Unit #</th>
                  <th>Suite Category</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td>
                      <span className="room-number-pill font-serif">{room.roomNumber}</span>
                    </td>
                    <td>
                      <strong className="room-category-label">{room.category?.name || 'Unassigned'}</strong>
                    </td>
                    <td>Floor {room.floor}</td>
                    <td>{getStatusBadge(room.status)}</td>
                    <td className="room-notes-cell">{room.notes || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-group">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditRoom(room)}
                        >
                          <IoPencilOutline /> Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-danger-ghost"
                          onClick={() =>
                            setDeleteConfirmModal({
                              open: true,
                              type: 'room',
                              id: room._id,
                              name: room.roomNumber,
                            })
                          }
                        >
                          <IoTrashOutline />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          MODAL: Add / Edit Suite Category & Pricing
         ═════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? `Edit Suite: ${editingCategory.name}` : 'Create New Suite Category'}
        size="lg"
      >
        <form onSubmit={handleSaveCategory} className="suite-form-grid">
          <div className="form-row-2">
            <Input
              label="Suite / Room Name"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g. Royal Panoramic Villa"
              required
            />

            <Input
              label="Nightly Base Price (₹ INR)"
              type="number"
              min="0"
              value={categoryForm.basePrice}
              onChange={(e) => setCategoryForm({ ...categoryForm, basePrice: e.target.value })}
              placeholder="e.g. 15000"
              required
            />
          </div>

          <div className="form-row-3">
            <div className="input-group">
              <label className="input-label">Max Guest Occupancy</label>
              <select
                className="input-field"
                value={categoryForm.maxGuests}
                onChange={(e) => setCategoryForm({ ...categoryForm, maxGuests: parseInt(e.target.value, 10) })}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Bedding Configuration</label>
              <select
                className="input-field"
                value={categoryForm.bedType}
                onChange={(e) => setCategoryForm({ ...categoryForm, bedType: e.target.value })}
              >
                <option value="king">King Bed</option>
                <option value="queen">Queen Bed</option>
                <option value="double">Double Bed</option>
                <option value="twin">Twin Beds</option>
                <option value="suite">Master Suite Configuration</option>
              </select>
            </div>

            <Input
              label="Room Size (Sq. Ft.)"
              type="number"
              min="0"
              value={categoryForm.roomSize}
              onChange={(e) => setCategoryForm({ ...categoryForm, roomSize: e.target.value })}
              placeholder="e.g. 750"
            />
          </div>

          <Input
            label="Short Tagline / Summary"
            value={categoryForm.shortDescription}
            onChange={(e) => setCategoryForm({ ...categoryForm, shortDescription: e.target.value })}
            placeholder="e.g. Ultimate luxury with private infinity pool and panoramic valley views"
          />

          <div className="input-group">
            <label className="input-label">Editorial Description</label>
            <textarea
              className="input-field textarea-large"
              rows={4}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Detailed description of the suite architecture, materials, views, and experience..."
              required
            />
          </div>

          {/* Amenities Picker */}
          <div className="suite-amenities-section">
            <label className="input-label">Sanctuary Amenities</label>
            <div className="amenities-toggle-grid">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = categoryForm.amenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    className={`amenity-toggle-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleAmenity(amenity)}
                  >
                    {isSelected ? <IoCheckmarkCircleOutline /> : <IoAddOutline />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Adder */}
            <div className="custom-amenity-row">
              <input
                type="text"
                placeholder="Add custom amenity (e.g. Private Steam Room)"
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                className="input-field"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddCustomAmenity}>
                Add Amenity
              </Button>
            </div>
          </div>

          {/* Photo Gallery Management */}
          <div className="suite-photos-section">
            <label className="input-label">Suite Photography & Image Gallery</label>
            
            {/* Add Image URL Input */}
            <div className="image-url-add-row">
              <input
                type="url"
                placeholder="Paste high-res image URL (e.g. https://images.unsplash.com/...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="input-field"
              />
              <Button type="button" variant="primary" size="sm" onClick={handleAddImageUrl}>
                <IoAddOutline /> Add Image
              </Button>
            </div>

            {/* Presets Quick Pick */}
            <div className="preset-photos-strip">
              <span className="preset-label">Quick Presets:</span>
              {PRESET_PHOTOS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip-btn"
                  onClick={() => {
                    if (!categoryForm.images.some((img) => img.url === preset.url)) {
                      setCategoryForm({
                        ...categoryForm,
                        images: [...categoryForm.images, { url: preset.url, alt: preset.label, isPrimary: categoryForm.images.length === 0 }],
                      });
                    }
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Image Previews Grid */}
            <div className="image-previews-grid">
              {categoryForm.images.map((img, idx) => (
                <div key={idx} className={`image-preview-item ${img.isPrimary ? 'primary' : ''}`}>
                  <img src={img.url} alt={`Suite photo ${idx + 1}`} />
                  <div className="image-preview-overlay">
                    <button
                      type="button"
                      className={`btn-set-primary ${img.isPrimary ? 'active' : ''}`}
                      onClick={() => handleSetPrimaryImage(idx)}
                      title={img.isPrimary ? 'Primary Photo' : 'Set as Primary Photo'}
                    >
                      {img.isPrimary ? <IoStarSharp /> : <IoStarOutline />}
                    </button>
                    <button
                      type="button"
                      className="btn-delete-photo"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove Photo"
                    >
                      <IoTrashOutline />
                    </button>
                  </div>
                  {img.isPrimary && <span className="primary-photo-tag">PRIMARY</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={catFormLoading}>
              {editingCategory ? 'Save Changes' : 'Create Suite Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: Add / Edit Physical Room Unit
         ═════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        title={editingRoom ? `Edit Room Unit #${editingRoom.roomNumber}` : 'Register Physical Room Unit'}
      >
        <form onSubmit={handleSaveRoom} className="room-create-form">
          <Input
            label="Room Unit Number"
            value={roomForm.roomNumber}
            onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
            placeholder="e.g. 101, 102, V1, C3"
            required
            autoFocus
          />

          <div className="input-group">
            <label className="input-label">Assigned Suite Category</label>
            <select
              className="input-field"
              value={roomForm.category}
              onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
              required
            >
              <option value="">Select Suite Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — ₹{c.basePrice?.toLocaleString()}/night
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <Input
              label="Floor Level"
              type="number"
              min="0"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value, 10) || 0 })}
              required
            />

            <div className="input-group">
              <label className="input-label">Current Unit Status</label>
              <select
                className="input-field"
                value={roomForm.status}
                onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning_required">Cleaning Required</option>
                <option value="cleaning_in_progress">Cleaning in Progress</option>
                <option value="inspection_pending">Inspection Pending</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Operational Notes / Special Features</label>
            <textarea
              className="input-field"
              rows={3}
              value={roomForm.notes}
              onChange={(e) => setRoomForm({ ...roomForm, notes: e.target.value })}
              placeholder="e.g. Corner villa with sunset exposure, upgraded outdoor fireplace"
            />
          </div>

          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setRoomModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={roomFormLoading}>
              {editingRoom ? 'Update Room Unit' : 'Create Room Unit'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ═════════════════════════════════════════════════════════════
          MODAL: Delete Confirmation
         ═════════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={deleteConfirmModal.open}
        onClose={() => setDeleteConfirmModal({ open: false, type: '', id: null, name: '' })}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="delete-confirm-box">
          <p>
            Are you sure you want to delete {deleteConfirmModal.type === 'category' ? 'Suite Category' : 'Room Unit'}{' '}
            <strong>"{deleteConfirmModal.name}"</strong>?
          </p>
          <p className="delete-warning-text">This action cannot be undone.</p>
          <div className="modal-actions-buttons">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirmModal({ open: false, type: '', id: null, name: '' })}
            >
              Cancel
            </Button>
            <Button variant="primary" className="btn-danger" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RoomManagement;

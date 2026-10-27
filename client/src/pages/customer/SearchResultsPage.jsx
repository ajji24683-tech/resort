import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { roomsAPI } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoBedOutline,
  IoStarSharp,
  IoWifiOutline,
  IoWaterOutline,
  IoRestaurantOutline,
  IoAlertCircleOutline,
  IoLayersOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import './SearchResultsPage.css';

const DEFAULT_IMAGE_MAP = {
  'deluxe-room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'garden-cottage': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'premium-suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'pool-villa': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
};

const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(parseInt(searchParams.get('guests')) || 2);
  const [selectedCatId, setSelectedCatId] = useState(searchParams.get('category') || '');
  const [roomCountFilter, setRoomCountFilter] = useState('all'); // 'all' | 1 | 2 | 3

  const [allCategories, setAllCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Fetch all available room categories for the Suite Type dropdown
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const res = await roomsAPI.getCategories();
        setAllCategories(res.data?.data?.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchAllCategories();
  }, []);

  useEffect(() => {
    if (checkIn && checkOut) {
      triggerSearch();
    }
  }, [searchParams]);

  const triggerSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await roomsAPI.searchRooms({
        checkIn: searchParams.get('checkIn'),
        checkOut: searchParams.get('checkOut'),
        guests: searchParams.get('guests') || 2,
      });
      const data = res.data?.data || {};
      setResults(data.categories || []);
      setCombinations(data.combinations || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred during search. Ensure dates are valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Both check-in and check-out dates are required');
      return;
    }
    const params = { checkIn, checkOut, guests };
    if (selectedCatId) params.category = selectedCatId;
    setSearchParams(params);
  };

  const handleBookCombo = (combo) => {
    const primaryRoomId = combo.primaryRoom?._id || combo.rooms?.[0]?.primaryRoom?._id || combo.rooms?.[0]?.category?._id;
    const targetUrl = `/book/${primaryRoomId}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${combo.roomsCount}`;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      navigate(targetUrl);
    }
  };

  // Filter combinations by room count and category if chosen
  const filteredCombinations = combinations.filter((combo) => {
    if (roomCountFilter !== 'all' && combo.roomsCount !== parseInt(roomCountFilter, 10)) {
      return false;
    }
    if (selectedCatId) {
      const hasCat = combo.rooms?.some(
        (r) => r.category?._id === selectedCatId || r.category?.slug === selectedCatId
      );
      if (!hasCat) return false;
    }
    return true;
  });

  // Unique room counts available for tabs
  const availableRoomCounts = Array.from(new Set(combinations.map((c) => c.roomsCount))).sort((a, b) => a - b);

  return (
    <div className="search-results-page">
      <div className="container">
        <h1 className="search-title font-display">Find Your Sanctum</h1>
        <p className="search-subtitle">
          Specify dates and party size to discover tailored single-suite and multi-room combinations with guaranteed real-time availability.
        </p>

        {/* Search form with Suite Type and Guests */}
        <form onSubmit={handleSearchSubmit} className="search-form-bar animate-fade-in-up">
          <div className="form-field">
            <label><IoCalendarOutline /> Check-in Date</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={today}
              required
            />
          </div>

          <div className="form-divider" />

          <div className="form-field">
            <label><IoCalendarOutline /> Check-out Date</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn || today}
              required
            />
          </div>

          <div className="form-divider" />

          <div className="form-field">
            <label><IoBedOutline /> Suite Type</label>
            <select
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
            >
              <option value="">All Suites & Combinations</option>
              {allCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} (Max {c.maxGuests} Guests)
                </option>
              ))}
            </select>
          </div>

          <div className="form-divider" />

          <div className="form-field">
            <label><IoPeopleOutline /> Total Party Guests</label>
            <select value={guests} onChange={(e) => setGuests(parseInt(e.target.value, 10))}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" className="search-submit-btn font-sub">
            Search Sanctuaries
          </Button>
        </form>

        {error && (
          <div className="search-error-banner animate-fade-in">
            <IoAlertCircleOutline />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="search-results-loading">
            <Spinner size="lg" />
            <p>Querying resort inventory and computing optimal room combinations...</p>
          </div>
        ) : searched ? (
          <div className="results-container">
            <div className="results-header-flex">
              <div>
                <h2 className="results-heading font-serif">
                  Accommodations for {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </h2>
                <span className="results-date-tag">
                  Stay: {new Date(checkIn).toLocaleDateString()} — {new Date(checkOut).toLocaleDateString()}
                </span>
              </div>

              {/* Room Count Filter Tabs (e.g. All Options, 1 Room, 2 Rooms, 3 Rooms) */}
              {combinations.length > 0 && (
                <div className="room-count-filter-pills">
                  <button
                    type="button"
                    className={`filter-pill-btn ${roomCountFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setRoomCountFilter('all')}
                  >
                    All Options ({combinations.length})
                  </button>
                  {availableRoomCounts.map((count) => {
                    const countItems = combinations.filter((c) => c.roomsCount === count).length;
                    return (
                      <button
                        key={count}
                        type="button"
                        className={`filter-pill-btn ${roomCountFilter === count.toString() ? 'active' : ''}`}
                        onClick={() => setRoomCountFilter(count.toString())}
                      >
                        {count} {count === 1 ? 'Room' : 'Rooms'} ({countItems})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {filteredCombinations.length === 0 ? (
              <div className="no-results-card animate-fade-in">
                <IoAlertCircleOutline className="no-results-icon" />
                <h3 className="font-serif">No Matching Sanctuaries Available</h3>
                <p>
                  No rooms or room combinations matching your requested guest capacity of <strong>{guests} guests</strong> were found for the selected dates. Try adjusting dates or party size.
                </p>
              </div>
            ) : (
              <div className="results-grid">
                {filteredCombinations.map((combo, index) => {
                  const {
                    id,
                    roomsCount,
                    totalCapacity,
                    title,
                    capacityBadge,
                    breakdownText,
                    pricePerNight,
                    totalPrice,
                    totalNights,
                    primaryCategory,
                    rooms,
                  } = combo;

                  const imageSrc =
                    primaryCategory?.images?.[0]?.url?.startsWith('http')
                      ? primaryCategory.images[0].url
                      : DEFAULT_IMAGE_MAP[primaryCategory?.slug] || DEFAULT_IMAGE_MAP['deluxe-room'];

                  return (
                    <div key={id || index} className={`result-card combo-result-card animate-fade-in-up stagger-${(index % 4) + 1}`}>
                      <div className="result-img-wrap">
                        <img src={imageSrc} alt={primaryCategory?.name || 'Sanctuary'} className="result-img" />
                        <span className="result-rooms-badge">
                          <IoLayersOutline /> {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'} Total
                        </span>
                      </div>

                      <div className="result-content">
                        <div className="result-card-top-tags">
                          <span className="capacity-highlight-tag font-sub">
                            <IoPeopleOutline /> Total Capacity: {totalCapacity} Guests
                          </span>
                          <span className="config-type-badge font-sub">
                            {capacityBadge}
                          </span>
                        </div>

                        <h3 className="result-name font-serif">{title}</h3>
                        <p className="result-desc">{breakdownText}</p>

                        {/* Visual Breakdown of Rooms Included in this Combination */}
                        <div className="combo-rooms-breakdown-list">
                          {rooms?.map((r, i) => (
                            <div key={i} className="combo-room-item-row">
                              <span className="combo-room-bullet"><IoCheckmarkCircleOutline /></span>
                              <span className="combo-room-title font-sub">
                                <strong>{r.quantity} × {r.category?.name}</strong>
                              </span>
                              <span className="combo-room-capacity">
                                (Cap: {r.category?.maxGuests} guests {r.quantity > 1 ? 'each' : ''})
                              </span>
                              {r.category?.bedType && (
                                <span className="combo-room-bed">
                                  • {r.category.bedType.charAt(0).toUpperCase() + r.category.bedType.slice(1)} Bed
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Amenities from Primary Category */}
                        {primaryCategory?.amenities && primaryCategory.amenities.length > 0 && (
                          <div className="result-amenities">
                            {primaryCategory.amenities.slice(0, 4).map((a, i) => (
                              <span key={i} className="res-amenity">{a}</span>
                            ))}
                          </div>
                        )}

                        <div className="result-footer">
                          <div className="result-pricing">
                            <div className="price-line">
                              <span className="price-amount font-serif">₹{pricePerNight?.toLocaleString()}</span>
                              <span className="price-unit">/ night combined</span>
                            </div>
                            <div className="price-total">
                              Total: <strong>₹{totalPrice?.toLocaleString()}</strong> <small>({totalNights} nights, {roomsCount} {roomsCount === 1 ? 'room' : 'rooms'})</small>
                            </div>
                          </div>
                          <Button
                            variant="primary"
                            className="btn-select-book font-sub"
                            onClick={() => handleBookCombo(combo)}
                          >
                            Select & Book ({roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'})
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="search-placeholder-card animate-fade-in">
            <IoCalendarOutline className="placeholder-icon" />
            <h3 className="font-serif">Select Dates & Party Size to Search</h3>
            <p>
              Sanctuary inventory is dynamic. Enter check-in dates and guest counts to view tailored single-room and multi-room combinations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;



import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roomsAPI } from '../../api';
import { IoPeopleOutline, IoStarSharp, IoExpandOutline, IoBedOutline, IoArrowBack, IoCheckmarkCircleOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import './RoomDetailPage.css';

const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await roomsAPI.getCategoryDetail(id);
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching category detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="room-detail-loading">
        <Spinner size="lg" />
        <p>Polishing your premium room details...</p>
      </div>
    );
  }

  if (!data || !data.category) {
    return (
      <div className="room-detail-error">
        <h2>Sanctuary Not Found</h2>
        <p>The requested accommodation category does not exist or has been archived.</p>
        <Link to="/rooms">
          <Button variant="primary">Back to Rooms</Button>
        </Link>
      </div>
    );
  }

  const [activeImage, setActiveImage] = useState(null);

  const FALLBACK_CATEGORY_IMAGES = {
    'deluxe-room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    'garden-cottage': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
    'premium-suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
    'pool-villa': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
  };

  const defaultFallback = FALLBACK_CATEGORY_IMAGES[category.slug] || FALLBACK_CATEGORY_IMAGES['deluxe-room'];
  const validImages = (category.images || []).filter((img) => img?.url?.startsWith('http'));
  const primaryImgUrl = validImages.find((img) => img.isPrimary)?.url || validImages[0]?.url || defaultFallback;
  const currentImage = activeImage || primaryImgUrl;

  return (
    <div className="room-detail-page">
      <div className="container">
        {/* Back Link */}
        <Link to="/rooms" className="back-link">
          <IoArrowBack /> Back to Accommodations
        </Link>

        <div className="room-detail-layout">
          {/* Left: Gallery and Info */}
          <div className="room-detail-main">
            {/* Gallery */}
            <div className="room-detail-gallery">
              <div className="room-detail-main-img-wrap">
                <img
                  src={currentImage}
                  alt={category.name}
                  className="room-detail-main-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultFallback;
                  }}
                />
              </div>
              {validImages.length > 1 && (
                <div className="room-detail-thumb-grid">
                  {validImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`room-detail-thumb ${currentImage === img.url ? 'active' : ''}`}
                      onClick={() => setActiveImage(img.url)}
                    >
                      <img src={img.url} alt={`${category.name} view ${idx + 1}`} className="room-detail-thumb-img" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="room-detail-content">
              <h1 className="room-detail-title font-display">{category.name}</h1>
              
              <div className="room-detail-meta">
                {avgRating > 0 && (
                  <div className="room-detail-rating">
                    <IoStarSharp className="star-icon" />
                    <span>{avgRating.toFixed(1)}</span>
                    <small>({reviewCount} reviews)</small>
                  </div>
                )}
                <span className="room-detail-status">
                  Availability: <strong>{availableRooms > 0 ? `${availableRooms} Rooms left` : 'Fully booked'}</strong>
                </span>
              </div>

              <div className="room-detail-specs">
                <div className="spec-card">
                  <IoPeopleOutline />
                  <div className="spec-info">
                    <span className="spec-label">Capacity</span>
                    <span className="spec-value">Max {category.maxGuests} guests</span>
                  </div>
                </div>
                <div className="spec-card">
                  <IoBedOutline />
                  <div className="spec-info">
                    <span className="spec-label">Bed Type</span>
                    <span className="spec-value">{category.bedType.charAt(0).toUpperCase() + category.bedType.slice(1)}</span>
                  </div>
                </div>
                <div className="spec-card">
                  <IoExpandOutline />
                  <div className="spec-info">
                    <span className="spec-label">Room Size</span>
                    <span className="spec-value">{category.roomSize} sq. ft.</span>
                  </div>
                </div>
              </div>

              <div className="room-detail-description">
                <h3 className="section-subtitle-dark">About this Sanctuary</h3>
                <p>{category.description}</p>
              </div>

              <div className="room-detail-amenities">
                <h3 className="section-subtitle-dark">Sanctuary Amenities</h3>
                <div className="amenities-grid">
                  {category.amenities.map((amenity, idx) => (
                    <div key={idx} className="amenity-item">
                      <IoCheckmarkCircleOutline />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section */}
              <div className="room-detail-reviews">
                <h3 className="section-subtitle-dark">Guest Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="no-reviews-text">No reviews yet for this category. Stay with us and be the first to share your thoughts!</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((rev) => (
                      <div key={rev._id} className="review-item">
                        <div className="review-header">
                          <div className="review-avatar">
                            {rev.user?.name?.charAt(0).toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="review-author">{rev.user?.name || 'Anonymous Guest'}</p>
                            <div className="review-stars">
                              {[...Array(5)].map((_, idx) => (
                                <IoStarSharp
                                  key={idx}
                                  className={idx < rev.rating ? 'star-filled' : 'star-empty'}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {rev.title && <h4 className="review-title">{rev.title}</h4>}
                        <p className="review-comment">{rev.comment}</p>
                        {rev.managerReply && (
                          <div className="review-reply">
                            <p className="reply-header">Reply from Resort Manager</p>
                            <p className="reply-text">{rev.managerReply}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Booking Summary / CTA Card */}
          <div className="room-detail-sidebar">
            <div className="booking-cta-card glass">
              <div className="cta-price">
                <span className="price-amount">₹{category.basePrice.toLocaleString()}</span>
                <span className="price-unit">/ night</span>
              </div>
              <p className="price-note">Excluding taxes & seasonal surcharges</p>
              
              <div className="cta-divider" />

              <div className="cta-benefits">
                <div className="benefit-item">
                  <IoCheckmarkCircleOutline />
                  <span>Free Welcome Drink</span>
                </div>
                <div className="benefit-item">
                  <IoCheckmarkCircleOutline />
                  <span>Complimentary Breakfast</span>
                </div>
                <div className="benefit-item">
                  <IoCheckmarkCircleOutline />
                  <span>Access to Infinity Pool & Spa</span>
                </div>
                <div className="benefit-item">
                  <IoCheckmarkCircleOutline />
                  <span>Flexible cancellation options</span>
                </div>
              </div>

              <Button
                variant="accent"
                size="lg"
                fullWidth
                onClick={() => navigate(`/search?category=${category._id}`)}
              >
                Check Availability & Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;

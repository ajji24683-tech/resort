import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomsAPI } from '../../api';
import {
  IoPeopleOutline,
  IoStarSharp,
  IoExpandOutline,
  IoBedOutline,
  IoArrowForward,
} from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import './RoomsPage.css';

const DEFAULT_IMAGE_MAP = {
  'deluxe-room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'garden-cottage': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'premium-suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'pool-villa': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
};

const RoomsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await roomsAPI.getCategories();
        setCategories(res.data.data.categories || []);
      } catch (err) {
        console.error('Error fetching room categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="rooms-loading">
        <Spinner size="lg" />
        <p>Discovering our premium sanctuaries...</p>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      {/* Banner */}
      <section className="rooms-hero">
        <div className="rooms-hero-overlay" />
        <div className="rooms-hero-content animate-fade-in-up">
          <span className="rooms-hero-tag">ACCOMMODATIONS</span>
          <h1 className="rooms-hero-title font-display">Our Premium Sanctuaries</h1>
          <p className="rooms-hero-subtitle">
            Immerse yourself in nature's absolute luxury. Each sanctuary is crafted with local materials, 
            premium furnishings, and private balconies that invite the surrounding beauty inside.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section rooms-list-section">
        <div className="container">
          <div className="rooms-list-grid">
            {categories.map((cat, index) => {
              const imageSrc =
                cat.images?.[0]?.url?.startsWith('http')
                  ? cat.images[0].url
                  : DEFAULT_IMAGE_MAP[cat.slug] || DEFAULT_IMAGE_MAP['deluxe-room'];

              return (
                <div key={cat._id} className={`rooms-list-card animate-fade-in-up stagger-${(index % 4) + 1}`}>
                  <div className="rooms-list-img-wrap">
                    <img src={imageSrc} alt={cat.name} className="rooms-list-img" />
                    <span className="rooms-list-price-badge">
                      ₹{cat.basePrice?.toLocaleString()}<small>/night</small>
                    </span>
                  </div>
                  <div className="rooms-list-info">
                    <div className="rooms-list-header">
                      <h2 className="rooms-list-name font-serif">{cat.name}</h2>
                      {cat.avgRating > 0 && (
                        <div className="rooms-list-rating">
                          <IoStarSharp className="star-icon" />
                          <span>{cat.avgRating.toFixed(1)}</span>
                          <small>({cat.reviewCount})</small>
                        </div>
                      )}
                    </div>
                    
                    <p className="rooms-list-desc">{cat.description}</p>
                    
                    <div className="rooms-list-specs">
                      <span className="spec-badge">
                        <IoPeopleOutline /> Up to {cat.maxGuests} guests
                      </span>
                      <span className="spec-badge">
                        <IoBedOutline /> {cat.bedType ? cat.bedType.charAt(0).toUpperCase() + cat.bedType.slice(1) : 'King'} Bed
                      </span>
                      {cat.roomSize > 0 && (
                        <span className="spec-badge">
                          <IoExpandOutline /> {cat.roomSize} sq. ft.
                        </span>
                      )}
                    </div>

                    <div className="rooms-list-amenities-wrap">
                      <h4 className="rooms-list-section-title">Sanctuary Amenities</h4>
                      <div className="rooms-list-amenities">
                        {cat.amenities?.slice(0, 6).map((amenity, idx) => (
                          <span key={idx} className="rooms-list-amenity-tag">{amenity}</span>
                        ))}
                        {cat.amenities?.length > 6 && (
                          <span className="rooms-list-amenity-tag-more">+{cat.amenities.length - 6} more</span>
                        )}
                      </div>
                    </div>

                    <div className="rooms-list-actions">
                      <Link to={`/rooms/${cat._id}`} className="view-details-link">
                        Explore Details <IoArrowForward />
                      </Link>
                      <Link to={`/book/${cat._id}`} className="btn btn-accent btn-sm">
                        Book Sanctuary
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default RoomsPage;

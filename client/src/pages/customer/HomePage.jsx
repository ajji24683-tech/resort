import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roomsAPI } from '../../api';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoBedOutline,
  IoArrowForwardOutline,
  IoSparklesOutline,
  IoWaterOutline,
  IoLeafOutline,
  IoWineOutline,
  IoLocationOutline,
  IoStarSharp,
  IoLogoFacebook,
  IoLogoInstagram,
  IoCloseOutline,
} from 'react-icons/io5';
import './HomePage.css';

const DEFAULT_IMAGE_MAP = {
  'deluxe-room': 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
  'garden-cottage': 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
  'premium-suite': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
  'pool-villa': 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85',
};

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Default dates
  const now = new Date();
  const defaultIn = new Date(now.getFullYear(), now.getMonth(), 3);
  const defaultOut = new Date(now.getFullYear(), now.getMonth(), 10);
  
  const formatDateToYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [checkIn, setCheckIn] = useState(formatDateToYMD(defaultIn));
  const [checkOut, setCheckOut] = useState(formatDateToYMD(defaultOut));
  const [guests, setGuests] = useState(2);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [catRes, revRes] = await Promise.all([
        roomsAPI.getCategories(),
        roomsAPI.getReviews({ limit: 4 }),
      ]);
      setCategories(catRes.data.data.categories || []);
      setReviews(revRes.data.data.reviews || []);
    } catch (err) {
      console.error('Error loading resort data:', err);
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/search?${params.toString()}`);
  };

  // Helper to extract day & month
  const getDayAndMonth = (dateStr) => {
    if (!dateStr) return { day: '03', month: 'SEPTEMBER' };
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[2];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return { day, month: MONTH_NAMES[monthIdx] || 'SEPTEMBER' };
    }
    return { day: '03', month: 'SEPTEMBER' };
  };

  const checkInDisplay = getDayAndMonth(checkIn);
  const checkOutDisplay = getDayAndMonth(checkOut);
  const today = formatDateToYMD(now);

  return (
    <div className="home-page">
      {/* ─── 1. HERO SECTION (Clean Lingers.it Style) ───────────────────── */}
      <section className="lingers-hero-viewport">
        {/* Full-bleed Scenic Photography */}
        <div className="hero-scenic-bg">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2200&q=88"
            alt="Ajiis Resort Amidst Mountain Vineyards and Blue Sky"
            className="hero-scenic-img"
          />
          <div className="hero-soft-vignette" />
        </div>

        {/* Left Floating Social Icons */}
        <div className="hero-social-stack">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-btn"
            aria-label="Ajiis Resort Facebook"
          >
            <IoLogoFacebook />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-btn"
            aria-label="Ajiis Resort Instagram"
          >
            <IoLogoInstagram />
          </a>
        </div>

        {/* Bottom Hero Strip: Booking Widget & Center Text */}
        <div className="hero-bottom-strip">
          {/* Bottom Left: Lingers 2-Part Date & Booking Widget */}
          <div className="lingers-floating-booking-bar">
            {/* White Date Block */}
            <div className="date-block-white" onClick={() => setShowFilterModal(true)}>
              {/* Check-In */}
              <div className="date-col">
                <span className="date-number font-serif">{checkInDisplay.day}</span>
                <span className="date-month font-sub">{checkInDisplay.month}</span>
                <IoCalendarOutline className="calendar-icon" />
              </div>

              <div className="date-separator-line" />

              {/* Check-Out */}
              <div className="date-col">
                <span className="date-number font-serif">{checkOutDisplay.day}</span>
                <span className="date-month font-sub">{checkOutDisplay.month}</span>
                <IoCalendarOutline className="calendar-icon" />
              </div>
            </div>

            {/* Stacked Taupe Action Buttons */}
            <div className="booking-actions-stacked">
              <button
                type="button"
                className="btn-enquire font-sub"
                onClick={() => setShowFilterModal(true)}
              >
                ENQUIRE
              </button>
              <button
                type="button"
                className="btn-book font-sub"
                onClick={handleSearch}
              >
                BOOK
              </button>
            </div>
          </div>

          {/* Bottom Center Headline: YOUR PLACE TO LINGER */}
          <div className="hero-center-headline">
            <h1 className="lingers-headline-text font-serif">
              YOUR PLACE TO LINGER
            </h1>
          </div>
        </div>
      </section>

      {/* ─── MODAL / EXPANDED FILTER: Check Availability ─────────────── */}
      {showFilterModal && (
        <div className="booking-modal-overlay animate-fade-in">
          <div className="booking-backdrop" onClick={() => setShowFilterModal(false)} />
          <div className="booking-modal-card">
            <div className="modal-header">
              <div>
                <span className="section-tag">RESERVATION & INQUIRY</span>
                <h3 className="modal-title font-serif">Plan Your Stay at Ajiis Resort</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowFilterModal(false)}
                aria-label="Close"
              >
                <IoCloseOutline />
              </button>
            </div>

            <form onSubmit={handleSearch} className="modal-filter-form">
              <div className="modal-form-grid">
                {/* Check-In */}
                <div className="modal-field">
                  <label><IoCalendarOutline /> Check-in</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    min={today}
                    required
                  />
                </div>

                {/* Check-Out */}
                <div className="modal-field">
                  <label><IoCalendarOutline /> Check-out</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    min={checkIn || today}
                    required
                  />
                </div>

                {/* Suite Type */}
                <div className="modal-field">
                  <label><IoBedOutline /> Suite Type</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Suites & Villas</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} (from ₹{cat.basePrice?.toLocaleString()}/night)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guests */}
                <div className="modal-field">
                  <label><IoPeopleOutline /> Guests</label>
                  <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="submit" className="btn btn-accent btn-lg modal-submit-btn">
                  <span>Check Availability</span>
                  <IoArrowForwardOutline />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 2. THE SANCTUARY / PHILOSOPHY (Section #sanctuary) ───────── */}
      <section id="sanctuary" className="section philosophy-section">
        <div className="container">
          <div className="philosophy-grid">
            <div className="philosophy-text-col">
              <span className="section-tag">THE PHILOSOPHY</span>
              <h2 className="section-title font-serif">
                Arrive. Breathe. <br />
                <span className="italic-accent">Linger a little longer.</span>
              </h2>

              <p className="philosophy-lead">
                Ajiis Resort is created for travelers seeking mindful solitude and natural harmony without sacrificing the pinnacle of bespoke hospitality.
              </p>

              <div className="philosophy-pillars">
                <div className="pillar-item">
                  <span className="pillar-num font-display">I</span>
                  <div className="pillar-content">
                    <h4>Space, Stone & Wood</h4>
                    <p>Architecture that blends warm natural timbers, artisanal stone, and generous panoramic glass opening to endless views.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-num font-display">II</span>
                  <div className="pillar-content">
                    <h4>Unhurried Wellness</h4>
                    <p>Private forest saunas, temperature-balanced infinity baths, and ancient Ayurvedic rituals tailored to your rhythm.</p>
                  </div>
                </div>

                <div className="pillar-item">
                  <span className="pillar-num font-display">III</span>
                  <div className="pillar-content">
                    <h4>Sensory Gastronomy</h4>
                    <p>Honest cooking inspired by organic orchard produce, fragrant spices, and slow culinary traditions.</p>
                  </div>
                </div>
              </div>

              <div className="philosophy-action">
                <Link to="/rooms" className="btn btn-outline">
                  <span>Explore Our Suites</span>
                  <IoArrowForwardOutline />
                </Link>
              </div>
            </div>

            <div className="philosophy-image-col">
              <div className="image-composition">
                <div className="img-main-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=85"
                    alt="Ajiis Resort Terrace and Mountain Scenery"
                    className="img-main"
                  />
                </div>
                <div className="img-sub-wrap">
                  <img
                    src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=85"
                    alt="Wellness Relax Corner"
                    className="img-sub"
                  />
                  <div className="img-badge font-display">
                    <span>EST. 2026</span>
                    <small>SANCTUARY</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. SUITES & RESIDENCES SHOWCASE (Section #suites) ───────── */}
      <section id="suites" className="section suites-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">ACCOMMODATIONS</span>
            <h2 className="section-title font-serif">Suites & Private Villas</h2>
            <p className="section-subtitle">
              Each room is designed as a sanctuary of privacy, flooded with soft daylight and framing captivating views of the valley.
            </p>
          </div>

          <div className="suites-editorial-grid">
            {categories.map((cat) => {
              const imageSrc =
                cat.images?.[0]?.url?.startsWith('http')
                  ? cat.images[0].url
                  : DEFAULT_IMAGE_MAP[cat.slug] || DEFAULT_IMAGE_MAP['deluxe-room'];

              return (
                <div key={cat._id} className="suite-editorial-card editorial-card">
                  <div className="suite-card-image-wrap">
                    <img src={imageSrc} alt={cat.name} className="suite-img" />
                    <div className="suite-card-tag-overlay">
                      <span className="suite-category-badge">
                        {cat.bedType ? `${cat.bedType.toUpperCase()} SUITE` : 'SANCTUARY'}
                      </span>
                    </div>
                  </div>

                  <div className="suite-card-details">
                    <div className="suite-card-header">
                      <h3 className="suite-name font-serif">{cat.name}</h3>
                      <div className="suite-price-tag">
                        <span className="from-label">From</span>
                        <span className="amount font-serif">₹{cat.basePrice?.toLocaleString()}</span>
                        <span className="per-night">/ night</span>
                      </div>
                    </div>

                    <p className="suite-description">
                      {cat.shortDescription || cat.description?.substring(0, 120) + '...'}
                    </p>

                    <div className="suite-specs-bar">
                      <div className="spec-item">
                        <IoPeopleOutline className="spec-icon" />
                        <span>Up to {cat.maxGuests} Guests</span>
                      </div>
                      <div className="spec-item">
                        <IoBedOutline className="spec-icon" />
                        <span>{cat.bedType || 'King'} Bed</span>
                      </div>
                      {cat.roomSize > 0 && (
                        <div className="spec-item">
                          <IoSparklesOutline className="spec-icon" />
                          <span>{cat.roomSize} sq ft</span>
                        </div>
                      )}
                    </div>

                    <div className="suite-card-footer">
                      <Link to={`/rooms/${cat._id}`} className="suite-discover-link">
                        <span>Discover Suite</span>
                        <IoArrowForwardOutline />
                      </Link>
                      <Link to={`/book/${cat._id}`} className="btn btn-accent btn-sm">
                        Reserve
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="suites-view-all">
            <Link to="/rooms" className="btn btn-outline btn-lg">
              <span>View All Suites & Floorplans</span>
              <IoArrowForwardOutline />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4. THE EXPERIENCES (Section #experiences) ────────────────── */}
      <section id="experiences" className="section experiences-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">EXPERIENCES</span>
            <h2 className="section-title font-serif">Moments That Linger</h2>
            <p className="section-subtitle">
              Immerse yourself in gentle rhythms: from steam baths scented with mountain pine to slow wine tastings at sunset.
            </p>
          </div>

          <div className="experiences-cards-grid">
            {/* Experience 1 */}
            <div className="experience-card">
              <div className="exp-img-box">
                <img
                  src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=900&q=80"
                  alt="Panoramic Infinity Pool"
                />
                <div className="exp-badge">
                  <IoWaterOutline /> WELLNESS
                </div>
              </div>
              <div className="exp-content">
                <h3 className="exp-title font-serif">The Valley Infinity Pool</h3>
                <p className="exp-text">
                  Float suspended above emerald treetops with panoramic mountain horizons, heated naturally year-round.
                </p>
              </div>
            </div>

            {/* Experience 2 */}
            <div className="experience-card">
              <div className="exp-img-box">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80"
                  alt="Forest Ayurvedic Spa"
                />
                <div className="exp-badge">
                  <IoLeafOutline /> REJUVENATION
                </div>
              </div>
              <div className="exp-content">
                <h3 className="exp-title font-serif">Botanical Spa & Sauna</h3>
                <p className="exp-text">
                  Rebalance your vital energy with aromatic herbal compresses, private hot stone baths, and bespoke treatments.
                </p>
              </div>
            </div>

            {/* Experience 3 */}
            <div className="experience-card">
              <div className="exp-img-box">
                <img
                  src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80"
                  alt="Farm to Table Dining"
                />
                <div className="exp-badge">
                  <IoWineOutline /> GASTRONOMY
                </div>
              </div>
              <div className="exp-content">
                <h3 className="exp-title font-serif">Estate Dining & Cellar</h3>
                <p className="exp-text">
                  Artisanal 5-course dinners celebrating organic valley harvests paired with rare regional and international vintages.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. EDITORIAL QUOTE BANNER ─────────────────────────────────── */}
      <section className="quote-banner">
        <div className="quote-banner-bg">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
            alt="Misty Mountain Dawn"
          />
          <div className="quote-overlay" />
        </div>
        <div className="container">
          <div className="quote-content">
            <span className="quote-tag font-display">AJIIS ATMOSPHERE</span>
            <blockquote className="quote-body font-serif">
              “In the stillness of our mountain valley, we rediscover what matters most — the profound art of taking one's time.”
            </blockquote>
            <span className="quote-author font-sub">The Ajiis Philosophy</span>
          </div>
        </div>
      </section>

      {/* ─── 6. TESTIMONIALS / GUEST VOICES (Section #testimonials) ───── */}
      <section id="testimonials" className="section testimonials-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">IMPRESSIONS</span>
            <h2 className="section-title font-serif">Words From Our Guests</h2>
          </div>

          <div className="testimonials-editorial-grid">
            {(reviews.length > 0
              ? reviews
              : [
                  {
                    _id: '1',
                    comment:
                      'Ajiis Resort felt like entering another world. The silence, the attentive butler service, and the sunset from the pool villa are unforgettable.',
                    rating: 5,
                    user: { name: 'Elena Rostova' },
                    category: { name: 'Pool Villa' },
                  },
                  {
                    _id: '2',
                    comment:
                      'An absolute masterclass in Italian-inspired minimal luxury. The dining was Michelin quality and the suites are pure architectural poetry.',
                    rating: 5,
                    user: { name: 'Marc & Sophie Weber' },
                    category: { name: 'Premium Suite' },
                  },
                  {
                    _id: '3',
                    comment:
                      'The spa rituals and morning mist over the valley made our honeymoon magical. We already reserved our return for next spring.',
                    rating: 5,
                    user: { name: 'Kavita & Arjun Nair' },
                    category: { name: 'Garden Cottage' },
                  },
                ]
            ).map((rev) => (
              <div key={rev._id} className="testimonial-editorial-card editorial-card">
                <div className="rev-stars">
                  {[...Array(5)].map((_, i) => (
                    <IoStarSharp
                      key={i}
                      className={i < (rev.rating || 5) ? 'star-gold' : 'star-muted'}
                    />
                  ))}
                </div>
                <p className="rev-quote font-serif">"{rev.comment}"</p>
                <div className="rev-author-box">
                  <div className="rev-avatar">
                    {rev.user?.name?.charAt(0)?.toUpperCase() || 'G'}
                  </div>
                  <div>
                    <h5 className="rev-author-name">{rev.user?.name || 'Verified Guest'}</h5>
                    <span className="rev-stay-type">
                      {rev.category?.name || 'Suite Resident'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. LOCATION & ARRIVAL (Section #contact) ──────────────────── */}
      <section id="contact" className="section arrival-cta-section">
        <div className="container">
          <div className="arrival-card glass">
            <div className="arrival-content">
              <span className="section-tag">LOCATION & RESERVATIONS</span>
              <h2 className="arrival-title font-serif">Your Journey to Ajiis Begins</h2>
              <p className="arrival-desc">
                Located in the serene mountain foothills. Seamlessly reachable with our private chauffeur service from the airport or scenic railway.
              </p>

              <div className="arrival-highlights">
                <div className="arr-item">
                  <IoLocationOutline className="arr-icon" />
                  <div>
                    <strong>Ajiis Hill Estate</strong>
                    <span>Kerala / South Valley, India</span>
                  </div>
                </div>
                <div className="arr-item">
                  <IoSparklesOutline className="arr-icon" />
                  <div>
                    <strong>Direct Concierge</strong>
                    <span>concierge@ajiisresort.com</span>
                  </div>
                </div>
              </div>

              <div className="arrival-cta-btns">
                <button
                  type="button"
                  onClick={() => setShowFilterModal(true)}
                  className="btn btn-accent btn-lg"
                >
                  <span>Reserve Your Stay</span>
                  <IoArrowForwardOutline />
                </button>
                <Link to="/rooms" className="btn btn-outline btn-lg">
                  Explore Suites
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

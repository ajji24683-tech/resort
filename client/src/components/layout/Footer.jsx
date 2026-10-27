import { Link } from 'react-router-dom';
import { IoLocationOutline, IoCallOutline, IoMailOutline } from 'react-icons/io5';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top-strip">
        <div className="container">
          <div className="footer-intro-brand">
            <span className="footer-brand-tag">SANCTUARY & SUITES</span>
            <h3 className="footer-brand-title font-display">AJIIS RESORT</h3>
            <p className="footer-brand-desc">
              A serene retreat woven into nature’s quiet grandeur. Where stillness meets bespoke luxury, and every second invites you to linger.
            </p>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-columns-grid">
            {/* Column 1: Accommodations */}
            <div className="footer-col">
              <h4 className="footer-col-title">Accommodations</h4>
              <ul className="footer-links-list">
                <li><Link to="/rooms">Deluxe Garden Rooms</Link></li>
                <li><Link to="/rooms">Premium Panoramic Suites</Link></li>
                <li><Link to="/rooms">Private Infinity Pool Villas</Link></li>
                <li><Link to="/rooms">Forest Sanctuary Cottages</Link></li>
                <li><Link to="/search">Availability & Rates</Link></li>
              </ul>
            </div>

            {/* Column 2: The Experience */}
            <div className="footer-col">
              <h4 className="footer-col-title">The Sanctuary</h4>
              <ul className="footer-links-list">
                <li><Link to="/#wellness">Alpine & Ayurvedic Spa</Link></li>
                <li><Link to="/#experiences">Valley View Infinity Pool</Link></li>
                <li><Link to="/#dining">Farm-to-Table Gastronomy</Link></li>
                <li><Link to="/#experiences">Vineyard & Valley Trails</Link></li>
                <li><Link to="/#story">Our Philosophy</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact & Arrival */}
            <div className="footer-col">
              <h4 className="footer-col-title">Concierge & Arrival</h4>
              <ul className="footer-contact-list">
                <li>
                  <IoLocationOutline className="contact-icon" />
                  <span>Ajiis Hill Estate, Mountain Valley Road, 695001</span>
                </li>
                <li>
                  <IoCallOutline className="contact-icon" />
                  <a href="tel:+914711550970">+91 471 155 0970</a>
                </li>
                <li>
                  <IoMailOutline className="contact-icon" />
                  <a href="mailto:concierge@ajiisresort.com">concierge@ajiisresort.com</a>
                </li>
                <li className="coordinates-tag">
                  GPS: 46°28'15.4"N 11°16'52.7"E
                </li>
              </ul>
            </div>

            {/* Column 4: Operational Hours */}
            <div className="footer-col">
              <h4 className="footer-col-title">Guest Services</h4>
              <p className="footer-col-text">
                Front Desk & Concierge: 24/7<br />
                Check-in: from 15:00<br />
                Check-out: until 11:00
              </p>
              <div className="footer-socials">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Instagram</a>
                <span>•</span>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
                <span>•</span>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">Pinterest</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p className="copyright-text">
              &copy; {new Date().getFullYear()} AJIIS RESORT | Suites & Residence. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <Link to="/privacy">Privacy Notice</Link>
              <span>•</span>
              <Link to="/terms">Terms & Conditions</Link>
              <span>•</span>
              <Link to="/impressum">Impressum</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoNotificationsOutline, IoCheckmarkDoneOutline, IoTrashBinOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.data.notifications || []);
      setUnreadCount(res.data.data.unread || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all read');
    }
  };

  return (
    <div className="notifications-page">
      <div className="container-sm">
        <div className="notif-header">
          <h1 className="notif-title font-display">
            <IoNotificationsOutline /> In-App Notifications
          </h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="mark-all-btn">
              <IoCheckmarkDoneOutline /> Mark All Read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="notif-loading">
            <Spinner size="lg" />
            <p>Loading notification center...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notif-card glass animate-fade-in">
            <IoNotificationsOutline className="no-notif-icon" />
            <h3>All Caught Up!</h3>
            <p>You have no notifications or updates at this moment.</p>
          </div>
        ) : (
          <div className="notif-list animate-fade-in-up">
            {notifications.map((n) => (
              <div key={n._id} className={`notif-item glass ${!n.isRead ? 'unread' : ''}`}>
                <div className="notif-content-wrap">
                  <span className="notif-badge-type">{n.type}</span>
                  <h3 className="notif-item-title font-heading">{n.title}</h3>
                  <p className="notif-message">{n.message}</p>
                  <small className="notif-time">{new Date(n.createdAt).toLocaleString()}</small>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="mark-single-read-btn"
                    title="Mark as read"
                  >
                    <IoCheckmarkDoneOutline />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

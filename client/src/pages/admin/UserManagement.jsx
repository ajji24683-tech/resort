import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoSearchOutline, IoAddOutline, IoFilterOutline, IoTrashOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Modal
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    staffType: 'housekeeping',
    phone: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (roleFilter) params.role = roleFilter;
      if (searchQuery) params.search = searchQuery;
      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data.users || []);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this account?')) return;
    try {
      await adminAPI.deactivateUser(id);
      toast.success('Account deactivated successfully!');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...userForm };
      if (payload.role !== 'staff') {
        delete payload.staffType;
      }
      await adminAPI.createUser(payload);
      toast.success('Account created successfully!');
      setUserModalOpen(false);
      setUserForm({ name: '', email: '', password: '', role: 'staff', staffType: 'housekeeping', phone: '' });
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        toast.error(data.errors.join(', '));
      } else {
        toast.error(data?.message || 'Failed to create account');
      }
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="user-management">
      <div className="users-actions-bar glass">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); }} className="search-wrap">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="filter-wrap">
          <IoFilterOutline />
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="manager">Managers</option>
            <option value="staff">Staff Members</option>
            <option value="admin">Administrators</option>
          </select>
        </div>

        <Button variant="primary" size="sm" onClick={() => setUserModalOpen(true)}>
          <IoAddOutline /> Add Account
        </Button>
      </div>

      {loading ? (
        <div className="users-loading">
          <Spinner size="lg" />
          <p>Querying System Accounts Ledger...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="no-records glass">
          <h3>No Accounts Discovered</h3>
          <p>No user profiles matching your filters are currently registered.</p>
        </div>
      ) : (
        <div className="table-responsive glass">
          <table className="operations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Staff Department</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <strong>{u.name}</strong>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'manager' ? 'accent' : u.role === 'staff' ? 'info' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    {u.staffType ? <span className="dept-badge">{u.staffType.toUpperCase()}</span> : '—'}
                  </td>
                  <td>
                    <Badge variant={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'active' : 'suspended'}
                    </Badge>
                  </td>
                  <td className="text-right">
                    {u.isActive && u.role !== 'admin' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDeactivate(u._id)} title="Suspend user">
                        <IoTrashOutline style={{ color: 'var(--color-danger)' }} />
                      </Button>
                    )}
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

      {/* Add User Modal */}
      <Modal isOpen={userModalOpen} onClose={() => setUserModalOpen(false)} title="Register Operations Account">
        <form onSubmit={handleCreateUserSubmit} className="user-create-form">
          <Input
            label="Full Name"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            placeholder="E.g., Samantha Jones"
            required
          />
          <Input
            type="email"
            label="Email Address"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            placeholder="you@yashiiiresort.com"
            required
          />
          <Input
            type="password"
            label="Initial Password"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />
          <Input
            label="Contact Phone"
            value={userForm.phone}
            onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            placeholder="Phone number"
          />

          <div className="input-group">
            <label className="input-label">Account Role</label>
            <select
              className="input-field"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              required
            >
              <option value="staff">Housekeeping/Maintenance Staff</option>
              <option value="manager">Operations Manager</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          {userForm.role === 'staff' && (
            <div className="input-group">
              <label className="input-label">Staff Department</label>
              <select
                className="input-field"
                value={userForm.staffType}
                onChange={(e) => setUserForm({ ...userForm, staffType: e.target.value })}
                required
              >
                <option value="housekeeping">Housekeeping (Room Cleaning)</option>
                <option value="maintenance">Maintenance (Engineering Repairs)</option>
                <option value="front_desk">Front Desk (Guest Relations)</option>
                <option value="security">Security Patrol</option>
              </select>
            </div>
          )}

          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setUserModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={formLoading}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;

import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoHammerOutline, IoPersonOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './MaintenanceBoard.css';

const MaintenanceBoard = () => {
  const [issues, setIssues] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    fetchIssuesAndStaff();
  }, []);

  const fetchIssuesAndStaff = async () => {
    setLoading(true);
    try {
      const [issuesRes, staffRes] = await Promise.all([
        managerAPI.getMaintenance(),
        managerAPI.getStaff(),
      ]);
      setIssues(issuesRes.data.data.issues || []);
      const maintStaff = (staffRes.data.data.staff || []).filter(
        (member) => member.role === 'staff' && member.staffType === 'maintenance'
      );
      setStaff(maintStaff);
    } catch (err) {
      console.error('Error fetching maintenance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (issueId) => {
    if (!selectedStaffId) {
      toast.error('Choose a technician');
      return;
    }
    try {
      await managerAPI.assignMaintenance(issueId, selectedStaffId);
      toast.success('Technician assigned successfully!');
      setAssigningId(null);
      setSelectedStaffId('');
      fetchIssuesAndStaff();
    } catch (err) {
      toast.error('Assignment failed');
    }
  };

  const handleResolve = async (issueId) => {
    try {
      await managerAPI.resolveMaintenance(issueId, { notes: 'Repair completed successfully.', actualCost: 0 });
      toast.success('Issue marked as resolved! Awaiting manager verification.');
      fetchIssuesAndStaff();
    } catch (err) {
      toast.error('Resolve action failed');
    }
  };

  const handleVerify = async (issueId) => {
    try {
      await managerAPI.verifyMaintenance(issueId);
      toast.success('Maintenance verified! Room is now Available.');
      fetchIssuesAndStaff();
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'completed': return 'info';
      case 'in_progress': return 'warning';
      case 'reported': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="maintenance-board">
      <div className="maintenance-header-bar glass">
        <h3>Room Maintenance & Repairs Dispatch</h3>
        <p>Allocate engineering staff to reported room failures and verify standard repairs completion.</p>
      </div>

      {loading ? (
        <div className="maintenance-loading">
          <Spinner size="lg" />
          <p>Connecting Engineering Services Grid...</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="no-issues-card glass">
          <h3>No Maintenance Issues Reported</h3>
          <p>Resort physical facilities are currently fully operational.</p>
        </div>
      ) : (
        <div className="table-responsive glass">
          <table className="operations-table">
            <thead>
              <tr>
                <th>Sanctuary Room</th>
                <th>Category</th>
                <th>Description</th>
                <th>Priority</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td>
                    <strong>Room {issue.room?.roomNumber || '—'}</strong>
                  </td>
                  <td>
                    <span className="issue-cat">{(issue.category || 'General').toUpperCase()}</span>
                  </td>
                  <td>
                    <p className="issue-desc-text">{issue.description}</p>
                  </td>
                  <td>
                    <Badge variant={issue.priority === 'critical' || issue.priority === 'high' ? 'danger' : 'warning'}>
                      {issue.priority || 'medium'}
                    </Badge>
                  </td>
                  <td>
                    {assigningId === issue._id ? (
                      <div className="assignment-dropdown-wrap">
                        <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
                          <option value="">Select Technician...</option>
                          {staff.map((m) => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                          ))}
                        </select>
                        <Button variant="primary" size="sm" onClick={() => handleAssign(issue._id)}>OK</Button>
                        <Button variant="ghost" size="sm" onClick={() => setAssigningId(null)}>Cancel</Button>
                      </div>
                    ) : issue.assignedTo?.name ? (
                      <span className="assigned-tech-name">
                        <IoPersonOutline /> {issue.assignedTo.name}
                      </span>
                    ) : (
                      <span className="unassigned-tech">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(issue.status)}>{issue.status}</Badge>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons-wrap">
                      {issue.status === 'reported' && assigningId !== issue._id && (
                        <Button variant="primary" size="sm" onClick={() => setAssigningId(issue._id)}>
                          Assign Staff
                        </Button>
                      )}
                      {issue.status === 'in_progress' && (
                        <Button variant="accent" size="sm" onClick={() => handleResolve(issue._id)}>
                          Mark Resolved
                        </Button>
                      )}
                      {issue.status === 'completed' && (
                        <Button variant="primary" size="sm" onClick={() => handleVerify(issue._id)}>
                          <IoCheckmarkCircleOutline /> Verify Repair
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MaintenanceBoard;

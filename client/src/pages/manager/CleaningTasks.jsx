import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoBrushOutline, IoPersonOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './CleaningTasks.css';

const CleaningTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');

  useEffect(() => {
    fetchTasksAndStaff();
  }, []);

  const fetchTasksAndStaff = async () => {
    setLoading(true);
    try {
      const [tasksRes, staffRes] = await Promise.all([
        managerAPI.getCleaningTasks(),
        managerAPI.getStaff(),
      ]);
      setTasks(tasksRes.data.data.tasks || []);
      // Filter staff list to only Housekeeping staff
      const cleanStaff = (staffRes.data.data.staff || []).filter(
        (member) => member.role === 'staff' && member.staffType === 'housekeeping'
      );
      setStaff(cleanStaff);
    } catch (err) {
      console.error('Error loading cleaning tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (taskId) => {
    if (!selectedStaffId) {
      toast.error('Please choose a housekeeper to assign');
      return;
    }
    try {
      await managerAPI.assignCleaning(taskId, selectedStaffId);
      toast.success('Housekeeper assigned! Cleaning task set to In Progress.');
      setAssigningTaskId(null);
      setSelectedStaffId('');
      fetchTasksAndStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="cleaning-tasks">
      <div className="cleaning-header-bar glass">
        <h3>Housekeeping Task Dispatch Panel</h3>
        <p>Assign room cleaning tasks to housekeeping staff and monitor task completion status.</p>
      </div>

      {loading ? (
        <div className="cleaning-loading">
          <Spinner size="lg" />
          <p>Connecting Housekeeping Service Hub...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks-card glass">
          <h3>All Rooms Cleaned</h3>
          <p>No active cleaning or sanitization tasks are currently queued.</p>
        </div>
      ) : (
        <div className="table-responsive glass">
          <table className="operations-table">
            <thead>
              <tr>
                <th>Sanctuary Room</th>
                <th>Priority</th>
                <th>Assigned Housekeeper</th>
                <th>Task Status</th>
                <th>Timestamps</th>
                <th className="text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <div className="room-detail">
                      <strong>{task.room?.roomNumber ? `Room ${task.room.roomNumber}` : 'Room — (Unassigned)'}</strong>
                      {task.room?.floor !== undefined && <small>Floor {task.room.floor}</small>}
                    </div>
                  </td>
                  <td>
                    <Badge variant={task.priority === 'high' || task.priority === 'urgent' ? 'danger' : 'info'}>
                      {task.priority || 'medium'}
                    </Badge>
                  </td>
                  <td>
                    {assigningTaskId === task._id ? (
                      <div className="assignment-dropdown-wrap">
                        <select
                          value={selectedStaffId}
                          onChange={(e) => setSelectedStaffId(e.target.value)}
                        >
                          <option value="">Choose Staff...</option>
                          {staff.map((member) => (
                            <option key={member._id} value={member._id}>{member.name}</option>
                          ))}
                        </select>
                        <Button variant="primary" size="sm" onClick={() => handleAssignSubmit(task._id)}>
                          OK
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setAssigningTaskId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : task.assignedTo?.name ? (
                      <span className="cleaner-assigned-name">
                        <IoPersonOutline /> {task.assignedTo.name}
                      </span>
                    ) : (
                      <span className="unassigned-text">Unassigned</span>
                    )}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(task.status)}>{task.status ? task.status.replace('_', ' ') : 'pending'}</Badge>
                  </td>
                  <td>
                    <div className="time-details">
                      {task.startedAt && <small>Started: {new Date(task.startedAt).toLocaleTimeString()}</small>}
                      {task.completedAt && <small>Done: {new Date(task.completedAt).toLocaleTimeString()}</small>}
                    </div>
                  </td>
                  <td className="text-right">
                    {task.status === 'pending' && assigningTaskId !== task._id && (
                      <Button variant="primary" size="sm" onClick={() => setAssigningTaskId(task._id)}>
                        Dispatch Staff
                      </Button>
                    )}
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

export default CleaningTasks;

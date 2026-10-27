import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { toast } from 'react-hot-toast';
import { IoShieldCheckmarkOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoHammerOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import './Inspections.css';

const Inspections = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fail/Maintenance modal states
  const [activeInspectionId, setActiveInspectionId] = useState(null);
  const [notes, setNotes] = useState('');
  const [modalType, setModalType] = useState('fail'); // 'fail' or 'maintenance'
  const [maintenanceCategory, setMaintenanceCategory] = useState('plumbing');
  const [priority, setPriority] = useState('medium');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const res = await managerAPI.getInspections();
      setInspections(res.data.data.inspections || []);
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePass = async (id) => {
    try {
      await managerAPI.submitInspection(id, {
        status: 'passed',
        notes: 'Room inspected and meets all luxury standards.',
      });
      toast.success('Inspection passed! Room is now Available.');
      fetchInspections();
    } catch (err) {
      toast.error('Failed to submit inspection pass');
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error('Please enter details or comments');
      return;
    }
    setSubmitLoading(true);
    try {
      if (modalType === 'fail') {
        // Failed inspection
        await managerAPI.submitInspection(activeInspectionId, {
          status: 'failed',
          notes,
        });
        toast.error('Inspection failed! Room queued back for housekeeping.');
      } else {
        // Flag maintenance
        // First verify/fail inspection, then trigger maintenance creation
        const inspection = inspections.find(i => i._id === activeInspectionId);
        
        await managerAPI.submitInspection(activeInspectionId, {
          status: 'failed',
          notes: `Failed due to maintenance: ${notes}`,
        });

        await managerAPI.createMaintenance({
          roomId: inspection.room?._id || inspection.room,
          category: maintenanceCategory,
          description: notes,
          priority,
        });
        toast.error('Room flagged for Maintenance! Room status set to Maintenance.');
      }
      setActiveInspectionId(null);
      setNotes('');
      fetchInspections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="inspections-queue">
      <div className="inspections-header glass">
        <h3>Room Sanitization Inspections</h3>
        <p>Inspect cleaned sanctuaries to verify they meet resort luxury standards before opening them to customers.</p>
      </div>

      {loading ? (
        <div className="inspections-loading">
          <Spinner size="lg" />
          <p>Connecting Quality Control Logs...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="no-inspections glass">
          <h3>No Pending Inspections</h3>
          <p>All cleaned sanctuaries have been inspected and released.</p>
        </div>
      ) : (
        <div className="inspections-list animate-fade-in-up">
          {inspections.map((insp) => (
            <div key={insp._id} className="inspection-card glass">
              <div className="insp-details">
                <div className="room-info">
                  <strong>Room {insp.room?.roomNumber || '—'}</strong>
                  {insp.room?.floor !== undefined && <small>Floor {insp.room.floor}</small>}
                </div>
                <div className="insp-checklist-meta">
                  <span>Sanitized checklist verification pending.</span>
                </div>
              </div>

              <div className="insp-actions">
                <Button variant="primary" onClick={() => handlePass(insp._id)}>
                  <IoCheckmarkCircleOutline /> Pass Standards
                </Button>
                <Button variant="danger" onClick={() => { setModalType('fail'); setActiveInspectionId(insp._id); }}>
                  <IoCloseCircleOutline /> Fail / Re-clean
                </Button>
                <Button variant="secondary" onClick={() => { setModalType('maintenance'); setActiveInspectionId(insp._id); }}>
                  <IoHammerOutline /> Flag Maintenance
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action modal (Fail / Flag Maintenance) */}
      <Modal
        isOpen={activeInspectionId !== null}
        onClose={() => setActiveInspectionId(null)}
        title={modalType === 'fail' ? 'Reject Cleanliness Standards' : 'Flag Room for Maintenance'}
      >
        <form onSubmit={handleModalSubmit} className="inspection-action-form">
          <p className="modal-instruction-text">
            {modalType === 'fail' 
              ? 'Please describe the cleanliness standard failures. The housekeeper will receive these notes for correction.'
              : 'Please enter details for the maintenance ticket. The room will remain unavailable until repaired.'}
          </p>

          {modalType === 'maintenance' && (
            <>
              <div className="input-group">
                <label className="input-label">Maintenance Category</label>
                <select
                  className="input-field"
                  value={maintenanceCategory}
                  onChange={(e) => setMaintenanceCategory(e.target.value)}
                >
                  <option value="plumbing">Plumbing (leaks, shower, toilet)</option>
                  <option value="electrical">Electrical (wiring, lights, sockets)</option>
                  <option value="ac_heating">AC & Climate Control</option>
                  <option value="furniture">Furniture & Bedding</option>
                  <option value="appliance">TV / Safe / Appliances</option>
                  <option value="structural">Structural (walls, doors, ceiling)</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Ticket Priority</label>
                <select
                  className="input-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low (Non-urgent)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent)</option>
                  <option value="critical">Critical (Blocks check-ins)</option>
                </select>
              </div>
            </>
          )}

          <Input
            type="textarea"
            label="Details & Comments"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide specific notes..."
            required
          />

          <div className="modal-actions-buttons">
            <Button variant="ghost" onClick={() => setActiveInspectionId(null)}>Cancel</Button>
            <Button type="submit" variant="danger" loading={submitLoading}>
              {modalType === 'fail' ? 'Confirm Failure' : 'File Maintenance Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inspections;

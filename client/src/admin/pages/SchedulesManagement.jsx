import { useState, useEffect } from 'react';
import { activePlayAPI, playsAPI } from '../../services/api';

export default function SchedulesManagement() {
  const [schedules, setSchedules] = useState([]);
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    play_id: '',
    start_date: '',
    end_date: '',
    time: '',
    total_occupancy: 60, // Fixed 6x10 grid
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, playsRes] = await Promise.all([
        activePlayAPI.getAllSchedules(), // Use getAllSchedules for admin (no date filter)
        playsAPI.getAll(),
      ]);
      setSchedules(schedulesRes.data || []);
      setPlays(playsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        total_occupancy: 60, // Always 60 seats (6x10 grid)
      };

      if (editingSchedule) {
        await activePlayAPI.update(editingSchedule.id, data);
      } else {
        await activePlayAPI.create(data);
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      play_id: schedule.play_id ,
      start_date: schedule.start_date?.split('T')[0] || '',
      end_date: schedule.end_date?.split('T')[0] || '',
      time: schedule.time || '',
      total_occupancy: 60,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await activePlayAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule');
    }
  };

  const openAddModal = () => {
    setEditingSchedule(null);
    setFormData({
      play_id: '',
      start_date: '',
      end_date: '',
      time: '',
      total_occupancy: 60,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Extract just the date part to avoid timezone issues
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const getScheduleStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'unknown';
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const startStr = startDate.split('T')[0];
    const endStr = endDate.split('T')[0];

    if (todayStr < startStr) return 'upcoming';
    if (todayStr >= startStr && todayStr <= endStr) return 'active';
    return 'past';
  };

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="schedules-management">
      <div className="data-table-container">
        <div className="table-header">
          <h2>All Play Schedules</h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add Schedule
          </button>
        </div>

        {schedules.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Play</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Show Time</th>
                <th>Status</th>
                <th>Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => {
                const status = getScheduleStatus(schedule.start_date, schedule.end_date);
                return (
                  <tr key={schedule.id}>
                    <td>{schedule.playname}</td>
                    <td>{formatDate(schedule.start_date)}</td>
                    <td>{formatDate(schedule.end_date)}</td>
                    <td>{schedule.time}</td>
                    <td>
                      <span className={`badge badge-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td>60 (6x10)</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(schedule)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(schedule.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No schedules found. Add a schedule for a play!</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              Add Schedule
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Play</label>
                  <select
                    name="play_id"
                    value={formData.play_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a play</option>
                    {plays.map((play) => (
                      <option key={play.id} value={play.id}>
                        {play.playname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Show Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input
                    type="number"
                    value={60}
                    disabled
                  />
                  <small style={{ color: '#6b7280' }}>Fixed at 60 seats (6 rows x 10 columns)</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

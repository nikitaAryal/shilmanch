import { useState, useEffect } from 'react';
import { playsAPI } from '../../services/api';

export default function PlaysManagement() {
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlay, setEditingPlay] = useState(null);
  const [formData, setFormData] = useState({
    playname: '',
    director: '',
    duration: '',
    genre: '',
    description: '',
    image_url: '',
    added_by: 'Admin',
  });

  useEffect(() => {
    fetchPlays();
  }, []);

  const fetchPlays = async () => {
    try {
      const response = await playsAPI.getAll();
      setPlays(response.data || []);
    } catch (error) {
      console.error('Error fetching plays:', error);
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
      if (editingPlay) {
        await playsAPI.update(editingPlay.id, formData);
      } else {
        await playsAPI.create(formData);
      }
      fetchPlays();
      closeModal();
    } catch (error) {
      console.error('Error saving play:', error);
      alert('Failed to save play');
    }
  };

  const handleEdit = (play) => {
    setEditingPlay(play);
    setFormData({
      playname: play.playname,
      director: play.director,
      duration: play.duration,
      genre: play.genre,
      description: play.description || '',
      image_url: play.image_url || '',
      added_by: play.added_by || 'Admin',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this play?')) return;
    try {
      await playsAPI.delete(id);
      fetchPlays();
    } catch (error) {
      console.error('Error deleting play:', error);
      alert('Failed to delete play');
    }
  };

  const openAddModal = () => {
    setEditingPlay(null);
    setFormData({
      playname: '',
      director: '',
      duration: '',
      genre: '',
      description: '',
      image_url: '',
      added_by: 'Admin',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlay(null);
  };

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="plays-management">
      <div className="data-table-container">
        <div className="table-header">
          <h2>Plays Management</h2>
          <button className="btn btn-primary" onClick={openAddModal}>
            + Add New Play
          </button>
        </div>

        {plays.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Director</th>
                <th>Genre</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plays.map((play) => (
                <tr key={play.id}>
                  <td>{play.id}</td>
                  <td>{play.playname}</td>
                  <td>{play.director}</td>
                  <td>{play.genre}</td>
                  <td>{play.duration}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(play)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(play.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No plays found. Add your first play!</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              Add Play
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlay ? 'Edit Play' : 'Add New Play'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Play Name</label>
                  <input
                    type="text"
                    name="playname"
                    value={formData.playname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Director</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="pictures/play.jpg"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPlay ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

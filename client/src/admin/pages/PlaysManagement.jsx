import { useState, useEffect } from 'react';
import { playsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PlaysManagement() {
  const { user } = useAuth();
  const [plays, setPlays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlay, setEditingPlay] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    playname: '',
    director: '',
    duration: '',
    genre: '',
    description: '',
    image_url: '',
  });
  const [errors, setErrors] = useState({});

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image must be less than 5MB' });
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, image: 'Only JPEG, PNG, GIF, or WebP images are allowed' });
        return;
      }
      setErrors({ ...errors, image: '' });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.playname.trim()) {
      newErrors.playname = 'Play name is required';
    } else if (formData.playname.trim().length < 2) {
      newErrors.playname = 'Play name must be at least 2 characters';
    }

    if (!formData.director.trim()) {
      newErrors.director = 'Director name is required';
    }

    if (!formData.genre.trim()) {
      newErrors.genre = 'Genre is required';
    }

    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('playname', formData.playname);
      submitData.append('director', formData.director);
      submitData.append('duration', formData.duration);
      submitData.append('genre', formData.genre);
      submitData.append('description', formData.description);
      submitData.append('added_by', user?.id || null);

      if (imageFile) {
        submitData.append('image', imageFile);
      } else if (formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      if (editingPlay) {
        await playsAPI.update(editingPlay.id, submitData);
      } else {
        await playsAPI.create(submitData);
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
    });
    setImageFile(null);
    setImagePreview(play.image_url ? `/api/${play.image_url}` : null);
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
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlay(null);
    setErrors({});
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
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.playname) setErrors({ ...errors, playname: '' });
                    }}
                    className={errors.playname ? 'input-error' : ''}
                  />
                  {errors.playname && <span className="error-text">{errors.playname}</span>}
                </div>
                <div className="form-group">
                  <label>Director</label>
                  <input
                    type="text"
                    name="director"
                    value={formData.director}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.director) setErrors({ ...errors, director: '' });
                    }}
                    className={errors.director ? 'input-error' : ''}
                  />
                  {errors.director && <span className="error-text">{errors.director}</span>}
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.genre}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.genre) setErrors({ ...errors, genre: '' });
                    }}
                    className={errors.genre ? 'input-error' : ''}
                  />
                  {errors.genre && <span className="error-text">{errors.genre}</span>}
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (errors.duration) setErrors({ ...errors, duration: '' });
                    }}
                    placeholder="e.g., 2 hours"
                    className={errors.duration ? 'input-error' : ''}
                  />
                  {errors.duration && <span className="error-text">{errors.duration}</span>}
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
                  <label>Play Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`file-input ${errors.image ? 'input-error' : ''}`}
                  />
                  {errors.image && <span className="error-text">{errors.image}</span>}
                  {imagePreview && (
                    <div className="image-preview" style={{ marginTop: '10px' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                  )}
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

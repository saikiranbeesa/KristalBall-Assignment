import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PurchasesPage.css';

const PurchasesPage = ({ apiBase, user }) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    base_id: '',
    equipment_type_id: '',
    date_from: '',
    date_to: ''
  });
  const [formData, setFormData] = useState({
    base_id: '',
    equipment_type_id: '',
    quantity: '',
    purchase_date: '',
    cost: ''
  });

  useEffect(() => {
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await axios.get(`${apiBase}/purchases?${params}`);
      setPurchases(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/purchases`, formData);
      setShowForm(false);
      setFormData({
        base_id: '',
        equipment_type_id: '',
        quantity: '',
        purchase_date: '',
        cost: ''
      });
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add purchase');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="purchases-container">
      <div className="page-header">
        <h1>Purchases</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ New Purchase'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h2>Record New Purchase</h2>
          <form onSubmit={handleAddPurchase}>
            <div className="form-row">
              <div className="form-group">
                <label>Base ID *</label>
                <input
                  type="number"
                  value={formData.base_id}
                  onChange={(e) => setFormData({...formData, base_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Equipment Type ID *</label>
                <input
                  type="number"
                  value={formData.equipment_type_id}
                  onChange={(e) => setFormData({...formData, equipment_type_id: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Purchase Date *</label>
                <input
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Cost</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">Record Purchase</button>
          </form>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Equipment Type ID:</label>
          <input
            type="number"
            value={filters.equipment_type_id}
            onChange={(e) => handleFilterChange('equipment_type_id', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>From Date:</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>To Date:</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading purchases...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Base</th>
                <th>Quantity</th>
                <th>Purchase Date</th>
                <th>Cost</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan="6">No purchases found</td></tr>
              ) : (
                purchases.map((purchase, idx) => (
                  <tr key={idx}>
                    <td>{purchase.equipment_name}</td>
                    <td>{purchase.base_name}</td>
                    <td>{purchase.quantity}</td>
                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td>{purchase.cost ? `$${purchase.cost.toFixed(2)}` : '-'}</td>
                    <td>{purchase.created_by_username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;

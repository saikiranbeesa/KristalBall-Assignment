import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TransfersPage.css';

const TransfersPage = ({ apiBase, user }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    from_base_id: '',
    to_base_id: '',
    equipment_type_id: '',
    date_from: '',
    date_to: ''
  });
  const [formData, setFormData] = useState({
    from_base_id: '',
    to_base_id: '',
    equipment_type_id: '',
    quantity: '',
    transfer_date: ''
  });

  useEffect(() => {
    fetchTransfers();
  }, [filters]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.from_base_id) params.append('from_base_id', filters.from_base_id);
      if (filters.to_base_id) params.append('to_base_id', filters.to_base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await axios.get(`${apiBase}/transfers?${params}`);
      setTransfers(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/transfers`, formData);
      setShowForm(false);
      setFormData({
        from_base_id: '',
        to_base_id: '',
        equipment_type_id: '',
        quantity: '',
        transfer_date: ''
      });
      fetchTransfers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transfer');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="transfers-container">
      <div className="page-header">
        <h1>Transfers</h1>
        <button className="btn-add" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Close' : '+ New Transfer'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h2>Record New Transfer</h2>
          <form onSubmit={handleAddTransfer}>
            <div className="form-row">
              <div className="form-group">
                <label>From Base ID *</label>
                <input
                  type="number"
                  value={formData.from_base_id}
                  onChange={(e) => setFormData({...formData, from_base_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>To Base ID *</label>
                <input
                  type="number"
                  value={formData.to_base_id}
                  onChange={(e) => setFormData({...formData, to_base_id: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Equipment Type ID *</label>
                <input
                  type="number"
                  value={formData.equipment_type_id}
                  onChange={(e) => setFormData({...formData, equipment_type_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Transfer Date *</label>
                <input
                  type="date"
                  value={formData.transfer_date}
                  onChange={(e) => setFormData({...formData, transfer_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">Record Transfer</button>
          </form>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>From Base ID:</label>
          <input
            type="number"
            value={filters.from_base_id}
            onChange={(e) => handleFilterChange('from_base_id', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>To Base ID:</label>
          <input
            type="number"
            value={filters.to_base_id}
            onChange={(e) => handleFilterChange('to_base_id', e.target.value)}
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
        <div className="loading">Loading transfers...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                <th>From Base</th>
                <th>To Base</th>
                <th>Quantity</th>
                <th>Transfer Date</th>
                <th>Initiated By</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr><td colSpan="6">No transfers found</td></tr>
              ) : (
                transfers.map((transfer, idx) => (
                  <tr key={idx}>
                    <td>{transfer.equipment_name}</td>
                    <td>{transfer.from_base_name}</td>
                    <td>{transfer.to_base_name}</td>
                    <td>{transfer.quantity}</td>
                    <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                    <td>{transfer.initiated_by_username}</td>
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

export default TransfersPage;

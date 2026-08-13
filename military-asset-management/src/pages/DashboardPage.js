import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardPage.css';

const DashboardPage = ({ apiBase }) => {
  const [metrics, setMetrics] = useState([]);
  const [filters, setFilters] = useState({
    base_id: '',
    equipment_type_id: '',
    date_from: '',
    date_to: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [detailsData, setDetailsData] = useState([]);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await axios.get(`${apiBase}/dashboard/metrics?${params}`);
      setMetrics(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleNetMovementClick = async (metric) => {
    try {
      const response = await axios.get(
        `${apiBase}/dashboard/net-movement/${metric.base_id}/${metric.equipment_id}`,
        {
          params: {
            date_from: filters.date_from,
            date_to: filters.date_to
          }
        }
      );
      setDetailsData(response.data);
      setSelectedMetric(metric);
    } catch (err) {
      console.error('Failed to fetch net movement details', err);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard - Asset Metrics</h1>

      <div className="filters-section">
        <div className="filter-group">
          <label>Base ID:</label>
          <input
            type="number"
            value={filters.base_id}
            onChange={(e) => handleFilterChange('base_id', e.target.value)}
            placeholder="Enter base ID"
          />
        </div>

        <div className="filter-group">
          <label>Equipment Type ID:</label>
          <input
            type="number"
            value={filters.equipment_type_id}
            onChange={(e) => handleFilterChange('equipment_type_id', e.target.value)}
            placeholder="Enter equipment type ID"
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
        <div className="loading">Loading metrics...</div>
      ) : (
        <div className="metrics-grid">
          {metrics.length === 0 ? (
            <p>No metrics available</p>
          ) : (
            metrics.map((metric, idx) => (
              <div key={idx} className="metric-card">
                <h3>{metric.equipment_name}</h3>
                <p className="base-name">{metric.base_name}</p>

                <div className="metric-row">
                  <span>Opening Balance:</span>
                  <strong>{metric.opening_balance}</strong>
                </div>

                <div className="metric-row">
                  <span>Closing Balance:</span>
                  <strong>{metric.closing_balance}</strong>
                </div>

                <div className="metric-row net-movement">
                  <span>Net Movement:</span>
                  <button
                    className="net-movement-btn"
                    onClick={() => handleNetMovementClick(metric)}
                  >
                    {metric.net_movement}
                  </button>
                </div>

                <div className="metric-row">
                  <span>Purchases:</span>
                  <span>{metric.purchases}</span>
                </div>

                <div className="metric-row">
                  <span>Transfers In:</span>
                  <span>{metric.transfers_in}</span>
                </div>

                <div className="metric-row">
                  <span>Transfers Out:</span>
                  <span>{metric.transfers_out}</span>
                </div>

                <div className="metric-row">
                  <span>Assigned:</span>
                  <span>{metric.assigned}</span>
                </div>

                <div className="metric-row">
                  <span>Expended:</span>
                  <span>{metric.expended}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedMetric && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setSelectedMetric(null)}>&times;</span>
            <h2>Net Movement Details - {selectedMetric.equipment_name}</h2>

            <table className="details-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Date</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {detailsData.map((detail, idx) => (
                  <tr key={idx}>
                    <td>{detail.type}</td>
                    <td>{detail.quantity}</td>
                    <td>{new Date(detail.date).toLocaleDateString()}</td>
                    <td>{detail.recorded_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

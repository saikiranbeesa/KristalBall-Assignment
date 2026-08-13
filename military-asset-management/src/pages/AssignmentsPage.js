import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AssignmentsPage.css';

const AssignmentsPage = ({ apiBase, user }) => {
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [showExpendForm, setShowExpendForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [filters, setFilters] = useState({
    base_id: '',
    equipment_type_id: '',
    date_from: '',
    date_to: ''
  });
  const [assignFormData, setAssignFormData] = useState({
    base_id: '',
    personnel_id: '',
    equipment_type_id: '',
    quantity: '',
    assignment_date: ''
  });
  const [expendFormData, setExpendFormData] = useState({
    base_id: '',
    equipment_type_id: '',
    quantity: '',
    expended_date: '',
    reason: ''
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'assignments') {
      fetchAssignments();
    } else {
      fetchExpenditures();
    }
  }, [filters, activeTab]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await axios.get(`${apiBase}/assignments?${params}`);
      setAssignments(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenditures = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.base_id) params.append('base_id', filters.base_id);
      if (filters.equipment_type_id) params.append('equipment_type_id', filters.equipment_type_id);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await axios.get(`${apiBase}/assignments/expenditure?${params}`);
      setExpenditures(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch expenditures');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/assignments`, assignFormData);
      setShowAssignForm(false);
      setAssignFormData({
        base_id: '',
        personnel_id: '',
        equipment_type_id: '',
        quantity: '',
        assignment_date: ''
      });
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add assignment');
    }
  };

  const handleAddExpenditure = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiBase}/assignments/expenditure`, expendFormData);
      setShowExpendForm(false);
      setExpendFormData({
        base_id: '',
        equipment_type_id: '',
        quantity: '',
        expended_date: '',
        reason: ''
      });
      fetchExpenditures();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expenditure');
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="assignments-container">
      <div className="page-header">
        <h1>Assignments & Expenditures</h1>
        {activeTab === 'assignments' && (
          <button className="btn-add" onClick={() => setShowAssignForm(!showAssignForm)}>
            {showAssignForm ? 'Close' : '+ New Assignment'}
          </button>
        )}
        {activeTab === 'expenditures' && (
          <button className="btn-add" onClick={() => setShowExpendForm(!showExpendForm)}>
            {showExpendForm ? 'Close' : '+ New Expenditure'}
          </button>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button
          className={`tab ${activeTab === 'expenditures' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenditures')}
        >
          Expenditures
        </button>
      </div>

      {activeTab === 'assignments' && showAssignForm && (
        <div className="form-section">
          <h2>Record New Assignment</h2>
          <form onSubmit={handleAddAssignment}>
            <div className="form-row">
              <div className="form-group">
                <label>Base ID *</label>
                <input
                  type="number"
                  value={assignFormData.base_id}
                  onChange={(e) => setAssignFormData({...assignFormData, base_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Personnel ID *</label>
                <input
                  type="text"
                  value={assignFormData.personnel_id}
                  onChange={(e) => setAssignFormData({...assignFormData, personnel_id: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Equipment Type ID *</label>
                <input
                  type="number"
                  value={assignFormData.equipment_type_id}
                  onChange={(e) => setAssignFormData({...assignFormData, equipment_type_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={assignFormData.quantity}
                  onChange={(e) => setAssignFormData({...assignFormData, quantity: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Assignment Date *</label>
                <input
                  type="date"
                  value={assignFormData.assignment_date}
                  onChange={(e) => setAssignFormData({...assignFormData, assignment_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">Record Assignment</button>
          </form>
        </div>
      )}

      {activeTab === 'expenditures' && showExpendForm && (
        <div className="form-section">
          <h2>Record Expenditure</h2>
          <form onSubmit={handleAddExpenditure}>
            <div className="form-row">
              <div className="form-group">
                <label>Base ID *</label>
                <input
                  type="number"
                  value={expendFormData.base_id}
                  onChange={(e) => setExpendFormData({...expendFormData, base_id: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Equipment Type ID *</label>
                <input
                  type="number"
                  value={expendFormData.equipment_type_id}
                  onChange={(e) => setExpendFormData({...expendFormData, equipment_type_id: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={expendFormData.quantity}
                  onChange={(e) => setExpendFormData({...expendFormData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Expended Date *</label>
                <input
                  type="date"
                  value={expendFormData.expended_date}
                  onChange={(e) => setExpendFormData({...expendFormData, expended_date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={expendFormData.reason}
                  onChange={(e) => setExpendFormData({...expendFormData, reason: e.target.value})}
                  placeholder="Optional reason for expenditure"
                />
              </div>
            </div>

            <button type="submit" className="btn-submit">Record Expenditure</button>
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
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          {activeTab === 'assignments' && (
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Base</th>
                  <th>Personnel ID</th>
                  <th>Quantity</th>
                  <th>Assignment Date</th>
                  <th>Assigned By</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr><td colSpan="6">No assignments found</td></tr>
                ) : (
                  assignments.map((assignment, idx) => (
                    <tr key={idx}>
                      <td>{assignment.equipment_name}</td>
                      <td>{assignment.base_name}</td>
                      <td>{assignment.personnel_id}</td>
                      <td>{assignment.quantity}</td>
                      <td>{new Date(assignment.assignment_date).toLocaleDateString()}</td>
                      <td>{assignment.assigned_by_username}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'expenditures' && (
            <table>
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Base</th>
                  <th>Quantity</th>
                  <th>Expended Date</th>
                  <th>Reason</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {expenditures.length === 0 ? (
                  <tr><td colSpan="6">No expenditures found</td></tr>
                ) : (
                  expenditures.map((expenditure, idx) => (
                    <tr key={idx}>
                      <td>{expenditure.equipment_name}</td>
                      <td>{expenditure.base_name}</td>
                      <td>{expenditure.quantity}</td>
                      <td>{new Date(expenditure.expended_date).toLocaleDateString()}</td>
                      <td>{expenditure.reason || '-'}</td>
                      <td>{expenditure.recorded_by_username}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;

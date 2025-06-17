import React, { useState } from 'react';
import './ManagerUser.css';

interface User {
  id: number;
  name: string;
  email: string;
  birthDate: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

const ManagerUser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hard-coded data for now
  const [users] = useState<User[]>([
    {
      id: 1,
      name: 'Kunal Patil',
      email: 'admin12345@gmail.com',
      birthDate: '01-10-2021',
      createdDate: '11-10-2021',
      status: 'Active'
    },
    {
      id: 2,
      name: 'Kunal Patil',
      email: 'sss@gmail.com',
      birthDate: '01-10-2021',
      createdDate: '11-10-2021',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Kishan Khadela',
      email: 'khadela@gmail.com',
      birthDate: '01-10-2021',
      createdDate: '09-10-2021',
      status: 'Inactive'
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (id: number) => {
    console.log('Edit user:', id);
    // Add edit functionality here
  };

  const handleDelete = (id: number) => {
    console.log('Delete user:', id);
    // Add delete functionality here
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <div className="header-left">
          <div className="page-icon">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h1 className="page-title">Users</h1>
        </div>
        <button className="add-user-btn">
          Add User
        </button>
      </div>

      <div className="content-card">
        <div className="search-section">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Birth Date</th>
                <th>Created Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.birthDate}</td>
                  <td>{user.createdDate}</td>
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(user.id)}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagerUser;
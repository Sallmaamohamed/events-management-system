const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  loadAdminData();
});

async function loadAdminData() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Admin access requires authorization token.');
    return;
  }

  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    // Fetch Analytics
    const resStats = await fetch(`${API_BASE}/admin/analytics/overview`, { headers });
    if (resStats.ok) {
      const stats = await resStats.json();
      document.getElementById('statUsers').textContent = stats.totalUsers || 0;
      document.getElementById('statEvents').textContent = stats.totalEvents || 0;
      document.getElementById('statBookings').textContent = stats.totalBookings || 0;
      document.getElementById('statRevenue').textContent = `$${stats.totalRevenue || 0}`;
    }

    // Fetch Users
    const resUsers = await fetch(`${API_BASE}/admin/users`, { headers });
    if (resUsers.ok) {
      const users = await resUsers.json();
      renderUsersTable(users);
    }
  } catch (err) {
    console.error('Error fetching admin details:', err);
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user._id.substring(0, 8)}...</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>${user.status || 'Active'}</td>
    `;
    tbody.appendChild(row);
  });
}
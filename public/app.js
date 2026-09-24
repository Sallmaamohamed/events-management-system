const API_BASE = 'http://localhost:5000/api';
let isRegisterMode = false;

document.addEventListener('DOMContentLoaded', () => {
  fetchEvents();
  checkAuthStatus();
});

function checkAuthStatus() {
  const token = localStorage.getItem('token');
  const authBtn = document.getElementById('authBtn');
  const myTicketsLink = document.getElementById('myTicketsLink');

  if (token) {
    authBtn.textContent = 'Logout';
    authBtn.onclick = handleLogout;
    if (myTicketsLink) myTicketsLink.style.display = 'inline';
    fetchUserTickets();
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = toggleAuthModal;
    if (myTicketsLink) myTicketsLink.style.display = 'none';
  }
}

async function fetchEvents() {
  const searchQuery = document.getElementById('searchInput').value;
  try {
    const res = await fetch(`${API_BASE}/events?search=${searchQuery}`);
    const events = await res.json();
    renderEvents(events);
  } catch (err) {
    console.error('Error fetching events:', err);
  }
}

function renderEvents(events) {
  const grid = document.getElementById('eventsGrid');
  grid.innerHTML = '';

  if (!events || events.length === 0) {
    grid.innerHTML = '<p>No events found.</p>';
    return;
  }

  events.forEach(event => {
    const minPrice = event.tickets && event.tickets.length > 0 ? event.tickets[0].price : 0;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <p><strong>Category:</strong> ${event.category} | <strong>Location:</strong> ${event.location}</p>
      </div>
      <div class="card-footer">
        <span class="price-tag">From $${minPrice}</span>
        <button class="btn-book" onclick="bookTicket('${event._id}', '${event.tickets[0]?._id}')">Book Ticket</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function bookTicket(eventId, ticketTypeId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to book a ticket.');
    toggleAuthModal();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ eventId, ticketTypeId, quantity: 1 })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Booking successful!');
      fetchUserTickets();
    } else {
      alert(data.message || 'Booking failed');
    }
  } catch (err) {
    console.error('Error booking ticket:', err);
  }
}

async function fetchUserTickets() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await res.json();
    renderTickets(bookings);
  } catch (err) {
    console.error('Error fetching user tickets:', err);
  }
}

function renderTickets(bookings) {
  const section = document.getElementById('my-tickets');
  const grid = document.getElementById('ticketsGrid');
  grid.innerHTML = '';

  if (bookings && bookings.length > 0) {
    section.style.display = 'block';
    bookings.forEach(b => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${b.event ? b.event.title : 'Event Ticket'}</h3>
        <p><strong>Quantity:</strong> ${b.quantity}</p>
        <p><strong>Total Paid:</strong> $${b.totalPrice}</p>
        <p><strong>Status:</strong> ${b.status}</p>
      `;
      grid.appendChild(card);
    });
  }
}

function toggleAuthModal() {
  const modal = document.getElementById('authModal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function switchAuthMode(e) {
  e.preventDefault();
  isRegisterMode = !isRegisterMode;
  document.getElementById('modalTitle').textContent = isRegisterMode ? 'Create Account' : 'Account Login';
  document.getElementById('nameGroup').style.display = isRegisterMode ? 'block' : 'none';
  document.getElementById('submitAuthBtn').textContent = isRegisterMode ? 'Register' : 'Sign In';
  document.getElementById('toggleText').textContent = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
  document.getElementById('toggleLink').textContent = isRegisterMode ? 'Login' : 'Register';
}

async function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const name = document.getElementById('userNameInput').value;

  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const payload = isRegisterMode ? { name, email, password } : { email, password };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      alert(isRegisterMode ? 'Registration successful, please log in.' : 'Logged in successfully!');
      toggleAuthModal();
      checkAuthStatus();
    } else {
      alert(data.message || 'Authentication error');
    }
  } catch (err) {
    console.error('Auth error:', err);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  alert('Logged out.');
  checkAuthStatus();
}
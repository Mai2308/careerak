const api = {
  mentors: '/api/mentors',
  bookings: '/api/bookings'
};

const state = {
  selectedMentor: null,
  mentorSlots: []
};

const app = document.getElementById('app');
const alertBox = document.getElementById('alert');

async function init() {
  await renderMentorView();
}

function showAlert(message) {
  alertBox.textContent = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 5000);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to load data');
  }
  return response.json();
}



async function renderMentorView() {
  const mentors = await fetchJson(api.mentors);

  app.innerHTML = `
    <section>
      <h2>Mentor dashboard</h2>
      <p>Select a mentor to review booked sessions and profile details.</p>
      <div id="mentorDashboard"></div>
    </section>
  `;

  const mentorDashboard = document.getElementById('mentorDashboard');
  mentorDashboard.innerHTML = mentors
    .map(
      (mentor) => `
        <div class="mentor-card">
          <h3>${mentor.name}</h3>
          <div class="meta">${mentor.title} · ${mentor.expertiseFields.join(', ')}</div>
          <p>${mentor.bio}</p>
          <div class="mentor-actions">
            <button class="secondary" data-action="profile" data-mentor="${mentor.id}">View profile</button>
            <button class="action" data-action="bookings" data-mentor="${mentor.id}">View bookings</button>
          </div>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('button[data-mentor]').forEach((button) => {
    button.addEventListener('click', async () => {
      const mentorId = button.dataset.mentor;
      const action = button.dataset.action;
      if (action === 'profile') {
        await showMentorProfile(mentorId);
      } else {
        await showMentorBookings(mentorId);
      }
    });
  });
}

async function showMentorProfile(mentorId) {
  const mentor = await fetchJson(`${api.mentors}/${mentorId}`);

  app.innerHTML = `
    <section class="mentor-detail">
      <button class="secondary" id="backToMentorDashboard">← Back to mentor dashboard</button>
      <h2>${mentor.name}</h2>
      <div class="meta">${mentor.title}</div>
      <p>${mentor.bio}</p>
      <p><strong>Experience:</strong> ${mentor.experienceYears} years</p>
      <p><strong>Fields:</strong> ${mentor.expertiseFields.join(', ')}</p>
      <p><strong>Skills:</strong> ${mentor.skills.join(', ')}</p>
      <div class="booking-panel">
        <h3>Available slots</h3>
        ${mentor.availableSlots && mentor.availableSlots.length
          ? mentor.availableSlots.map((slot) => `<p>${slot}</p>`).join('')
          : '<p>No available slots.</p>'}
      </div>
    </section>
  `;

  document.getElementById('backToMentorDashboard').addEventListener('click', () => renderMentorView());
}

async function showMentorBookings(mentorId) {
  const mentor = await fetchJson(`${api.mentors}/${mentorId}`);
  const bookings = await fetchJson(`${api.bookings}?mentorId=${mentorId}`);

  app.innerHTML = `
    <section class="mentor-detail">
      <button class="secondary" id="backToMentorList">← Back to mentor dashboard</button>
      <h2>${mentor.name}</h2>
      <div class="meta">${mentor.title}</div>
      <p>${mentor.bio}</p>
      <p><strong>Next available slots:</strong> ${mentor.availableSlots.join(', ')}</p>
    </section>
    <section>
      <h2>Booked sessions</h2>
      <div id="mentorBookings"></div>
    </section>
  `;

  document.getElementById('backToMentorList').addEventListener('click', () => renderMentorView());
  const mentorBookings = document.getElementById('mentorBookings');
  mentorBookings.innerHTML = bookings.length
    ? bookings
        .map(
          (booking) => `
            <div class="booking-panel">
              <p><strong>Slot:</strong> ${booking.slot}</p>
              <p><strong>Payment:</strong> ${booking.paymentMethod === 'card' ? 'Card ending ' + booking.cardLast4 : booking.walletProvider}</p>
            </div>
          `
        )
        .join('')
    : '<p>No booked sessions yet for this mentor.</p>';
}

init().catch((error) => showAlert(error.message));

const test = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let request;
let mentorUserId;
let studentUserId;
let createdAvailabilityId;
let createdBookingId;

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.MONGO_URI = mongoServer.getUri('careerak');

  const app = require('../server');
  request = supertest(app);
});

test.after(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('registers a student and returns a JWT', async () => {
  const res = await request.post('/api/auth/register').send({
    name: 'Alice Student',
    email: 'alice@example.com',
    password: 'secret123',
    role: 'student'
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, 'student');
  studentUserId = res.body.user.id;
});

test('registers a mentor and returns a JWT', async () => {
  const res = await request.post('/api/auth/register').send({
    name: 'Bob Mentor',
    email: 'bob@example.com',
    password: 'secret123',
    role: 'mentor'
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, 'mentor');
  mentorUserId = res.body.user.id;
});

test('rejects duplicate registrations for the same email', async () => {
  const res = await request.post('/api/auth/register').send({
    name: 'Another Alice',
    email: 'alice@example.com',
    password: 'secret123',
    role: 'student'
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'Email already in use');
});

test('logs in an existing user', async () => {
  const res = await request.post('/api/auth/login').send({
    email: 'alice@example.com',
    password: 'secret123'
  });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, 'alice@example.com');
});

test('lists registered mentors so students can pick a real mentor', async () => {
  await request.post('/api/auth/register').send({
    name: 'Real Mentor',
    email: 'realmentor@example.com',
    password: 'secret123',
    role: 'mentor'
  });

  const res = await request.get('/api/users/mentors');

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some((mentor) => mentor.email === 'realmentor@example.com'));
});

test('creates a valid availability slot for a mentor', async () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const res = await request.post('/api/availability').send({
    mentorId: mentorUserId,
    date: tomorrow,
    startTime: '09:00',
    endTime: '10:00'
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.mentorId, mentorUserId);
  createdAvailabilityId = res.body._id;
});

test('rejects invalid availability ranges', async () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const res = await request.post('/api/availability').send({
    mentorId: mentorUserId,
    date: tomorrow,
    startTime: '11:00',
    endTime: '10:00'
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, 'End time must be after start time');
});

test('reads the mentor availability list', async () => {
  const res = await request.get(`/api/availability/mentor/${mentorUserId}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length >= 1);
});

test('requires a successful mock payment before creating a booking', async () => {
  const paymentRes = await request.post('/api/bookings/mock-payment').send({
    amount: 2500,
    currency: 'INR'
  });

  assert.equal(paymentRes.status, 200);
  assert.equal(paymentRes.body.paymentStatus, 'paid');
  assert.ok(paymentRes.body.paymentReference);

  const res = await request.post('/api/bookings').send({
    studentId: studentUserId,
    availabilityId: createdAvailabilityId,
    paymentStatus: 'paid',
    paymentReference: paymentRes.body.paymentReference,
    amount: 2500,
    currency: 'INR'
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.studentId, studentUserId);
  assert.equal(res.body.mentorId, mentorUserId);
  assert.equal(res.body.paymentStatus, 'paid');
  createdBookingId = res.body._id;
});

test('prevents booking an already-booked slot', async () => {
  const res = await request.post('/api/bookings').send({
    studentId: studentUserId,
    availabilityId: createdAvailabilityId,
    paymentStatus: 'paid',
    paymentReference: 'MOCK_RETRY_TEST',
    amount: 2500,
    currency: 'INR'
  });

  assert.equal(res.status, 409);
  assert.equal(res.body.message, 'This slot is already booked');
});

test('lists bookings for a student', async () => {
  const res = await request.get(`/api/bookings/student/${studentUserId}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.some((booking) => booking._id === createdBookingId));
});

test('cancels a booking and reopens the availability slot', async () => {
  const res = await request.patch(`/api/bookings/${createdBookingId}/cancel`);

  assert.equal(res.status, 200);
  assert.equal(res.body.booking.status, 'cancelled');

  const availabilityRes = await request.get(`/api/availability/mentor/${mentorUserId}`);
  assert.ok(availabilityRes.body.some((slot) => slot._id === createdAvailabilityId && slot.status === 'available'));
});

<<<<<<< HEAD
test('allows sending and receiving messages between student and mentor', async () => {
  // Login student to get token
  const studentLogin = await request.post('/api/auth/login').send({
    email: 'alice@example.com',
    password: 'secret123'
  });
  const studentToken = studentLogin.body.token;

  // Login mentor to get token
  const mentorLogin = await request.post('/api/auth/login').send({
    email: 'bob@example.com',
    password: 'secret123'
  });
  const mentorToken = mentorLogin.body.token;

  // Student sends message to mentor
  const sendRes = await request
    .post('/api/messages')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      receiverId: mentorUserId,
      content: 'Hello Bob! I would like to ask about career advice.'
    });

  assert.equal(sendRes.status, 201);
  assert.equal(sendRes.body.content, 'Hello Bob! I would like to ask about career advice.');

  // Mentor gets conversations list
  const convRes = await request
    .get('/api/messages/conversations')
    .set('Authorization', `Bearer ${mentorToken}`);

  assert.equal(convRes.status, 200);
  assert.ok(Array.isArray(convRes.body));
  assert.ok(convRes.body.some((c) => c.user._id === studentUserId));

  // Mentor gets message thread with student
  const threadRes = await request
    .get(`/api/messages/${studentUserId}`)
    .set('Authorization', `Bearer ${mentorToken}`);

  assert.equal(threadRes.status, 200);
  assert.ok(Array.isArray(threadRes.body.messages));
  assert.equal(threadRes.body.messages.length, 1);
  assert.equal(threadRes.body.messages[0].content, 'Hello Bob! I would like to ask about career advice.');
});

test('returns correct unread message count notification for user', async () => {
  const studentLogin = await request.post('/api/auth/login').send({
    email: 'alice@example.com',
    password: 'secret123'
  });
  const studentToken = studentLogin.body.token;

  const mentorLogin = await request.post('/api/auth/login').send({
    email: 'bob@example.com',
    password: 'secret123'
  });
  const mentorToken = mentorLogin.body.token;

  // Student sends a new message to mentor
  await request
    .post('/api/messages')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({
      receiverId: mentorUserId,
      content: 'Hi Bob, another question for you!'
    });

  // Check unread count for mentor
  const unreadRes = await request
    .get('/api/messages/unread-count')
    .set('Authorization', `Bearer ${mentorToken}`);

  assert.equal(unreadRes.status, 200);
  assert.ok(unreadRes.body.unreadCount >= 1);
=======
test('accepts a mentor-defined session price and stores it in EGP', async () => {
  const loginRes = await request.post('/api/auth/login').send({
    email: 'bob@example.com',
    password: 'secret123'
  });

  const res = await request.post('/api/mentors')
    .set('Authorization', `Bearer ${loginRes.body.token}`)
    .send({
      name: 'Bob Mentor',
      title: 'Product mentor',
      bio: 'Helps teams launch faster.',
      skills: ['Product Strategy'],
      availableSlots: ['2026-08-19T09:00:00.000Z'],
      sessionPrice: 1500
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.sessionPrice, 1500);
  assert.equal(res.body.currency, 'EGP');
});

test('persists mentor bio and skills when saving the profile', async () => {
  const loginRes = await request.post('/api/auth/login').send({
    email: 'bob@example.com',
    password: 'secret123'
  });

  const res = await request.post('/api/mentors')
    .set('Authorization', `Bearer ${loginRes.body.token}`)
    .send({
      name: 'Bob Mentor',
      title: 'Senior product mentor',
      bio: 'I coach founders and PMs.',
      skills: ['Product Strategy', 'Interview Prep'],
      availableSlots: ['2026-08-21T09:00:00.000Z'],
      sessionPrice: 1800
    });

  const profileRes = await request.get('/api/mentors/me')
    .set('Authorization', `Bearer ${loginRes.body.token}`);

  assert.equal(res.status, 200);
  assert.equal(profileRes.status, 200);
  assert.equal(profileRes.body.bio, 'I coach founders and PMs.');
  assert.deepEqual(profileRes.body.skills, ['Product Strategy', 'Interview Prep']);
});

test('defaults mock payment currency to EGP', async () => {
  const res = await request.post('/api/bookings/mock-payment').send({
    amount: 2200
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.currency, 'EGP');
>>>>>>> origin/main
});

const { ObjectId } = require('mongodb');

function createMentorDocument(mentor) {
  return {
    ...mentor,
    createdAt: new Date()
  };
}

function createBookingDocument(booking) {
  return {
    mentorId: booking.mentorId,
    mentorName: booking.mentorName,
    slot: booking.slot,
    paymentMethod: booking.paymentMethod,
    cardLast4: booking.cardLast4 || null,
    walletProvider: booking.walletProvider || null,
    status: booking.status,
    createdAt: new Date()
  };
}

module.exports = {
  createMentorDocument,
  createBookingDocument
};

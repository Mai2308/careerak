# Careerak – Student & Mentor Web Application

## 📌 Overview

**Careerak** is a web application that connects students with experienced mentors based on their academic and career interests.

The platform provides two main interfaces:

* **Student Interface** – Students can explore career fields, discover suitable mentors, view mentor profiles and ratings, choose an available time slot, book a mentoring session, complete payment, and communicate with their mentors through in-app messaging.
* **Mentor Interface** – Mentors can manage their profiles, experience, availability, mentoring sessions, and communicate directly with students.

The main goal of the application is to make finding the right career mentor simple, personalized, accessible, and interactive.

---

## 🎯 Objectives

The application aims to:

* Connect students with mentors in their preferred career fields.
* Help students make informed decisions using mentor experience and ratings.
* Allow students to easily find and book available mentoring sessions.
* Provide flexible payment options.
* Enable direct communication between students and mentors through in-app messaging.
* Give mentors a platform to offer their expertise and manage their sessions.
* Allow students and mentors to discuss session-related topics before and after mentoring sessions.

---

## 👥 User Interfaces

### 1. Student Interface

Students can:

1. Create an account.
2. Select their field of interest, such as:

   * Engineering
   * Computer Science
   * Data Analysis
   * Marketing
   * Finance
   * Business
   * Design
   * Healthcare
   * And other fields
3. Receive recommended mentors based on their selected interests.
4. View mentor information, including:

   * Name
   * Professional experience
   * Skills
   * Rating
   * Reviews
   * Session price
5. Select a preferred mentor.
6. View the mentor's available time slots.
7. Choose a suitable session time.
8. Confirm the booking.
9. Pay using:

   * Credit/Debit Card
   * Mobile Wallet
10. Receive a booking confirmation and session details.
11. **Send and receive messages with their mentor.**
12. **View previous conversations and messages.**
13. **Discuss mentoring sessions, questions, and career-related topics with their mentor.**

---

### 2. Mentor Interface

Mentors can:

* Create and manage their professional profile.
* Add their field of expertise.
* Add their professional experience and skills.
* Set their session price.
* Manage their available time slots.
* View upcoming bookings.
* Manage student mentoring sessions.
* Receive ratings and reviews from students.
* **Send and receive messages from students.**
* **View conversations with students.**
* **Communicate with students about their booked sessions and mentoring topics.**

---

## 🔄 Application Workflow

```text
Student
   │
   ▼
Create Account
   │
   ▼
Choose Field of Interest
   │
   ▼
Recommended Mentors
   │
   ▼
View Mentor Profile
   │
   ├── Experience
   ├── Skills
   ├── Rating & Reviews
   └── Session Price
   │
   ▼
Choose Mentor
   │
   ▼
Select Preferred Time Slot
   │
   ▼
Confirm Booking
   │
   ▼
Choose Payment Method
   │
   ├── Card
   └── Mobile Wallet
   │
   ▼
Payment Confirmation
   │
   ▼
Session Booked
   │
   ▼
Start Conversation
   │
   ▼
Student ↔ Mentor
   │
   ├── Send Messages
   ├── Receive Messages
   └── Discuss Session / Career Topics
```

---

## ⭐ Main Features

### Personalized Mentor Recommendations

Students select their area of interest and receive a list of relevant mentors.

### Mentor Profiles

Each mentor has a profile containing their professional background, skills, experience, ratings, reviews, availability, and session price.

### Search & Filtering

Students can explore mentors based on their preferred career field and compare available options.

### Ratings & Reviews

Students can use mentor ratings and reviews to help them select a suitable mentor.

### Appointment Booking

Students can view available time slots and book a session that fits their schedule.

### Online Payment

The application supports multiple payment methods, including cards and mobile wallets.

### Booking Confirmation

After a successful booking and payment, the student receives confirmation containing the session details.

### Mentor Availability

Mentors can define and manage the time slots in which they are available for mentoring sessions.

### 💬 In-App Messaging

Careerak provides a messaging system that allows students and mentors to communicate directly within the platform.

The messaging feature allows:

* Students to start a conversation with their mentor.
* Mentors to respond directly to students.
* Students and mentors to send and receive messages in real time.
* Users to view their previous conversations.
* Students to ask questions before or after a mentoring session.
* Mentors to provide additional guidance and information.
* Users to discuss session details, preparation, and career-related topics.
* Conversations to be associated with the relevant student and mentor.

---

## 💬 Messaging Workflow

```text
Student
   │
   ▼
Book Mentor Session
   │
   ▼
Open Messages
   │
   ▼
Select Mentor
   │
   ▼
Conversation
   │
   ├───────────────┐
   │               │
   ▼               ▼
Student         Mentor
   │               │
   └── Send/Receive ──┘
          Messages
             │
             ▼
       Conversation
          History
```

---

## 🖥️ Product Prototype

The prototype includes the following main screens:

### Student Screens

* Welcome / Landing Page
* Create Account
* Select Field of Interest
* Home / Mentor Recommendations
* Find Your Mentor
* Mentor Profile
* Available Time Slots
* Booking Confirmation
* Payment Method
* Successful Booking
* **Messages**
* **Conversation / Chat Screen**

### Mentor Screens

The mentor interface allows mentors to manage their professional information, availability, mentoring sessions, and communication with students.

Additional screens include:

* **Messages**
* **Conversation / Chat Screen**
* **Student Conversation List**

---

## 🔐 Core Functional Requirements

### Student

* Register and log in.
* Select an area of interest.
* View recommended mentors.
* View mentor profiles.
* View ratings and reviews.
* View available slots.
* Book a session.
* Select a payment method.
* Complete payment.
* View booking confirmation.
* **Send messages to mentors.**
* **Receive messages from mentors.**
* **View conversation history.**

### Mentor

* Register and log in.
* Create and edit a profile.
* Specify expertise and experience.
* Set session prices.
* Add or remove available time slots.
* View bookings.
* Manage mentoring sessions.
* **Send messages to students.**
* **Receive messages from students.**
* **View conversation history.**

### Messaging System

* Authenticate users before accessing conversations.
* Allow students and mentors to communicate privately.
* Associate each conversation with a student and mentor.
* Store messages securely.
* Display messages in chronological order.
* Show sender and message timestamp.
* Allow users to view previous messages.
* Support real-time message delivery.
* Prevent unauthorized users from accessing other users' conversations.

### System

* Match students with relevant mentors.
* Display mentor ratings and experience.
* Prevent unavailable slots from being booked.
* Store booking information.
* Process payments.
* Confirm successful bookings.
* **Create and manage student-mentor conversations.**
* **Deliver messages between authorized students and mentors.**
* **Store conversation history.**

---

## 🗄️ Suggested Main Data Entities

The backend/database can be organized around entities such as:

### Student

* studentId
* name
* email
* password
* fieldOfInterest

### Mentor

* mentorId
* name
* email
* password
* field
* experience
* skills
* rating
* sessionPrice

### Availability

* availabilityId
* mentorId
* date
* startTime
* endTime
* status

### Booking

* bookingId
* studentId
* mentorId
* availabilityId
* bookingDate
* status

### Payment

* paymentId
* bookingId
* paymentMethod
* amount
* paymentStatus

### Review

* reviewId
* studentId
* mentorId
* rating
* comment

### Conversation

* conversationId
* studentId
* mentorId
* createdAt
* updatedAt

### Message

* messageId
* conversationId
* senderId
* senderRole
* message
* timestamp
* readStatus

---

## 💬 Messaging System Architecture

The messaging system connects a student and mentor through a private conversation.

```text
┌──────────────┐
│   Student    │
└──────┬───────┘
       │
       │ Send / Receive
       ▼
┌──────────────────┐
│   Conversation   │
│                  │
│ Student ID       │
│ Mentor ID        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Messages     │
│                  │
│ Sender ID        │
│ Message          │
│ Timestamp        │
│ Read Status      │
└────────┬─────────┘
         │
         │ Send / Receive
         ▼
┌──────────────┐
│    Mentor    │
└──────────────┘
```

For real-time communication, the application can use technologies such as **WebSockets or Socket.IO** to deliver messages without requiring the user to refresh the page.

---

## 💳 Payment Flow

```text
Select Mentor
      ↓
Select Time Slot
      ↓
Review Booking
      ↓
Select Payment Method
      ↓
 ┌───────────────┐
 │               │
Card          Wallet
 │               │
 └───────┬───────┘
         ↓
   Process Payment
         ↓
 Payment Successful
         ↓
   Booking Confirmed
         ↓
    Open Messages
         ↓
 Student ↔ Mentor
```

> **Note:** For a production system, payment processing should be implemented using a secure, trusted payment gateway. Card information should not be stored directly by the application unless appropriate security and compliance requirements are met.

---

## 🚀 Future Enhancements

Possible future improvements include:

* In-app video mentoring sessions.
* **Advanced real-time messaging features.**
* **Message notifications.**
* **Unread message indicators.**
* **File and document sharing between students and mentors.**
* AI-powered mentor recommendations.
* Calendar integration.
* Notifications and reminders.
* Advanced mentor search and filtering.
* Mentor verification.
* Session history.
* Student progress tracking.
* Discount codes and promotional offers.
* Admin dashboard for managing users and platform activity.

---

## 📱 Project Vision

Careerak aims to bridge the gap between students and experienced professionals by creating a simple platform where students can find the right mentor for their career journey, book mentoring sessions, and communicate directly with their mentors.

**Find the right mentor. Book the right time. Start the right conversation. Build the right future.**

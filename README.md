# Careerak – Student & Mentor Web Application

## 📌 Overview

**Careerak** is a web application that connects students with experienced mentors based on their academic and career interests.

The platform provides two main interfaces:

- **Student Interface** – Students can explore career fields, discover suitable mentors, view mentor profiles and ratings, choose an available time slot, book a mentoring session, and complete payment.
- **Mentor Interface** – Mentors can manage their profiles, experience, availability, and mentoring sessions with students.

The main goal of the application is to make finding the right career mentor simple, personalized, and accessible.

---

## 🎯 Objectives

The application aims to:

- Connect students with mentors in their preferred career fields.
- Help students make informed decisions using mentor experience and ratings.
- Allow students to easily find and book available mentoring sessions.
- Provide flexible payment options.
- Give mentors a platform to offer their expertise and manage their sessions.

---

## 👥 User Interfaces

### 1. Student Interface

Students can:

1. Create an account.
2. Select their field of interest, such as:
   - Engineering
   - Computer Science
   - Data Analysis
   - Marketing
   - Finance
   - Business
   - Design
   - Healthcare
   - And other fields
3. Receive recommended mentors based on their selected interests.
4. View mentor information, including:
   - Name
   - Professional experience
   - Skills
   - Rating
   - Reviews
   - Session price
5. Select a preferred mentor.
6. View the mentor's available time slots.
7. Choose a suitable session time.
8. Confirm the booking.
9. Pay using:
   - Credit/Debit Card
   - Mobile Wallet
10. Receive a booking confirmation and session details.

---

### 2. Mentor Interface

Mentors can:

- Create and manage their professional profile.
- Add their field of expertise.
- Add their professional experience and skills.
- Set their session price.
- Manage their available time slots.
- View upcoming bookings.
- Manage student mentoring sessions.
- Receive ratings and reviews from students.

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

---

## 🖥️ Product Prototype

The prototype includes the following main screens:

### Student Screens

- Welcome / Landing Page
- Create Account
- Select Field of Interest
- Home / Mentor Recommendations
- Find Your Mentor
- Mentor Profile
- Available Time Slots
- Booking Confirmation
- Payment Method
- Successful Booking

### Mentor Screens

The mentor interface allows mentors to manage their professional information, availability, and mentoring sessions.

---

## 🏗️ System Concept

The application follows a two-sided platform model:

```text
                    ┌───────────────────┐
                    │     Careerak      │
                    │   Web Application │
                    └─────────┬─────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
          ┌──────▼──────┐           ┌──────▼──────┐
          │   Students  │           │   Mentors   │
          └──────┬──────┘           └──────┬──────┘
                 │                         │
                 │ Find & Book             │
                 │ Mentors                 │ Manage
                 │                         │ Availability
                 └────────────┬────────────┘
                              │
                       ┌──────▼──────┐
                       │  Mentoring  │
                       │   Session   │
                       └─────────────┘
```

---

## 🔐 Core Functional Requirements

### Student

- Register and log in.
- Select an area of interest.
- View recommended mentors.
- View mentor profiles.
- View ratings and reviews.
- View available slots.
- Book a session.
- Select a payment method.
- Complete payment.
- View booking confirmation.

### Mentor

- Register and log in.
- Create and edit a profile.
- Specify expertise and experience.
- Set session prices.
- Add or remove available time slots.
- View bookings.
- Manage mentoring sessions.

### System

- Match students with relevant mentors.
- Display mentor ratings and experience.
- Prevent unavailable slots from being booked.
- Store booking information.
- Process payments.
- Confirm successful bookings.

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
```

> **Note:** For a production system, payment processing should be implemented using a secure, trusted payment gateway. Card information should not be stored directly by the application unless appropriate security and compliance requirements are met.

---

## 🗄️ Suggested Main Data Entities

The backend/database can be organized around entities such as:

- **Student**
  - studentId
  - name
  - email
  - password
  - fieldOfInterest

- **Mentor**
  - mentorId
  - name
  - email
  - password
  - field
  - experience
  - skills
  - rating
  - sessionPrice

- **Availability**
  - availabilityId
  - mentorId
  - date
  - startTime
  - endTime
  - status

- **Booking**
  - bookingId
  - studentId
  - mentorId
  - availabilityId
  - bookingDate
  - status

- **Payment**
  - paymentId
  - bookingId
  - paymentMethod
  - amount
  - paymentStatus

- **Review**
  - reviewId
  - studentId
  - mentorId
  - rating
  - comment

---

## 🚀 Future Enhancements

Possible future improvements include:

- In-app video mentoring sessions.
- Real-time chat between students and mentors.
- AI-powered mentor recommendations.
- Calendar integration.
- Notifications and reminders.
- Advanced mentor search and filtering.
- Mentor verification.
- Session history.
- Student progress tracking.
- Discount codes and promotional offers.
- Admin dashboard for managing users and platform activity.

---

## 📱 Project Vision

Careerak aims to bridge the gap between students and experienced professionals by creating a simple platform where students can find the right mentor for their career journey.

**Find the right mentor. Book the right time. Build the right future.**

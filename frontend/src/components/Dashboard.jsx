import React, { useEffect, useState } from "react";
import MentorAvailability from "./MentorAvailability";
import MentorBookings from "./MentorBookings";
import AvailableSlots from "./AvailableSlots";
import StudentBookings from "./StudentBookings";
import { getMyMentor, getMentors, getMentorReviews } from "../api";
import MentorProfile from "./MentorProfile";
import MentorModal from "./MentorModal";

export default function Dashboard({
  user,
  onViewProfile,
  onExplore,
  onOpenMessages,
}) {
  const [mentorProfile, setMentorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [modalMentor, setModalMentor] = useState(null);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [activeField, setActiveField] = useState("all");

  useEffect(() => {
    if (!user) return;

    if (user.role === "mentor") {
      setLoading(true);
      getMyMentor()
        .then((m) => setMentorProfile(m))
        .catch(() => setMentorProfile(null))
        .finally(() => setLoading(false));

      setReviewsLoading(true);
      getMentorReviews(user.id)
        .then((data) => setReviews(Array.isArray(data) ? data : []))
        .catch(() => setReviews([]))
        .finally(() => setReviewsLoading(false));
      return;
    }

    async function loadMentors() {
      try {
        setLoadingMentors(true);
        const data = await getMentors();
        const list = Array.isArray(data) ? data : [];
        setMentors(list);
        if (list.length > 0) {
          setSelectedMentorId(list[0]._id || list[0].id);
        }
      } catch (err) {
        console.error("Failed to load mentors", err);
        setMentors([]);
      } finally {
        setLoadingMentors(false);
      }
    }

    loadMentors();
  }, [user]);

  if (!user) return <div className="card">Please log in.</div>;

  const fieldOptions = Array.from(
    new Set(
      mentors
        .map((m) => m.category || (m.interests && m.interests[0]))
        .filter(Boolean),
    ),
  ).sort();

  const filteredMentors = mentors
    .filter((m) => {
      if (activeField === "all") return true;
      const cat = m.category || (m.interests && m.interests[0]);
      return cat === activeField || (m.interests || []).includes(activeField);
    })
    .filter((m) => m.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "priceAsc") return (a.sessionPrice || 0) - (b.sessionPrice || 0);
      if (sortBy === "priceDesc") return (b.sessionPrice || 0) - (a.sessionPrice || 0);
      return (b.rating || 0) - (a.rating || 0);
    });

  if (user.role === "mentor") {
    const averageRating =
      mentorProfile?.rating ||
      (reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0);

    return (
      <div className="mentor-dashboard">
        <header className="mentor-dashboard-header">
          <div className="brand-block"></div>
        </header>

        {loading ? (
          <div className="surface-panel">Loading your profile...</div>
        ) : !mentorProfile ? (
          <div>
            <div className="surface-panel compact-panel">
              <h2 className="panel-title light">Create your mentor profile</h2>
              <p className="muted">
                Set up your title, bio, and availability to start accepting
                students.
              </p>
            </div>
            <MentorProfile
              onSaved={(m) => {
                setMentorProfile(m);
                setEditing(false);
              }}
            />
          </div>
        ) : (
          <div>
            <div className="surface-panel profile-summary-panel">
              <div className="profile-topline">
                <div className="profile-avatar">
                  {mentorProfile.name
                    ?.split(" ")
                    .map((piece) => piece[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "M"}
                </div>
                <div className="profile-meta">
                  <div className="profile-name-row">
                    <h2>{mentorProfile.name}</h2>
                    <button
                      className="secondary-button compact"
                      onClick={() => setEditing(!editing)}
                    >
                      {editing ? "Close editor" : "Edit profile"}
                    </button>
                  </div>
                  <p className="profile-title">
                    {mentorProfile.title || "Mentor"}
                  </p>
                </div>
              </div>

              <div className="profile-body">
                <p>
                  <strong>Category & Field</strong>
                  <span>{mentorProfile.category || "Technology"}{mentorProfile.field ? ` · ${mentorProfile.field}` : ''}</span>
                </p>
                <p>
                  <strong>Bio</strong>
                  <span>{mentorProfile.bio || "No bio yet."}</span>
                </p>
                <p>
                  <strong>Skills</strong>
                  <span>
                    {mentorProfile.skills?.join(", ") || "No skills added yet."}
                  </span>
                </p>
                <p>
                  <strong>Session price</strong>
                  <span>
                    {mentorProfile.sessionPrice
                      ? `${mentorProfile.currency || "EGP"} ${Number(mentorProfile.sessionPrice).toLocaleString()}`
                      : "Not set yet."}
                  </span>
                </p>
              </div>
            </div>

            {editing && (
              <div className="surface-panel form-panel">
                <MentorProfile
                  initial={mentorProfile}
                  onSaved={(m) => {
                    setMentorProfile(m);
                    setEditing(false);
                  }}
                />
              </div>
            )}

            <div className="stats-grid">
              <div className="surface-panel stat-panel">
                <div className="stat-label">UPCOMING SESSIONS</div>
                <div className="stat-value">
                  {mentorProfile.sessionsCount || 3}
                </div>
              </div>

              <div className="surface-panel stat-panel">
                <div className="stat-label">AVERAGE RATING</div>
                <div className="stat-value large-rating">
                  {averageRating ? averageRating.toFixed(1) : "New"}
                </div>
                <div className="rating-summary-stars">
                  {"★".repeat(Math.round(averageRating)).padEnd(5, "☆")}
                  <span className="muted rating-summary-count">
                    {" "}
                    ({reviews.length} review{reviews.length === 1 ? "" : "s"})
                  </span>
                </div>
              </div>
            </div>

            <MentorBookings user={user} />
            <MentorAvailability user={user} />

            <div className="surface-panel review-panel">
              <div className="section-header-row">
                <h3 className="panel-title light">RECENT REVIEWS</h3>
              </div>
              {reviewsLoading ? (
                <div className="booking-empty">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="booking-empty">
                  No reviews yet. They will appear here once students rate your
                  sessions.
                </div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div className="review-card" key={review._id}>
                      <div className="review-heading">
                        <div className="review-heading-left">
                          <div className="review-avatar">
                            {(review.reviewerName || "S")
                              .split(" ")
                              .map((piece) => piece[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>
                          <h4>{review.reviewerName || "Student"}</h4>
                        </div>
                        <span className="star-rating">
                          ★ {Number(review.rating || 0).toFixed(1)}
                        </span>
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="surface-panel welcome-panel">
        <div className="welcome-row">
          <div>
            <span className="eyebrow">STUDENT DASHBOARD</span>
            <h2 className="welcome-title">
              Welcome back, {user.name?.split(" ")[0] || user.name}
            </h2>
            <p className="muted">
              {user.email} · {user.role}
            </p>
          </div>
          <div className="welcome-actions">
            {onExplore && (
              <button className="pill-button" onClick={onExplore}>
                Explore categories
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="surface-panel mentor-search-panel">
        <div className="section-header-row">
          <h3 className="panel-title light">FIND YOUR MENTOR</h3>
          <p className="muted">
            {mentors.length} mentor{mentors.length === 1 ? "" : "s"} available.
            Filter, compare and book in minutes.
          </p>
        </div>

        <div className="search-controls">
          <input
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="rating">Highest rated</option>
            <option value="name">Name (A-Z)</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>

        <div className="field-pills">
          <button
            type="button"
            className={`field-pill${activeField === "all" ? " active" : ""}`}
            onClick={() => setActiveField("all")}
          >
            All fields
          </button>
          {fieldOptions.map((field) => (
            <button
              key={field}
              type="button"
              className={`field-pill${activeField === field ? " active" : ""}`}
              onClick={() => setActiveField(field)}
            >
              {field}
            </button>
          ))}
        </div>

        {loadingMentors ? (
          <p className="muted">Loading mentors...</p>
        ) : mentors.length === 0 ? (
          <p className="muted">No mentors are available yet.</p>
        ) : filteredMentors.length === 0 ? (
          <p className="muted">No mentors match your search.</p>
        ) : (
          <div className="mentor-grid">
            {filteredMentors.map((mentor) => {
              const id = mentor._id || mentor.id;
              return (
                <div
                  key={id}
                  className={`mentor-card${selectedMentorId === id ? " active" : ""}`}
                  onClick={() => {
                    setSelectedMentorId(id);
                    setModalMentor(mentor);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div className="mentor-card-header">
                    <strong>{mentor.name}</strong>
                    <button
                      type="button"
                      className="message-icon-btn"
                      title={`Message ${mentor.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenMessages) onOpenMessages(mentor);
                      }}
                    >
                      💬
                    </button>
                  </div>
                  <span className="mentor-rating">
                    ⭐ {mentor.rating ? mentor.rating.toFixed(1) : "New"}
                  </span>
                  <span className="muted">
                    {mentor.category || "Technology"}{mentor.field ? ` · ${mentor.field}` : (mentor.interests?.length > 0 ? ` · ${mentor.interests[0]}` : '')}
                  </span>
                  {mentor.sessionPrice > 0 && (
                    <span className="slot-price" style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '2px' }}>
                      {mentor.currency || 'EGP'} {Number(mentor.sessionPrice).toLocaleString()} / session
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AvailableSlots user={user} mentorId={selectedMentorId} />
      <StudentBookings user={user} />

      {/* Popup Modal */}
      {modalMentor && (
        <MentorModal
          mentor={modalMentor}
          onClose={() => setModalMentor(null)}
          onOpenMessages={onOpenMessages}
        />
      )}
    </div>
  );
}
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

    const initials = (mentorProfile?.name || user?.name || "Mentor")
      .split(" ")
      .map((piece) => piece[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const skillsList = Array.isArray(mentorProfile?.skills)
      ? mentorProfile.skills
      : typeof mentorProfile?.skills === "string" && mentorProfile.skills.trim()
      ? mentorProfile.skills.split(",").map((s) => s.trim())
      : [];

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
            {/* Modern Hero Mentor Profile Card */}
            <div
              className="surface-panel mentor-hero-card"
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                border: "1px solid #eef2f6",
                marginBottom: "24px",
              }}
            >
              {/* Header Row */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "20px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      color: "#ffffff",
                      fontSize: "24px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 8px 16px rgba(37, 99, 235, 0.2)",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2
                        style={{
                          fontSize: "26px",
                          fontWeight: "800",
                          color: "#0f172a",
                          margin: 0,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {mentorProfile.name}
                      </h2>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "4px 10px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Mentor
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        margin: "6px 0 0 0",
                        fontWeight: "500",
                      }}
                    >
                      {mentorProfile.title || "Mentor"} • {mentorProfile.category || "Technology"}
                      {mentorProfile.field ? ` · ${mentorProfile.field}` : ""}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditing(!editing)}
                  style={{
                    background: "#f8fafc",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {editing ? "Close Editor" : "✏️ Edit Profile"}
                </button>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "24px 0" }} />

              {/* Grid Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "24px",
                  alignItems: "start",
                }}
              >
                {/* Bio */}
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    BIO
                  </span>
                  <p
                    style={{
                      color: mentorProfile.bio ? "#334155" : "#94a3b8",
                      fontSize: "14px",
                      marginTop: "6px",
                      lineHeight: "1.6",
                      fontStyle: mentorProfile.bio ? "normal" : "italic",
                    }}
                  >
                    {mentorProfile.bio || "No bio added yet."}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    SKILLS & EXPERTISE
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                    {skillsList.length > 0 ? (
                      skillsList.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            background: "#f1f5f9",
                            color: "#334155",
                            fontSize: "13px",
                            fontWeight: "600",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "14px", fontStyle: "italic" }}>
                        No skills added yet.
                      </span>
                    )}
                  </div>
                </div>

                {/* Session Price */}
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    SESSION PRICE
                  </span>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "#0f172a",
                      marginTop: "6px",
                    }}
                  >
                    {mentorProfile.sessionPrice
                      ? `${mentorProfile.currency || "EGP"} ${Number(
                          mentorProfile.sessionPrice,
                        ).toLocaleString()}`
                      : "Not set yet."}
                  </div>
                </div>
              </div>
            </div>

            {editing && (
              <div className="surface-panel form-panel" style={{ marginBottom: "24px" }}>
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
                    {mentor.category || "Technology"}
                    {mentor.field
                      ? ` · ${mentor.field}`
                      : mentor.interests?.length > 0
                      ? ` · ${mentor.interests[0]}`
                      : ""}
                  </span>
                  {mentor.sessionPrice > 0 && (
                    <span
                      className="slot-price"
                      style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: "2px" }}
                    >
                      {mentor.currency || "EGP"}{" "}
                      {Number(mentor.sessionPrice).toLocaleString()} / session
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
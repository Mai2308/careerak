import React, { useState, useEffect, useRef } from "react";
import { getConversations, getMessagesWithUser, sendMessage } from "../api";

export default function MessagesModal({
  isOpen,
  onClose,
  user,
  initialRecipient,
}) {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("chat"); // 'chat' or 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const activeUserId = activeUser?._id || activeUser?.id || activeUser?.userId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : [];
      setConversations(list);
      return list;
    } catch (err) {
      console.error("Failed to load conversations", err);
      return [];
    }
  };

  const loadThread = async (targetId) => {
    if (!targetId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMessagesWithUser(targetId);
      if (data.user) {
        setActiveUser((prev) => ({ ...prev, ...data.user }));
      }
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function init() {
      const convs = await loadConversations();
      if (!isMounted) return;

      if (initialRecipient) {
        const targetId =
          initialRecipient._id ||
          initialRecipient.id ||
          initialRecipient.userId;
        setActiveUser(initialRecipient);
        setViewMode("chat");
        await loadThread(targetId);
      } else if (convs.length > 0) {
        const firstUser = convs[0].user;
        setActiveUser(firstUser);
        setViewMode("chat");
        await loadThread(firstUser._id || firstUser.id);
      } else {
        setViewMode("list");
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialRecipient]);

  useEffect(() => {
    if (!isOpen || !activeUserId) return;

    const interval = setInterval(() => {
      getMessagesWithUser(activeUserId)
        .then((data) => {
          if (data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(() => {});
      loadConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, activeUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSelectConversation = (convUser) => {
    setActiveUser(convUser);
    setViewMode("chat");
    const targetId = convUser._id || convUser.id || convUser.userId;
    loadThread(targetId);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUserId || sending) return;

    const content = inputText.trim();
    setText("");
    setSending(true);
    setError(null);

    try {
      const newMsg = await sendMessage({ receiverId: activeUserId, content });
      setMessages((prev) => [...prev, newMsg]);
      loadConversations();
    } catch (err) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="messages-drawer-overlay" onClick={onClose}>
      <div
        className="messages-drawer-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Top Header */}
        <header className="drawer-header">
          <div className="drawer-header-left">
            {viewMode === "chat" && conversations.length > 0 && (
              <button
                className="drawer-back-btn"
                onClick={() => setViewMode("list")}
                title="View Conversations"
              >
                ← Chats
              </button>
            )}
            <div className="drawer-title">
              <span className="drawer-title-icon">💬</span>
              <h3>Messages</h3>
            </div>
          </div>
          <button
            className="drawer-close-btn"
            onClick={onClose}
            title="Close Drawer"
          >
            ✕
          </button>
        </header>

        {/* Drawer Body View */}
        <div className="drawer-body">
          {viewMode === "list" ? (
            <div className="drawer-conversations-view">
              <div className="drawer-search-bar">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {filteredConversations.length === 0 ? (
                <div className="conversations-empty-card">
                  <p>No conversations found.</p>
                  <span className="muted">
                    Click a message button next to a mentor's name to start a chat!
                  </span>
                </div>
              ) : (
                <div className="drawer-conversations-list">
                  {filteredConversations.map((conv) => {
                    const partner = conv.user;
                    const partnerId = partner._id || partner.id;
                    const isSelected =
                      activeUserId?.toString() === partnerId?.toString();

                    return (
                      <div
                        key={partnerId}
                        className={`drawer-conv-item ${
                          isSelected ? "active" : ""
                        }`}
                        onClick={() => handleSelectConversation(partner)}
                      >
                        <div className="drawer-conv-avatar">
                          {partner.name ? partner.name[0].toUpperCase() : "U"}
                        </div>
                        <div className="drawer-conv-details">
                          <div className="drawer-conv-top">
                            <strong className="drawer-conv-name">
                              {partner.name}
                            </strong>
                            <span className="drawer-conv-role-badge">
                              {partner.role === "mentor" ? "Mentor" : "Student"}
                            </span>
                          </div>
                          <p className="drawer-conv-preview">
                            {conv.latestMessage?.content || "Start messaging..."}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="drawer-unread-pill">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="drawer-chat-view">
              {activeUser ? (
                <>
                  <div className="chat-thread-header">
                    <div className="chat-thread-user">
                      <div className="chat-thread-avatar">
                        {activeUser.name ? activeUser.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="chat-thread-meta">
                        <h4>{activeUser.name}</h4>
                        <span className="chat-thread-badge">
                          {activeUser.role === "mentor"
                            ? "🎓 Mentor"
                            : "🎓 Student"}
                        </span>
                      </div>
                    </div>
                    {conversations.length > 1 && (
                      <button
                        className="chat-switch-btn"
                        onClick={() => setViewMode("list")}
                      >
                        All chats ({conversations.length})
                      </button>
                    )}
                  </div>

                  <div className="chat-thread-messages">
                    {loading ? (
                      <div className="chat-loading-spinner">
                        <span>Loading messages...</span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="chat-welcome-box">
                        <div className="chat-welcome-avatar">
                          {activeUser.name ? activeUser.name[0].toUpperCase() : "U"}
                        </div>
                        <p>Start a conversation with <strong>{activeUser.name}</strong></p>
                        <span className="muted">
                          Ask questions, discuss sessions, or seek career guidance.
                        </span>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe =
                          (msg.senderId?._id || msg.senderId) === user._id ||
                          (msg.senderId?._id || msg.senderId) === user.id;

                        return (
                          <div
                            key={msg._id || msg.id || Math.random()}
                            className={`chat-bubble-row ${
                              isMe ? "sent" : "received"
                            }`}
                          >
                            <div
                              className={`chat-bubble ${
                                isMe ? "sent" : "received"
                              }`}
                            >
                              <p className="bubble-text">{msg.content}</p>
                              <span className="bubble-time">
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {error && <div className="chat-alert-error">{error}</div>}

                  <form className="chat-footer-form" onSubmit={handleSend}>
                    <input
                      type="text"
                      placeholder={`Message ${activeUser.name}...`}
                      value={inputText}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending}
                      className="chat-send-btn"
                    >
                      {sending ? "..." : "Send ➔"}
                    </button>
                  </form>
                </>
              ) : (
                <div className="chat-empty-selection">
                  <p>Select a mentor or student to message.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

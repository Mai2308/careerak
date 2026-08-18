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
  const messagesEndRef = useRef(null);

  const activeUserId = activeUser?._id || activeUser?.id || activeUser?.userId;

  // Scroll messages thread to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load conversations list
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

  // Load message thread for active user
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

  // Handle opening modal and selecting initial recipient
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
        await loadThread(targetId);
      } else if (convs.length > 0) {
        const firstUser = convs[0].user;
        setActiveUser(firstUser);
        await loadThread(firstUser._id || firstUser.id);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialRecipient]);

  // Auto poll messages every 4 seconds when thread is active
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

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  const handleSelectConversation = (convUser) => {
    setActiveUser(convUser);
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

  return (
    <div className="messages-modal-overlay" onClick={onClose}>
      <div
        className="messages-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="messages-modal-header">
          <div className="messages-modal-title">
            <span>💬</span>
            <h3>Messages</h3>
          </div>
          <button
            className="messages-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </header>

        <div className="messages-modal-body">
          {/* Left Sidebar: Conversations List */}
          <aside className="conversations-sidebar">
            <div className="conversations-sidebar-header">
              <span>Conversations</span>
            </div>
            {conversations.length === 0 ? (
              <p className="conversations-empty">No conversations yet.</p>
            ) : (
              <ul className="conversations-list">
                {conversations.map((conv) => {
                  const partner = conv.user;
                  const partnerId = partner._id || partner.id;
                  const isSelected =
                    activeUserId?.toString() === partnerId?.toString();

                  return (
                    <li
                      key={partnerId}
                      className={`conversation-item ${isSelected ? "active" : ""}`}
                      onClick={() => handleSelectConversation(partner)}
                    >
                      <div className="conv-avatar">
                        {partner.name ? partner.name[0].toUpperCase() : "U"}
                      </div>
                      <div className="conv-info">
                        <div className="conv-top">
                          <strong className="conv-name">{partner.name}</strong>
                          {conv.unreadCount > 0 && (
                            <span className="conv-unread-badge">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="conv-preview">
                          {conv.latestMessage?.content || "Start talking..."}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Right Main Chat Area */}
          <main className="chat-area">
            {activeUser ? (
              <>
                <header className="chat-header">
                  <div className="chat-header-avatar">
                    {activeUser.name ? activeUser.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="chat-header-info">
                    <h4>{activeUser.name}</h4>
                    <span className="chat-header-role">
                      {activeUser.role === "mentor"
                        ? "🎓 Mentor"
                        : "🎓 Student"}
                    </span>
                  </div>
                </header>

                <div className="chat-messages-body">
                  {loading ? (
                    <p className="chat-loading">Loading chat history...</p>
                  ) : messages.length === 0 ? (
                    <div className="chat-empty">
                      <p>No messages with {activeUser.name} yet.</p>
                      <span className="muted">
                        Say hi to start the conversation!
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
                          className={`message-bubble-wrapper ${isMe ? "me" : "them"}`}
                        >
                          <div
                            className={`message-bubble ${isMe ? "me" : "them"}`}
                          >
                            <p className="message-content">{msg.content}</p>
                            <span className="message-time">
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
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

                {error && <div className="chat-error">{error}</div>}

                <form className="chat-input-form" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder={`Type a message to ${activeUser.name}...`}
                    value={inputText}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button type="submit" disabled={!inputText.trim() || sending}>
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-placeholder">
                <p>Select a conversation or click a mentor to message them.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

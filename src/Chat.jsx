
import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_URL = "http://localhost:8080/api/messages";

function Chat({ groupId, groupName, userName }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatSearch, setChatSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Search messages by message text or sender name.
  const normalizedSearch = chatSearch.trim().toLowerCase();

  const filteredMessages = messages.filter((item) => {
    const messageText = String(item.text || "").toLowerCase();
    const senderName = String(item.sender || "").toLowerCase();

    return (
      messageText.includes(normalizedSearch) ||
      senderName.includes(normalizedSearch)
    );
  });

  // Load messages from the backend.
  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/${groupId}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server did not return a message list.");
      }

      setMessages(
        data.map((item) => ({
          id: item.id,
          text: item.message,
          sender: item.sender,
          createdAt: item.createdAt,
        }))
      );

      setError("");
    } catch (err) {
      console.error("Load messages error:", err);
      setError(`Could not load messages: ${err.message}`);
    }
  }, [groupId]);

  // Load messages when the group changes and refresh every 2 seconds.
  useEffect(() => {
    setMessages([]);
    setMessage("");
    setChatSearch("");
    setEditingId(null);
    setError("");

    loadMessages();

    const intervalId = window.setInterval(() => {
      loadMessages();
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [groupId, loadMessages]);

  // Send a new message or update an existing message.
  async function sendMessage(event) {
    event.preventDefault();

    if (!message.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const body = isEditing
        ? {
            message: message.trim(),
          }
        : {
            sender: userName || "Guest",
            message: message.trim(),
            groupId: groupId,
          };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${responseText}`
        );
      }

      setMessage("");
      setEditingId(null);

      await loadMessages();
    } catch (err) {
      console.error("Send message error:", err);
      setError(`Could not save message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Start editing a message.
  function editMessage(item) {
    setMessage(item.text);
    setEditingId(item.id);
    setError("");
  }

  // Delete a message.
  async function deleteMessage(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (editingId === id) {
        setEditingId(null);
        setMessage("");
      }

      await loadMessages();
    } catch (err) {
      console.error("Delete message error:", err);
      setError(`Could not delete message: ${err.message}`);
    }
  }

  // Chat screen.
  return (
    <div className="chat-page">
      <h1>{groupName} Chat</h1>

      <p>Share your questions and learn together!</p>

      <p>
        Logged in as: <strong>{userName || "Guest"}</strong>
      </p>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Search messages */}
      <div style={styles.searchContainer}>
        <input
          type="search"
          value={chatSearch}
          onChange={(event) => setChatSearch(event.target.value)}
          placeholder="Search messages or sender names..."
          aria-label="Search chat messages"
          style={styles.searchInput}
        />

        {chatSearch && (
          <button
            type="button"
            onClick={() => setChatSearch("")}
            style={styles.clearButton}
          >
            Clear Search
          </button>
        )}
      </div>

      <p style={styles.resultCount}>
        {chatSearch.trim()
          ? `${filteredMessages.length} matching message(s)`
          : `${messages.length} message(s)`}
      </p>

      <div className="chat-messages">
        {messages.length === 0 && !error && (
          <p>No messages yet. Start the conversation!</p>
        )}

        {messages.length > 0 &&
          filteredMessages.length === 0 && (
            <p>
              No matching messages found. Try another keyword.
            </p>
          )}

        {filteredMessages.map((item) => {
          const messageTime = item.createdAt
            ? new Date(item.createdAt).getTime()
            : 0;

          const age = Date.now() - messageTime;

          const canEditOrDelete =
            messageTime > 0 &&
            age >= 0 &&
            age < 15 * 60 * 1000;

          return (
            <div className="chat-message" key={item.id}>
              <p>
                <strong>{item.sender}</strong>
              </p>

              <p style={{ whiteSpace: "pre-wrap" }}>
                {item.text}
              </p>

              {item.createdAt && (
                <small>
                  {new Date(item.createdAt).toLocaleString()}
                </small>
              )}

              {canEditOrDelete && (
                <div style={styles.messageActions}>
                  <button
                    type="button"
                    onClick={() => editMessage(item)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteMessage(item.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form className="chat-form" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={`Message in ${groupName}...`}
          required
        />

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : editingId !== null
              ? "Update Message"
              : "Send"}
        </button>

        {editingId !== null && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setMessage("");
              setError("");
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

const styles = {
  searchContainer: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    margin: "15px 0 5px",
  },

  searchInput: {
    flex: "1",
    minWidth: "200px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  clearButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
  },

  resultCount: {
    color: "#666",
    fontSize: "13px",
  },

  messageActions: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
  },
};

export default Chat;

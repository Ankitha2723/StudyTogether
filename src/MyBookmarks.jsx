
import { useEffect, useState } from "react";

const API_BASE = `http://${window.location.hostname}:8080/api`;

function MyBookmarks({ userName, onBack }) {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const bookmarkUserKey =
    String(userName || "Guest").trim().toLowerCase() || "guest";

  // Load saved questions.
  useEffect(() => {
    let active = true;

    async function loadBookmarks() {
      try {
        setLoading(true);
        setError("");

        const saved = localStorage.getItem(
          "studyTogetherBookmarkStore"
        );

        const store = saved ? JSON.parse(saved) : {};

        const ids = Array.isArray(store?.[bookmarkUserKey])
          ? store[bookmarkUserKey].map(String)
          : [];

        if (ids.length === 0) {
          if (active) {
            setBookmarkedQuestions([]);
            setLoading(false);
          }
          return;
        }

        const response = await fetch(`${API_BASE}/questions`);

        if (!response.ok) {
          throw new Error(
            `Unable to load questions (${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid questions response.");
        }

        const savedQuestions = data.filter((question) =>
          ids.includes(String(question.id))
        );

        if (active) {
          setBookmarkedQuestions(savedQuestions);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load bookmarks.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadBookmarks();

    return () => {
      active = false;
    };
  }, [bookmarkUserKey]);

  // Remove a bookmark without deleting the original question.
  function removeBookmark(questionId) {
    try {
      const saved = localStorage.getItem(
        "studyTogetherBookmarkStore"
      );

      const store = saved ? JSON.parse(saved) : {};

      const currentIds = Array.isArray(store?.[bookmarkUserKey])
        ? store[bookmarkUserKey]
        : [];

      store[bookmarkUserKey] = currentIds.filter(
        (id) => String(id) !== String(questionId)
      );

      localStorage.setItem(
        "studyTogetherBookmarkStore",
        JSON.stringify(store)
      );

      setBookmarkedQuestions((previous) =>
        previous.filter(
          (question) => String(question.id) !== String(questionId)
        )
      );
    } catch {
      setError("Could not remove this bookmark.");
    }
  }

  // Search saved questions.
  const filteredQuestions = bookmarkedQuestions.filter((question) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      String(question.title || "").toLowerCase().includes(search) ||
      String(question.description || "").toLowerCase().includes(search) ||
      String(question.askedBy || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="bookmarks-page">

      <div className="bookmarks-header">
        <div>
          <span className="section-kicker">
            YOUR PERSONAL COLLECTION
          </span>

          <h2>⭐ My Bookmarks</h2>

          <p>
            Welcome, {userName || "Student"}!
            Here are the questions you have saved.
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            className="button button-outline"
            onClick={onBack}
          >
            ← Back
          </button>
        )}
      </div>

      <div className="bookmarks-summary">
        <span>⭐</span>

        <div>
          <strong>{bookmarkedQuestions.length}</strong>
          <p>Saved Questions</p>
        </div>
      </div>

      <input
        type="text"
        className="bookmarks-search"
        placeholder="🔍 Search your saved questions..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
      />

      {loading && (
        <div className="bookmarks-empty">
          Loading your bookmarks...
        </div>
      )}

      {error && (
        <p className="bookmarks-error">{error}</p>
      )}

      {!loading && !error && bookmarkedQuestions.length === 0 && (
        <div className="bookmarks-empty">
          <span>📚</span>
          <h3>No bookmarks yet</h3>
          <p>
            Save useful questions from the Q&A page.
            They will appear here.
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        bookmarkedQuestions.length > 0 &&
        filteredQuestions.length === 0 && (
          <div className="bookmarks-empty">
            No matching saved questions found.
          </div>
        )}

      {!loading &&
        !error &&
        filteredQuestions.map((question) => (
          <article
            className="bookmark-card"
            key={question.id}
          >
            <div className="bookmark-card-top">
              <h3>{question.title}</h3>

              <span className="bookmark-label">
                ★ Saved
              </span>
            </div>

            <p>{question.description}</p>

            <div className="bookmark-card-footer">
              <small>
                Asked by: {question.askedBy || "Guest"}
              </small>

              <button
                type="button"
                className="bookmark-remove"
                onClick={() => removeBookmark(question.id)}
              >
                Remove Bookmark
              </button>
            </div>

            {question.createdAt && (
              <small className="bookmark-date">
                {new Date(question.createdAt).toLocaleString()}
              </small>
            )}
          </article>
        ))}
    </div>
  );
}

export default MyBookmarks;

import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = `http://${window.location.hostname}:8080/api`;

// Format answers and display code blocks.
function FormattedAnswer({ text }) {
  if (!text) return null;

  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="formatted-answer">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const code = part
            .replace(
              /^```(?:java|javascript|js|sql|python)?[ \t]*\r?\n?/,
              ""
            )
            .replace(/\r?\n?```$/, "");

          return (
            <pre className="answer-code" key={index}>
              <code>{code}</code>
            </pre>
          );
        }

        return part
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line, lineIndex) => (
            <p
              className="answer-paragraph"
              key={`${index}-${lineIndex}`}
            >
              {line}
            </p>
          ));
      })}
    </div>
  );
}

function Questions({ userName, initialGroupName = "" }) {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupsLoading, setGroupsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Answers
  const [answers, setAnswers] = useState({});
  const [answerInputs, setAnswerInputs] = useState({});

  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [likingAnswerId, setLikingAnswerId] = useState(null);

  // Notifications
  const [notifications, setNotifications] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Bookmarks are saved separately for each username in this browser.
  const bookmarkUserKey =
    String(userName || "Guest").trim().toLowerCase() || "guest";

  const [bookmarkStore, setBookmarkStore] = useState(() => {
    try {
      const saved = window.localStorage.getItem(
        "studyTogetherBookmarkStore"
      );

      const parsed = saved ? JSON.parse(saved) : {};

      return parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  });

  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Save bookmarks to browser storage.
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "studyTogetherBookmarkStore",
        JSON.stringify(bookmarkStore)
      );
    } catch (storageError) {
      console.error("Could not save bookmarks.", storageError);
    }
  }, [bookmarkStore]);

  const bookmarkedQuestionIds = new Set(
    (
      Array.isArray(bookmarkStore[bookmarkUserKey])
        ? bookmarkStore[bookmarkUserKey]
        : []
    ).map(String)
  );

  // Notification tracking.
  const seenAnswerIdsRef = useRef(new Set());
  const refreshInProgressRef = useRef(false);
  const hasLoadedAnswersRef = useRef(false);

  // =========================================================
  // SEARCH QUESTIONS
  // Search by title, description, author and answers.
  // Search ignores uppercase/lowercase differences.
  // =========================================================

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const visibleQuestions = questions.filter((question) => {
    const questionTitle = String(
      question.title || ""
    ).toLowerCase();

    const questionDescription = String(
      question.description || ""
    ).toLowerCase();

    const questionAuthor = String(
      question.askedBy || ""
    ).toLowerCase();

    const answerText = (answers[question.id] || [])
      .map(
        (answer) =>
          `${answer.answerText || ""} ${answer.answeredBy || ""}`
      )
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedSearch === "" ||
      questionTitle.includes(normalizedSearch) ||
      questionDescription.includes(normalizedSearch) ||
      questionAuthor.includes(normalizedSearch) ||
      answerText.includes(normalizedSearch);

    const matchesBookmark =
      !showBookmarkedOnly ||
      bookmarkedQuestionIds.has(String(question.id));

    return matchesSearch && matchesBookmark;
  });

  // =========================================================
  // ADD OR REMOVE BOOKMARK
  // =========================================================

  const toggleBookmark = (questionId) => {
    const id = String(questionId);

    setBookmarkStore((previous) => {
      const existing = Array.isArray(previous[bookmarkUserKey])
        ? previous[bookmarkUserKey].map(String)
        : [];

      const updated = existing.includes(id)
        ? existing.filter((savedId) => savedId !== id)
        : [...existing, id];

      return {
        ...previous,
        [bookmarkUserKey]: updated,
      };
    });
  };

  // =========================================================
  // LOAD STUDY GROUPS
  // =========================================================

  const loadGroups = useCallback(async () => {
    try {
      setGroupsLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/groups`);

      if (!response.ok) {
        throw new Error(
          `Unable to load study groups (${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The groups API did not return a list.");
      }

      setGroups(data);

      setGroupName((previousGroup) => {
        const existingGroup = data.find(
          (group) => group.name === previousGroup
        );

        if (existingGroup) {
          return existingGroup.name;
        }

        const requestedGroup = data.find(
          (group) => group.name === initialGroupName
        );

        return requestedGroup?.name || data[0]?.name || "";
      });
    } catch (err) {
      setError(err.message || "Could not load study groups.");
    } finally {
      setGroupsLoading(false);
    }
  }, [initialGroupName]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // =========================================================
  // LOAD QUESTIONS AND ANSWERS
  // =========================================================

  const loadQuestions = useCallback(
    async (checkForNewAnswers = false) => {
      if (!groupName || refreshInProgressRef.current) {
        return;
      }

      refreshInProgressRef.current = true;

      if (!checkForNewAnswers) {
        setLoading(true);
      }

      try {
        if (!checkForNewAnswers) {
          setError("");
        }

        const response = await fetch(
          `${API_BASE}/questions/group/${encodeURIComponent(groupName)}`
        );

        if (!response.ok) {
          throw new Error(
            `Unable to load questions (${response.status}).`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "The questions API did not return a list."
          );
        }

        const answerResults = await Promise.all(
          data.map(async (question) => {
            const answerResponse = await fetch(
              `${API_BASE}/answers/question/${question.id}`
            );

            if (!answerResponse.ok) {
              throw new Error(
                `Unable to load answers for question ${question.id}.`
              );
            }

            const answerData = await answerResponse.json();

            return [
              question.id,
              Array.isArray(answerData) ? answerData : [],
            ];
          })
        );

        // Detect new answers for notifications.
        const newNotifications = [];

        for (const [questionId, questionAnswers] of answerResults) {
          const question = data.find(
            (item) => String(item.id) === String(questionId)
          );

          for (const answer of questionAnswers) {
            if (answer.id == null) continue;

            const answerId = String(answer.id);

            if (
              checkForNewAnswers &&
              hasLoadedAnswersRef.current &&
              !seenAnswerIdsRef.current.has(answerId)
            ) {
              const answerAuthor = String(
                answer.answeredBy || "A student"
              ).trim();

              if (
                answerAuthor.toLowerCase() !==
                String(userName || "Guest").trim().toLowerCase()
              ) {
                newNotifications.push({
                  id: answerId,
                  questionTitle: question?.title || "a question",
                  answeredBy: answerAuthor,
                  answerText: answer.answerText || "",
                });
              }
            }

            seenAnswerIdsRef.current.add(answerId);
          }
        }

        hasLoadedAnswersRef.current = true;

        setQuestions(data);
        setAnswers(Object.fromEntries(answerResults));

        if (newNotifications.length > 0) {
          setNotifications((previous) => {
            const existingIds = new Set(
              previous.map((item) => item.id)
            );

            const uniqueNotifications = newNotifications.filter(
              (item) => !existingIds.has(item.id)
            );

            return [
              ...uniqueNotifications,
              ...previous,
            ].slice(0, 10);
          });
        }
      } catch (err) {
        if (!checkForNewAnswers) {
          setError(
            err.message || "Could not load questions and answers."
          );
        }
      } finally {
        refreshInProgressRef.current = false;

        if (!checkForNewAnswers) {
          setLoading(false);
        }
      }
    },
    [groupName, userName]
  );

  useEffect(() => {
    hasLoadedAnswersRef.current = false;
    seenAnswerIdsRef.current = new Set();

    if (!groupName) {
      setQuestions([]);
      setAnswers({});
      setLoading(false);
      return undefined;
    }

    loadQuestions(false);

    // Check for new answers every 10 seconds.
    const intervalId = window.setInterval(() => {
      loadQuestions(true);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [groupName, loadQuestions]);

  // =========================================================
  // POST A QUESTION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!groupName) {
      setError("Please select a study group.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Please enter both a title and description.");
      return;
    }

    try {
      setPosting(true);

      const response = await fetch(`${API_BASE}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          groupName,
          askedBy: userName?.trim() || "Guest",
        }),
      });

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          details || `Unable to post question (${response.status}).`
        );
      }

      setTitle("");
      setDescription("");
      setSearchTerm("");
      setShowBookmarkedOnly(false);
      setMessage("Question posted successfully!");

      await loadQuestions(false);
    } catch (err) {
      setError(err.message || "Could not post question.");
    } finally {
      setPosting(false);
    }
  };

  // =========================================================
  // POST AN ANSWER
  // =========================================================

  const handleAnswerSubmit = async (event, questionId) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const answerText = answerInputs[questionId]?.trim();

    if (!answerText) {
      setError("Please enter an answer.");
      return;
    }

    try {
      setPosting(true);

      const response = await fetch(`${API_BASE}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          answerText,
          answeredBy: userName?.trim() || "Guest",
        }),
      });

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          details || `Unable to post answer (${response.status}).`
        );
      }

      setAnswerInputs((previous) => ({
        ...previous,
        [questionId]: "",
      }));

      setMessage("Answer posted successfully!");

      await loadQuestions(false);
    } catch (err) {
      setError(err.message || "Could not post answer.");
    } finally {
      setPosting(false);
    }
  };

  // =========================================================
  // LIKE AN ANSWER
  // =========================================================

  const handleLikeAnswer = async (questionId, answerId) => {
    setError("");
    setMessage("");

    try {
      setLikingAnswerId(answerId);

      const response = await fetch(
        `${API_BASE}/answers/${answerId}/like`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          details || `Unable to like answer (${response.status}).`
        );
      }

      const updatedAnswer = await response.json();

      setAnswers((previous) => ({
        ...previous,
        [questionId]: (previous[questionId] || []).map((answer) =>
          String(answer.id) === String(answerId)
            ? updatedAnswer
            : answer
        ),
      }));
    } catch (err) {
      setError(err.message || "Could not like this answer.");
    } finally {
      setLikingAnswerId(null);
    }
  };

  // Dismiss a notification.
  const dismissNotification = (notificationId) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== notificationId)
    );
  };

  // =========================================================
  // PAGE UI
  // =========================================================

  return (
    <div style={styles.container}>
      <h2>Questions &amp; Answers</h2>

      <p>
        Ask questions, explain concepts, and help other students learn.
      </p>

      {/* Notifications */}
      <section style={styles.notificationSection}>
        <h3>
          🔔 Notifications
          {notifications.length > 0
            ? ` (${notifications.length})`
            : ""}
        </h3>

        {notifications.length === 0 ? (
          <p>No new answer notifications.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={styles.notificationCard}
            >
              <strong>New answer received!</strong>

              <p>
                {notification.answeredBy} answered:{" "}
                {notification.questionTitle}
              </p>

              {notification.answerText && (
                <p>{notification.answerText}</p>
              )}

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() =>
                  dismissNotification(notification.id)
                }
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </section>

      {/* Select study group */}
      <label htmlFor="questionGroup">
        Select study group:
      </label>

      <select
        id="questionGroup"
        value={groupName}
        onChange={(event) => {
          setSearchTerm("");
          setShowBookmarkedOnly(false);
          setMessage("");
          setError("");
          setGroupName(event.target.value);
        }}
        style={styles.input}
        disabled={groupsLoading || groups.length === 0}
      >
        {groupsLoading && (
          <option value="">Loading groups...</option>
        )}

        {!groupsLoading && groups.length === 0 && (
          <option value="">No study groups available</option>
        )}

        {groups.map((group) => (
          <option key={group.id} value={group.name}>
            {group.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        style={styles.secondaryButton}
        onClick={loadGroups}
        disabled={groupsLoading}
      >
        {groupsLoading ? "Loading..." : "Refresh Groups"}
      </button>

      {groupName && (
        <>
          {/* Post a question */}
          <h3>Ask a question in {groupName}</h3>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your question title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={styles.input}
              maxLength={200}
              required
            />

            <textarea
              placeholder="Explain your question here..."
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              style={{
                ...styles.input,
                minHeight: "100px",
              }}
              required
            />

            <button
              type="submit"
              style={styles.button}
              disabled={posting}
            >
              {posting ? "Please wait..." : "Post Question"}
            </button>
          </form>

          <hr />

          <h3>Questions in {groupName}</h3>

          {/* Search input */}
          <input
            type="text"
            placeholder="Search by title, description, author, or answer..."
            aria-label="Search questions"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            style={styles.searchInput}
            autoComplete="off"
          />

          {/* Bookmark filter */}
          <div style={styles.bookmarkToolbar}>
            <span>
              {showBookmarkedOnly
                ? `Showing bookmarked questions (${bookmarkedQuestionIds.size})`
                : `Bookmarked questions: ${bookmarkedQuestionIds.size}`}
            </span>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() =>
                setShowBookmarkedOnly((previous) => !previous)
              }
            >
              {showBookmarkedOnly
                ? "Show All Questions"
                : "Show Bookmarked Only"}
            </button>
          </div>

          {loading && <p>Loading questions...</p>}

          {!loading &&
            !error &&
            questions.length === 0 && (
              <p>No questions yet. Be the first to ask!</p>
            )}

          {!loading &&
            !error &&
            questions.length > 0 &&
            visibleQuestions.length === 0 && (
              <p>
                No matching questions found. Try another word.
              </p>
            )}

          {/* Display filtered questions */}
          {!loading &&
            !error &&
            visibleQuestions.map((question) => (
              <div
                key={question.id}
                style={styles.questionCard}
              >
                <h3>{question.title}</h3>

                <FormattedAnswer text={question.description} />

                <small>
                  Asked by: {question.askedBy || "Guest"}
                </small>

                {question.createdAt && (
                  <p style={styles.date}>
                    {new Date(
                      question.createdAt
                    ).toLocaleString()}
                  </p>
                )}

                {/* Bookmark option only */}
                <div style={styles.bookmarkToolbar}>
                  <button
                    type="button"
                    style={styles.bookmarkButton}
                    onClick={() => toggleBookmark(question.id)}
                    aria-pressed={bookmarkedQuestionIds.has(
                      String(question.id)
                    )}
                  >
                    {bookmarkedQuestionIds.has(
                      String(question.id)
                    )
                      ? "★ Bookmarked"
                      : "☆ Bookmark"}
                  </button>
                </div>

                <hr />

                {/* Answers */}
                <h4>Answers</h4>

                {(answers[question.id] || []).length === 0 && (
                  <p>No answers yet. Be the first to answer!</p>
                )}

                {(answers[question.id] || []).map((answer) => (
                  <div
                    key={answer.id}
                    style={styles.answerCard}
                  >
                    <FormattedAnswer text={answer.answerText} />

                    <small>
                      Answered by: {answer.answeredBy || "Guest"}
                    </small>

                    {answer.createdAt && (
                      <p style={styles.date}>
                        {new Date(
                          answer.createdAt
                        ).toLocaleString()}
                      </p>
                    )}

                    {/* Like answer */}
                    <button
                      type="button"
                      style={styles.likeButton}
                      onClick={() =>
                        handleLikeAnswer(question.id, answer.id)
                      }
                      disabled={likingAnswerId !== null}
                    >
                      {likingAnswerId === answer.id
                        ? "Liking..."
                        : `👍 Like (${answer.likeCount ?? 0})`}
                    </button>
                  </div>
                ))}

                {/* Post an answer */}
                <form
                  onSubmit={(event) =>
                    handleAnswerSubmit(event, question.id)
                  }
                >
                  <textarea
                    placeholder={
                      "Write your answer here...\n\nFor Java code, use triple backticks before and after the code."
                    }
                    value={answerInputs[question.id] || ""}
                    onChange={(event) =>
                      setAnswerInputs((previous) => ({
                        ...previous,
                        [question.id]: event.target.value,
                      }))
                    }
                    style={{
                      ...styles.input,
                      minHeight: "100px",
                    }}
                    maxLength={3000}
                    required
                  />

                  <button
                    type="submit"
                    style={styles.button}
                    disabled={posting}
                  >
                    {posting ? "Please wait..." : "Post Answer"}
                  </button>
                </form>
              </div>
            ))}

          {error && <p style={styles.error}>{error}</p>}
        </>
      )}

      {message && <p style={styles.success}>{message}</p>}

      {!groupName && error && (
        <p style={styles.error}>{error}</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "20px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
    fontFamily: "Arial, sans-serif",
  },

  searchInput: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    margin: "10px 0 15px",
    border: "1px solid #999",
    borderRadius: "8px",
    fontSize: "16px",
    backgroundColor: "#ffffff",
    color: "#222222",
  },

  bookmarkToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    margin: "8px 0 16px",
  },

  bookmarkButton: {
    padding: "10px 14px",
    backgroundColor: "#fff7d6",
    color: "#854d0e",
    border: "1px solid #facc15",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  button: {
    padding: "12px 18px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "15px",
  },

  secondaryButton: {
    padding: "10px 14px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  likeButton: {
    padding: "8px 14px",
    marginTop: "10px",
    backgroundColor: "#e8f2ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },

  questionCard: {
    border: "1px solid #dce3ed",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "18px",
    margin: "20px 0",
    overflowWrap: "anywhere",
  },

  answerCard: {
    backgroundColor: "#f8faff",
    border: "1px solid #e0e6f0",
    borderRadius: "8px",
    padding: "15px",
    margin: "12px 0",
    overflowWrap: "anywhere",
  },

  notificationSection: {
    padding: "15px",
    margin: "15px 0 25px",
    backgroundColor: "#f4f7fb",
    border: "1px solid #dce3ed",
    borderRadius: "10px",
  },

  notificationCard: {
    padding: "12px",
    margin: "10px 0",
    backgroundColor: "#ffffff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },

  success: {
    color: "green",
    overflowWrap: "anywhere",
  },

  error: {
    color: "red",
    overflowWrap: "anywhere",
  },

  date: {
    color: "#666",
    fontSize: "12px",
  },
};

export default Questions;
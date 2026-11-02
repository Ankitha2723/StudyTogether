
import { useState } from "react";
import "./App.css";

import Login from "./Login.jsx";
import Groups from "./Groups.jsx";
import Chat from "./Chat.jsx";
import Questions from "./Questions.jsx";
import MyBookmarks from "./MyBookmarks.jsx";
import ResetPassword from "./ResetPassword.jsx";
import Resources from "./Resources.jsx";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("studyTogetherUser") || "null"
      );
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState(
    window.location.pathname.replace(/\/+$/, "") === "/reset-password"
      ? "reset"
      : "home"
  );

  const [selectedGroup, setSelectedGroup] = useState({
    id: 1,
    name: "Java Programming",
  });

  const [resourceTopic, setResourceTopic] = useState("All Topics");

  const userName = user?.username || user?.name || "Student";

  const popularGroups = [
    {
      id: 1,
      name: "Java Programming",
      description: "Learn Java basics, methods, and OOP concepts.",
    },
    {
      id: 2,
      name: "React Developers",
      description: "Practice React components, hooks, and projects.",
    },
    {
      id: 3,
      name: "SQL Learners",
      description: "Practice SQL queries, joins, and subqueries.",
    },
    {
      id: 4,
      name: "Python Learners",
      description: "Learn Python basics, functions, loops, and projects.",
    },
    {
      id: 5,
      name: "Java Interview Preparation",
      description: "Prepare Java and Spring Boot interview questions.",
    },
  ];

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);

    localStorage.setItem(
      "studyTogetherUser",
      JSON.stringify(loggedInUser)
    );

    setPage("home");
  }

  function handleLogout() {
    localStorage.removeItem("studyTogetherUser");
    setUser(null);
    setPage("home");
  }

  function requireLogin(nextPage) {
    if (!user) {
      alert("Please login first.");
      setPage("login");
      return false;
    }

    setPage(nextPage);
    return true;
  }

  function openChat(group) {
    if (!requireLogin("chat")) return;

    setSelectedGroup(group);
  }

  function openQuestions(group = selectedGroup) {
    if (!requireLogin("questions")) return;

    if (group) {
      setSelectedGroup(group);
    }
  }

  function openResources(topic = "All Topics") {
    setResourceTopic(topic);
    setPage("resources");
  }

  if (page === "reset") {
    return <ResetPassword />;
  }

  return (
    <div className="app">

      {/* TOP NAVIGATION */}
      <header className="navbar">

        <button
          type="button"
          className="site-logo"
          onClick={() => setPage("home")}
        >
          StudyTogether
        </button>

        <nav className="main-navigation">

          <button
            className={page === "home" ? "nav-active" : ""}
            onClick={() => setPage("home")}
          >
            Home
          </button>

          <button
            className={page === "groups" ? "nav-active" : ""}
            onClick={() => requireLogin("groups")}
          >
            Study Groups
          </button>

          <button
            className={page === "questions" ? "nav-active" : ""}
            onClick={() => openQuestions()}
          >
            Questions &amp; Answers
          </button>

          {user && (
            <button
              className={page === "bookmarks" ? "nav-active" : ""}
              onClick={() => requireLogin("bookmarks")}
            >
              My Bookmarks
            </button>
          )}

          <button
            className={page === "resources" ? "nav-active" : ""}
            onClick={() => openResources()}
          >
            Learning Resources
          </button>

          <button
            onClick={() =>
              document.getElementById("about")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            About
          </button>

        </nav>

        <div className="user-actions">

          {user ? (
            <>
              <span>
                Welcome, {userName}
              </span>

              <button
                className="login-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => setPage("login")}
            >
              Login / Register
            </button>
          )}

        </div>

      </header>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          <section className="hero" id="home">

            <h1>Study Together, Grow Together!</h1>

            <p>
              Connect with students, create study groups, chat with
              classmates, and ask questions to learn together.
            </p>

            <div className="hero-buttons">

              <button
                className="start-btn"
                onClick={() =>
                  user ? setPage("groups") : setPage("login")
                }
              >
                Explore Study Groups
              </button>

              <button
                className="start-btn"
                onClick={() => openQuestions()}
              >
                Questions &amp; Answers
              </button>

              {user && (
                <button
                  className="start-btn"
                  onClick={() => setPage("bookmarks")}
                >
                  ⭐ My Bookmarks
                </button>
              )}

              <button
                className="start-btn"
                onClick={() => openResources()}
              >
                📚 Learning Resources
              </button>

            </div>

          </section>

          {/* POPULAR GROUPS */}
          <section className="groups" id="groups">

            <h2>Popular Study Groups</h2>

            <div className="group-container">

              {popularGroups.map((group) => (

                <div className="group-card" key={group.id}>

                  <h3>{group.name}</h3>

                  <p>{group.description}</p>

                  <div className="group-buttons">

                    <button
                      onClick={() => openChat(group)}
                    >
                      Join Group
                    </button>

                    <button
                      className="secondary-button"
                      onClick={() => openResources(group.name)}
                    >
                      Topic Resources
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

          <footer id="about">
            <h3>About StudyTogether</h3>

            <p>
              StudyTogether helps students learn together through
              study groups, group discussions, questions, answers,
              and learning resources.
            </p>

            <p>
              © 2026 StudyTogether | Learn and Grow Together
            </p>
          </footer>
        </>
      )}

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div className="other-page">
          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <Login
            onLogin={handleLogin}
            onClose={() => setPage("home")}
          />
        </div>
      )}

      {/* STUDY GROUPS */}
      {page === "groups" && (
        <div className="other-page">

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <Groups
            userName={userName}
            onSelectGroup={openChat}
          />

        </div>
      )}

      {/* CHAT */}
      {page === "chat" && (
        <div className="other-page">

          <button
            className="back-btn"
            onClick={() => setPage("groups")}
          >
            ← Back to Groups
          </button>

          <Chat
            groupId={selectedGroup.id}
            groupName={selectedGroup.name}
            userName={userName}
          />

        </div>
      )}

      {/* QUESTIONS */}
      {page === "questions" && (
        <div className="other-page">

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <Questions
            userName={userName}
            initialGroupName={selectedGroup.name}
          />

        </div>
      )}

      {/* BOOKMARKS */}
      {page === "bookmarks" && (
        <div className="other-page">

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <MyBookmarks
            userName={userName}
            onBack={() => setPage("home")}
          />

        </div>
      )}

      {/* LEARNING RESOURCES */}
      {page === "resources" && (
        <div className="other-page">

          <button
            className="back-btn"
            onClick={() => setPage("home")}
          >
            ← Back to Home
          </button>

          <Resources initialTopic={resourceTopic} />

        </div>
      )}

    </div>
  );
}

export default App;

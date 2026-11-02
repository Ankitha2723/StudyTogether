import { useState } from "react";
import "./App.css";
import ForgotPassword from "./ForgotPassword";

// Automatically use the same host as the React website.
// Computer: localhost
// Phone: your computer's LAN IP, for example 192.168.1.3
const API_URL = `http://${window.location.hostname}:8080/api/auth`;

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (loading) return;

    if (isRegister && !username.trim()) {
      setMessage("Please enter your username.");
      return;
    }

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister
        ? `${API_URL}/register`
        : `${API_URL}/login`;

      const requestBody = isRegister
        ? {
            username: username.trim(),
            email: email.trim(),
            password,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Handle both JSON and plain-text backend responses.
      const responseText = await response.text();

      let data = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (!response.ok) {
        setMessage(
          data.message ||
            (isRegister
              ? `Registration failed (${response.status}).`
              : `Login failed (${response.status}). Check your email and password.`)
        );
        return;
      }

      if (isRegister) {
        setMessage("Registration successful! Please log in.");

        setIsRegister(false);
        setUsername("");
        setPassword("");
      } else {
        setMessage("Login successful!");

        if (typeof onLogin === "function") {
          onLogin(data);
        }
      }
    } catch (error) {
      console.error("Login/Register error:", error);

      setMessage(
        `Unable to connect to the server at ${API_URL}. Check that Spring Boot is running and the network address is correct.`
      );
    } finally {
      setLoading(false);
    }
  }

  // Show the existing Forgot Password component.
  if (showForgotPassword) {
    return (
      <ForgotPassword
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setMessage("");
        }}
      />
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>
          {isRegister ? "Create Account" : "Welcome Back!"}
        </h2>

        <p>
          {isRegister
            ? "Join StudyTogether today"
            : "Login to StudyTogether"}
        </p>

        {isRegister && (
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />
        )}

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={
            isRegister ? "new-password" : "current-password"
          }
          required
        />

        {message && (
          <p
            role="status"
            aria-live="polite"
            style={{
              color: message.includes("successful") ? "green" : "red",
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Register"
              : "Login"}
        </button>

        {!isRegister && (
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(true);
              setMessage("");
            }}
            style={styles.linkButton}
          >
            Forgot Password?
          </button>
        )}

        <p>
          {isRegister
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsRegister((previous) => !previous);
              setMessage("");
              setPassword("");
            }}
            style={styles.linkButton}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  linkButton: {
    width: "100%",
    background: "transparent",
    color: "#4263eb",
    border: "none",
    padding: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "bold",
  },
};

export default Login;
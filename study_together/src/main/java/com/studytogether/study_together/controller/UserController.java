
package com.studytogether.study_together.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studytogether.study_together.model.User;
import com.studytogether.study_together.service.UserService;
import com.studytogether.study_together.service.PasswordResetService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
	    "http://localhost:5173",
	    "http://localhost:5174",
	    "http://192.168.1.3:5173"
	})


public class UserController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;

    public UserController(
            UserService userService,
            PasswordResetService passwordResetService) {

        this.userService = userService;
        this.passwordResetService = passwordResetService;
    }

    // 1. Register a new user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User savedUser = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(
                Map.of(
                    "id", savedUser.getId(),
                    "username", savedUser.getUsername(),
                    "email", savedUser.getEmail(),
                    "message", "Registration successful. Please login."
                )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );
        }
    }

    // 2. Login an existing user
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            User user = userService.loginUser(email, password);

            return ResponseEntity.ok(
                Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "message", "Login successful."
                )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("message", e.getMessage())
            );
        }
    }

    // 3. Request a password-reset link
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Please enter your email address.")
            );
        }

        passwordResetService.createResetToken(email);

        return ResponseEntity.ok(
            Map.of(
                "message",
                "If this email is registered, password reset instructions will be sent."
            )
        );
    }

    // 4. Reset the password using a valid token
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");

            passwordResetService.resetPassword(token, newPassword);

            return ResponseEntity.ok(
                Map.of(
                    "message",
                    "Password reset successful. Please login."
                )
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );
        }
    }
}

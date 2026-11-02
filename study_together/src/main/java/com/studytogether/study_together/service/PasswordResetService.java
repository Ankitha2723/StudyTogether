
package com.studytogether.study_together.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studytogether.study_together.model.PasswordResetToken;
import com.studytogether.study_together.model.User;
import com.studytogether.study_together.repo.PasswordResetTokenRepository;
import com.studytogether.study_together.repo.UserRepository;

@Service
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public PasswordResetService(
            PasswordResetTokenRepository tokenRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {

        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // Step 1: Create a password-reset token and send the email.
    public void createResetToken(String email) {

        if (email == null || email.isBlank()) {
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();

        // Only registered users can receive reset emails.
        if (!userRepository.existsByEmail(normalizedEmail)) {
            return;
        }

        // Generate a secure random token.
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        // Save the token with a 15-minute expiry.
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setEmail(normalizedEmail);
        resetToken.setExpiryDate(
                LocalDateTime.now().plusMinutes(15));
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // Build the reset link for the React frontend.
        String resetLink =
        	    "http://192.168.1.3:5173/reset-password?token=" + token;

        // Send the link to this user's registered email.
        
     // Send the link to this user's registered email.
     System.out.println("Sending reset email to: " + normalizedEmail);

     emailService.sendPasswordResetEmail(
             normalizedEmail, resetLink);

     System.out.println("Reset email sent successfully!");
    
    }

    // Step 2: Validate the token and update the password.
    public void resetPassword(String token, String newPassword) {

        if (token == null || token.isBlank()) {
            throw new RuntimeException("Reset token is required.");
        }

        if (newPassword == null || newPassword.length() < 8) {
            throw new RuntimeException(
                    "Password must contain at least 8 characters.");
        }

        PasswordResetToken resetToken = tokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new RuntimeException("Invalid reset link."));

        if (resetToken.isUsed()) {
            throw new RuntimeException(
                    "This reset link has already been used.");
        }

        if (!resetToken.getExpiryDate().isAfter(LocalDateTime.now())) {
            throw new RuntimeException(
                    "This reset link has expired. Please request another.");
        }

        User user = userRepository
                .findByEmail(resetToken.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User account not found."));

        // Encrypt the new password before saving it.
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark the token as used.
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}

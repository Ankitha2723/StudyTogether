package com.studytogether.study_together.service;


import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(recipientEmail);
        message.setSubject("StudyTogether - Password Reset");

        message.setText(
                "Hello,\n\n"
                + "We received a request to reset your StudyTogether password.\n\n"
                + "Click the link below to reset your password:\n"
                + resetLink + "\n\n"
                + "This link expires in 15 minutes.\n\n"
                + "If you did not request this, you can ignore this email.\n\n"
                + "Thank you,\n"
                + "StudyTogether Team"
        );

        mailSender.send(message);
    }
}

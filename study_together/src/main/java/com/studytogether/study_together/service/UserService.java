



package com.studytogether.study_together.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.studytogether.study_together.model.User;
import com.studytogether.study_together.repo.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException(
                "This email is already registered. Please login."
            );
        }

        user.setUsername(user.getUsername().trim());
        user.setEmail(user.getEmail().trim().toLowerCase());

       
        user.setPassword(
            passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(
            email.trim().toLowerCase()
        ).orElseThrow(() -> new RuntimeException(
            "You are not registered. Please register first."
        ));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException(
                "Incorrect email or password."
            );
        }

        return user;
    }
}




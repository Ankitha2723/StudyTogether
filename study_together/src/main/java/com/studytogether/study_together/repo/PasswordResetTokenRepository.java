
package com.studytogether.study_together.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studytogether.study_together.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByEmail(String email);
}




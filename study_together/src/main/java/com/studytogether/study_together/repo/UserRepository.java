package com.studytogether.study_together.repo;



import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studytogether.study_together.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}




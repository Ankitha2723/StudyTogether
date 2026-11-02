package com.studytogether.study_together.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studytogether.study_together.model.ChatMessage;

import java.util.List;

public interface ChatMessageRepository  extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);
}




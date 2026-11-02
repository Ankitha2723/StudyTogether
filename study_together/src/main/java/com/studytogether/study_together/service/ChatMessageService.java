package com.studytogether.study_together.service;

import org.springframework.stereotype.Service;

import com.studytogether.study_together.model.ChatMessage;
import com.studytogether.study_together.repo.ChatMessageRepository;

import java.util.List;

@Service

public class ChatMessageService {
	
	    private final ChatMessageRepository repository;

	    public ChatMessageService(ChatMessageRepository repository) {
	        this.repository = repository;
	    }

	    public ChatMessage saveMessage(ChatMessage message) {
	        message.setCreatedAt(System.currentTimeMillis());
	        return repository.save(message);
	    }

	    public List<ChatMessage> getMessages(Long groupId) {
	        return repository.findByGroupIdOrderByCreatedAtAsc(groupId);
	    }

	    public void deleteMessage(Long id) {
	        repository.deleteById(id);
	    }
	    public ChatMessage updateMessage(Long id, String newMessage) {
	        ChatMessage chatMessage = repository.findById(id)
	            .orElseThrow(() -> new RuntimeException("Message not found"));

	        chatMessage.setMessage(newMessage);

	        return repository.save(chatMessage);
	    }
	}




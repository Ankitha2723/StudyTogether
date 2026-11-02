package com.studytogether.study_together.model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
@Entity
@Table(name = "chat_messages")


public class ChatMessage {

	

	

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String sender;
	    private String message;
	    private Long groupId;
	    private Long createdAt;

	    public ChatMessage() {
	    }

	    public Long getId() {
	        return id;
	    }

	    public void setId(Long id) {
	        this.id = id;
	    }

	    public String getSender() {
	        return sender;
	    }

	    public void setSender(String sender) {
	        this.sender = sender;
	    }

	    public String getMessage() {
	        return message;
	    }

	    public void setMessage(String message) {
	        this.message = message;
	    }

	    public Long getGroupId() {
	        return groupId;
	    }

	    public void setGroupId(Long groupId) {
	        this.groupId = groupId;
	    }

	    public Long getCreatedAt() {
	        return createdAt;
	    }

	    public void setCreatedAt(Long createdAt) {
	        this.createdAt = createdAt;
	    }
	}




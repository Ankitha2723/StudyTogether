
package com.studytogether.study_together.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studytogether.study_together.model.ChatMessage;
import com.studytogether.study_together.service.ChatMessageService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatMessageController {

    private final ChatMessageService service;

    public ChatMessageController(ChatMessageService service) {
        this.service = service;
    }

    @PostMapping
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return service.saveMessage(message);
    }

    @GetMapping("/{groupId}")
    public List<ChatMessage> getMessages(@PathVariable Long groupId) {
        return service.getMessages(groupId);
    }

    @PutMapping("/{id}")
    public ChatMessage updateMessage(
            @PathVariable Long id,
            @RequestBody ChatMessage message) {
        return service.updateMessage(id, message.getMessage());
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id) {
        service.deleteMessage(id);
    }
}

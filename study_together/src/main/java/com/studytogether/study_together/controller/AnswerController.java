package com.studytogether.study_together.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.studytogether.study_together.model.Answer;
import com.studytogether.study_together.service.AnswerService;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://192.168.1.3:5173"
})
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    // Post a new answer
    @PostMapping
    public ResponseEntity<Answer> addAnswer(
            @RequestBody Answer answer) {

        if (answer.getQuestionId() == null
                || answer.getAnswerText() == null
                || answer.getAnswerText().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Answer savedAnswer = answerService.saveAnswer(answer);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(savedAnswer);
    }

    // Get answers for a particular question
    @GetMapping("/question/{questionId}")
    public List<Answer> getAnswers(
            @PathVariable Long questionId) {

        return answerService.getAnswersByQuestionId(questionId);
    }

    // Like an answer
    @PostMapping("/{answerId}/like")
    public ResponseEntity<Answer> likeAnswer(
            @PathVariable Long answerId) {

        Answer updatedAnswer = answerService.likeAnswer(answerId);

        return ResponseEntity.ok(updatedAnswer);
    }
}
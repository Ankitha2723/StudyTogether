package com.studytogether.study_together.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.studytogether.study_together.model.Answer;
import com.studytogether.study_together.repo.AnswerRepository;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    // Save a new answer
    public Answer saveAnswer(Answer answer) {

        answer.setCreatedAt(LocalDateTime.now());

        if (answer.getAnsweredBy() == null
                || answer.getAnsweredBy().trim().isEmpty()) {
            answer.setAnsweredBy("Guest");
        }

        // New answers start with zero likes
        answer.setLikeCount(0);

        return answerRepository.save(answer);
    }

    // Get answers for a question
    public List<Answer> getAnswersByQuestionId(Long questionId) {
        return answerRepository
                .findByQuestionIdOrderByCreatedAtAsc(questionId);
    }

    // Like an answer and save the updated count
    public Answer likeAnswer(Long answerId) {

        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Answer not found with id: " + answerId
                ));

        int currentLikes = answer.getLikeCount() == null
                ? 0
                : answer.getLikeCount();

        answer.setLikeCount(currentLikes + 1);

        return answerRepository.save(answer);
    }
}
package com.studytogether.study_together.service;

import com.studytogether.study_together.entity.Question;
import com.studytogether.study_together.repo.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Save a new question
    public Question saveQuestion(Question question) {
        question.setId(null);
        return questionRepository.save(question);
    }

    // Get questions belonging to a particular group
    public List<Question> getQuestionsByGroup(String groupName) {
        return questionRepository
                .findByGroupNameIgnoreCaseOrderByCreatedAtDesc(groupName);
    }

    // Get all questions
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Edit an existing question
    public Question updateQuestion(Long id, Question updatedQuestion) {
        Question existingQuestion = questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Question not found with id: " + id
                ));

        existingQuestion.setTitle(updatedQuestion.getTitle());
        existingQuestion.setDescription(updatedQuestion.getDescription());

        return questionRepository.save(existingQuestion);
    }

    // Delete an existing question
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Question not found with id: " + id
            );
        }

        questionRepository.deleteById(id);
    }
}


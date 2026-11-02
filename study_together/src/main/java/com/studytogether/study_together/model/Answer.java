package com.studytogether.study_together.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;

@Entity
@Table(name = "question_answers")
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long questionId;

    @Column(nullable = false, length = 3000)
    private String answerText;

    @Column(nullable = false)
    private String answeredBy;

    private LocalDateTime createdAt;

    // New field for answer likes
    @Column(nullable = false)
    private Integer likeCount = 0;

    public Answer() {
    }

    public Answer(
            Long questionId,
            String answerText,
            String answeredBy,
            LocalDateTime createdAt) {

        this.questionId = questionId;
        this.answerText = answerText;
        this.answeredBy = answeredBy;
        this.createdAt = createdAt;
        this.likeCount = 0;
    }

    public Long getId() {
        return id;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public String getAnsweredBy() {
        return answeredBy;
    }

    public void setAnsweredBy(String answeredBy) {
        this.answeredBy = answeredBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Get the number of likes
    public Integer getLikeCount() {
        return likeCount;
    }

    // Update the number of likes
    public void setLikeCount(Integer likeCount) {
        this.likeCount = likeCount;
    }
}
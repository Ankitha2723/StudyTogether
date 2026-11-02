
package com.studytogether.study_together.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studytogether.study_together.model.Answer;


public interface AnswerRepository extends JpaRepository<Answer, Long> {

    List<Answer> findByQuestionIdOrderByCreatedAtAsc(Long questionId);
}


	package com.studytogether.study_together.repo;

	import com.studytogether.study_together.entity.Question;
	import org.springframework.data.jpa.repository.JpaRepository;
	import java.util.List;

	public interface QuestionRepository extends JpaRepository<Question, Long> {

	    List<Question> findByGroupNameIgnoreCaseOrderByCreatedAtDesc(String groupName);
	}


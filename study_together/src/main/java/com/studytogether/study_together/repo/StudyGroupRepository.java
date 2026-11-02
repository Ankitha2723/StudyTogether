package com.studytogether.study_together.repo;



	import org.springframework.data.jpa.repository.JpaRepository;
	import com.studytogether.study_together.model.StudyGroup;

	public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
	}




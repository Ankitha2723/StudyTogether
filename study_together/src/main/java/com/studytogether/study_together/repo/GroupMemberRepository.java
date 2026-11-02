package com.studytogether.study_together.repo;



	import java.util.List;

	import org.springframework.data.jpa.repository.JpaRepository;

	import com.studytogether.study_together.model.GroupMember;

	public interface GroupMemberRepository
	        extends JpaRepository<GroupMember, Long> {

	    List<GroupMember> findByGroupId(Long groupId);
	}




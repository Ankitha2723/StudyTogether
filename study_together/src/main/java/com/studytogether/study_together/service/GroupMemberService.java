package com.studytogether.study_together.service;




	import java.util.List;

	import org.springframework.stereotype.Service;

	import com.studytogether.study_together.model.GroupMember;
	import com.studytogether.study_together.repo.GroupMemberRepository;

	@Service
	public class GroupMemberService {

	    private final GroupMemberRepository repository;

	    public GroupMemberService(GroupMemberRepository repository) {
	        this.repository = repository;
	    }

	    public GroupMember joinGroup(GroupMember member) {
	        return repository.save(member);
	    }

	    public List<GroupMember> getGroupMembers(Long groupId) {
	        return repository.findByGroupId(groupId);
	    }
	}

	



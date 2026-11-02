package com.studytogether.study_together.controller;




	import java.util.List;

	import org.springframework.web.bind.annotation.*;

	import com.studytogether.study_together.model.GroupMember;
	import com.studytogether.study_together.service.GroupMemberService;

	@RestController
	@RequestMapping("/api/group-members")
	@CrossOrigin(origins = "http://localhost:5173")
	public class GroupMemberController {

	    private final GroupMemberService service;

	    public GroupMemberController(GroupMemberService service) {
	        this.service = service;
	    }

	    @PostMapping
	    public GroupMember joinGroup(@RequestBody GroupMember member) {
	        return service.joinGroup(member);
	    }

	    @GetMapping("/{groupId}")
	    public List<GroupMember> getGroupMembers(
	            @PathVariable Long groupId) {
	        return service.getGroupMembers(groupId);
	    }
	}




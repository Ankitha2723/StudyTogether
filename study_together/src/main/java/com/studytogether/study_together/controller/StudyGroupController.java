package com.studytogether.study_together.controller;





import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studytogether.study_together.model.StudyGroup;
import com.studytogether.study_together.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:5173")
public class StudyGroupController {

    private final StudyGroupService service;

    public StudyGroupController(StudyGroupService service) {
        this.service = service;
    }

    @PostMapping
    public StudyGroup createGroup(@RequestBody StudyGroup group) {
        return service.createGroup(group);
    }

    @GetMapping
    public List<StudyGroup> getAllGroups() {
        return service.getAllGroups();
    }
}




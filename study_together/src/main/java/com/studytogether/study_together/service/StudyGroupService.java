package com.studytogether.study_together.service;





import java.util.List;

import org.springframework.stereotype.Service;

import com.studytogether.study_together.model.StudyGroup;
import com.studytogether.study_together.repo.StudyGroupRepository;

@Service
public class StudyGroupService {

    private final StudyGroupRepository repository;

    public StudyGroupService(StudyGroupRepository repository) {
        this.repository = repository;
    }

    public StudyGroup createGroup(StudyGroup group) {
        return repository.save(group);
    }

    public List<StudyGroup> getAllGroups() {
        return repository.findAll();
    }
}




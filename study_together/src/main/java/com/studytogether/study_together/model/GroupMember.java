package com.studytogether.study_together.model;





import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "group_members",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"group_id", "member_name"}
    )
)
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "member_name", nullable = false, length = 100)
    private String memberName;

    @Column(name = "joined_at", insertable = false, updatable = false)
    private LocalDateTime joinedAt;

    public GroupMember() {
    }

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getMemberName() {
        return memberName;
    }

    public void setMemberName(String memberName) {
        this.memberName = memberName;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}




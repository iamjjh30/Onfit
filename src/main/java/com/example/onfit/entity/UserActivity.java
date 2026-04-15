package com.example.onfit.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_activity")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserActivity {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "fitting_count")
    private Integer fittingCount = 0;

    @Column(name = "buy_count")
    private Integer buyCount = 0;

    @Column(name = "post_count")
    private Integer postCount = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

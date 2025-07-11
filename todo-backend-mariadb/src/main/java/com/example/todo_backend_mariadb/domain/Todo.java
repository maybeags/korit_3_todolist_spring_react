package com.example.todo_backend_mariadb.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity // 얘가 DB랑 연결되는 JPA 엔티티임을 나타냄
@Data // 종합패키지 -> getter / setter alt+ins로 안만들겁니다.
@NoArgsConstructor
@AllArgsConstructor
@Builder    // 수정했습니다.
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    private Long Id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    @Column(nullable = false)
    private boolean completed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}

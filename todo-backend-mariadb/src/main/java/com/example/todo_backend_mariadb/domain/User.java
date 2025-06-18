package com.example.todo_backend_mariadb.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users") // user는 DB상에서 예약어라서 오류가 발생할 가능성↑ / car에서는 AppUser였죠
@NoArgsConstructor
@Getter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;


    @Builder        // 생성자에 @Builder 애너테이션 적용 예시 / 클래스 레벨이 아니라.
    public User(String name, String email, Role role) {
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public User update(String name) {
        this.name = name;
        return this;
    }
}

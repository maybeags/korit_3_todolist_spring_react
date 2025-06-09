package com.example.todo_backend_mariadb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TodoBackendMariadbApplication {

	public static void main(String[] args) {
		// ---▼ 진단 코드 추가 ▼---
		try {
			// Spring Security의 핵심 클래스 중 하나를 로드해봅니다.
			Class.forName("org.springframework.security.config.annotation.web.configuration.EnableWebSecurity");
			System.out.println(">>>>>>>>>> Spring Security가 클래스패스에 존재합니다 (활성화 상태). <<<<<<<<<<");
		} catch (ClassNotFoundException e) {
			System.out.println(">>>>>>>>>> Spring Security가 클래스패스에 없습니다 (비활성화 상태). <<<<<<<<<<");
		}
		// ---▲ 진단 코드 끝 ▲---
		SpringApplication.run(TodoBackendMariadbApplication.class, args);
	}

}

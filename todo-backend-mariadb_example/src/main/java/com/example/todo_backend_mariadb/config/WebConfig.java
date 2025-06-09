//package com.example.todo_backend_mariadb.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration  // 이 클래스가 Spring의 Config 관련 파일임을 명시하는 애너테이션
//public class WebConfig implements WebMvcConfigurer {
//    @Override
//    public void addCorsMappings(CorsRegistry registry) {
//        registry.addMapping("/**") // "/**"는 모든 경로에 대해 CORS 설정을 적용한다는 의미입니다.
//                .allowedOrigins("http://localhost:5173", "http://localhost:3000") // 허용할 프론트엔드 서버의 주소를 입력합니다. (Vite 기본 포트 5173, CRA 기본 포트 3000)
//                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // 허용할 HTTP 메소드를 지정합니다.
//                .allowedHeaders("*") // 모든 HTTP 헤더를 허용합니다.
//                .allowCredentials(true) // 자격 증명(쿠키, 인증 헤더 등)을 허용합니다.
//                .maxAge(3600); // 브라우저가 pre-flight 요청 결과를 캐시할 시간(초)을 설정합니다.
//    }
//}

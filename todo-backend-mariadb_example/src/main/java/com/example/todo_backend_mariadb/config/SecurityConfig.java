package com.example.todo_backend_mariadb.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. CORS 설정을 우리가 아래에 정의한 corsConfigurationSource() Bean을 사용하도록 지정합니다.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. CSRF 보호 기능을 비활성화합니다. (Stateless한 REST API에서는 보통 비활성화합니다.)
                .csrf(csrf -> csrf.disable())

                // 3. 세션 관리 정책을 STATELESS로 설정합니다. (토큰 기반 인증 시 세션을 사용하지 않습니다.)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. HTTP 요청에 대한 접근 권한을 설정합니다.
                .authorizeHttpRequests(authz -> authz
                        // preflight 요청(OPTIONS 메소드)은 인증 없이 모두 허용합니다. (CORS 문제 해결의 핵심)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 현재는 로그인 기능이 없으므로, 모든 API 요청을 임시로 허용하여 테스트합니다.
                        // 추후 OAuth2 적용 시 이 부분을 .authenticated()로 변경하여 인증된 사용자만 접근하도록 만들 것입니다.
                        .requestMatchers("/api/**").permitAll()

                        // 그 외 나머지 모든 요청도 일단은 허용합니다.
                        .anyRequest().permitAll()
                );

        // SecurityFilterChain 객체를 빌드하여 반환합니다.
        return http.build();
    }

    @Bean // CORS 설정을 위한 Bean을 등록합니다.
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용할 프론트엔드 서버의 주소를 지정합니다.
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));

        // 허용할 HTTP 메소드를 지정합니다. ("*"는 모든 메소드를 의미)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용할 HTTP 헤더를 지정합니다.
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));

        // 자격 증명(쿠키, 인증 헤더 등)과 함께 요청을 보낼 수 있도록 허용합니다.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 경로("/**")에 대해 위에서 정의한 CORS 설정을 적용합니다.
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}

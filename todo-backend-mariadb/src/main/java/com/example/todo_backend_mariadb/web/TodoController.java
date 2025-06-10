package com.example.todo_backend_mariadb.web;

import com.example.todo_backend_mariadb.dto.TodoDtos; // DTO를 담고 있는 바깥 클래스 import
import com.example.todo_backend_mariadb.service.TodoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {

    private final TodoService todoService;

    @GetMapping
    public ResponseEntity<List<TodoDtos.TodoResponseDto>> getMyTodos(@AuthenticationPrincipal Jwt principal) {
        return ResponseEntity.ok(todoService.findMyTodos(principal.getClaimAsString("email")));
    }

    @PostMapping

    public ResponseEntity<TodoDtos.TodoResponseDto> createTodo(@RequestBody TodoDtos.TodoCreateRequestDto requestDto, @AuthenticationPrincipal Jwt principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.createTodo(requestDto, principal.getClaimAsString("email")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TodoDtos.TodoResponseDto> toggleTodo(@PathVariable Long id, @AuthenticationPrincipal Jwt principal) {
        return ResponseEntity.ok(todoService.toggleTodo(id, principal.getClaimAsString("email")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id, @AuthenticationPrincipal Jwt principal) {
        todoService.deleteTodo(id, principal.getClaimAsString("email"));
        return ResponseEntity.noContent().build();
    }
}

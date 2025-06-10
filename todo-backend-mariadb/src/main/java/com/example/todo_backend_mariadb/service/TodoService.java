package com.example.todo_backend_mariadb.service;

import com.example.todo_backend_mariadb.domain.*;
import com.example.todo_backend_mariadb.dto.TodoDtos.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    @Transactional
    public TodoResponseDto createTodo(TodoCreateRequestDto requestDto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseGet(() -> userRepository.save(User.builder()
                        .name(userEmail.split("@")[0])
                        .email(userEmail)
                        .role(Role.USER)
                        .build()));
        Todo todo = Todo.builder()
                .text(requestDto.text())
                .completed(false)
                .user(user)
                .build();
        return new TodoResponseDto(todoRepository.save(todo));
    }

    public List<TodoResponseDto> findMyTodos(String userEmail) {
        User user = findUserByEmail(userEmail);
        return todoRepository.findByUserOrderByIdDesc(user).stream()
                .map(TodoResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TodoResponseDto toggleTodo(Long id, String userEmail) {
        Todo todo = findTodoByIdAndUserEmail(id, userEmail);
        todo.setCompleted(!todo.isCompleted());
        return new TodoResponseDto(todo);
    }

    @Transactional
    public void deleteTodo(Long id, String userEmail) {
        Todo todo = findTodoByIdAndUserEmail(id, userEmail);
        todoRepository.delete(todo);
    }

    private User findUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseGet(() -> userRepository.save(User.builder().name(userEmail.split("@")[0]).email(userEmail).role(Role.USER).build()));
    }
    private Todo findTodoByIdAndUserEmail(Long id, String userEmail) {
        return todoRepository.findById(id)
                .filter(todo -> todo.getUser().getEmail().equals(userEmail))
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않거나 권한이 없는 Todo 입니다. ID: " + id));
    }





}

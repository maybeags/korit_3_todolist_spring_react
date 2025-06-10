package com.example.todo_backend_mariadb.dto;

import com.example.todo_backend_mariadb.domain.Todo;

public class TodoDtos {

    public record TodoCreateRequestDto(String text) {}

    public record TodoUpdateRequestDto(Boolean completed) {}

    public record TodoResponseDto(Long id, String text, boolean completed, String author) {
        public TodoResponseDto(Todo entity) {
            this(
                    entity.getId(),
                    entity.getText(),
                    entity.isCompleted(),
                    entity.getUser().getName()
            );


        }
    }
}

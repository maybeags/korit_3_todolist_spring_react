package com.example.todo_backend_mariadb.domain;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
// Spring Data Rest를 통해서 REST API로 자동 노출 설정
@RepositoryRestResource(collectionResourceRel = "todos", path="todos")
public interface TodoRepository extends CrudRepository<Todo, Long> {
    //CrudRespository를 상속받기 때문에 기본적인 데이터베이스 작업 메서드들이 이미 구현되어있습니다.
    // ex) save(Todo entity), findById(Long id), findAll(), deleteById(Long id) 등
}

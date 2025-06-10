package com.example.todo_backend_mariadb.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

// Spring Data Rest를 통해서 REST API로 자동 노출 설정
//@RepositoryRestResource(collectionResourceRel = "todos", path="todos") // 수정했습니다.
public interface TodoRepository extends JpaRepository<Todo, Long> {         // CrudRepository에서 수정
    //CrudRespository를 상속받기 때문에 기본적인 데이터베이스 작업 메서드들이 이미 구현되어있습니다.
    // ex) save(Todo entity), findById(Long id), findAll(), deleteById(Long id) 등

    List<Todo> findByUserOrderByIdDesc(User user);

}

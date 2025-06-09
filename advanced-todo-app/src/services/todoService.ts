import axios from "axios";
import type { Todo } from "../types/Todo";

// .env에 쓰지 않았기 때문에 VITE_로 시작하지 않았습니다.
const API_BASE_URL = 'http://localhost:8080/api';

// HATEOAS 응답 내의 Todo 객체 타입
interface HateoasTodo {
  text: string;
  completed: boolean;
  _links: { self: { href: string; }; };
}

// HATEOAS 응답의 전체 구조 타입
interface SpringDataRestResponse {
  _embedded?: { todos: HateoasTodo[]; };
}

// HATEOAS 객체를 프론트 상에서 쓸 수 있도록 미리 변환시키는 함수를 작성해두겠습니다.
const formatTodo = (hateoasTodo: HateoasTodo): Todo => {
  const selfHref = hateoasTodo._links.self.href;
  const idAsString = selfHref.substring(selfHref.lastIndexOf('/') + 1);
  return {
    id: parseInt(idAsString, 10),
    text: hateoasTodo.text,
    completed: hateoasTodo.completed,
  }
}

export const getAllTodos = async (): Promise<Todo[]> => {
  try {
    const response = await axios.get<SpringDataRestResponse>(`${API_BASE_URL}/todos`);
    const todosFromApi = response.data._embedded?.todos || [];
    return todosFromApi.map(formatTodo);
  } catch  (error) {
    console.log("Error fetching todos: ", error);
    throw error;
  }
};

export const addTodoApi = async (text: string): Promise<Todo> => {
  try {
    const response = await axios.post<HateoasTodo>(`${API_BASE_URL}/todos`, {
      text,
      completed: false,
    });
    return formatTodo(response.data);
  } catch (error) {
    console.log("Error adding todo: ", error);
    throw error;
  }
};

export const toggleTodoApi = async (id: number, completed: boolean): Promise<Todo> => {
  try {
    const response = await axios.patch<HateoasTodo>(`${API_BASE_URL}/todos/${id}`, {completed: !completed});
    return formatTodo(response.data);
  } catch (error) {
    console.log(`Error toggling todo ${id} : `, error);
    throw error;
  }
}

export const deleteTodoApi = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/todos/${id}`);
  } catch (error) {
    console.log(`Error deleting todo ${id} : `, error);
    throw error;
  }
}
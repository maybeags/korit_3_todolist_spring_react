import type { Todo } from "../types/Todo";
import apiClient from "./apiClient";

export const getAllTodos = async (): Promise<Todo[]> => {
  try {
    const response = await apiClient.get<Todo[]>('/todos');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}

export const addTodoApi = async (text: string): Promise<Todo> => {
  try {
    const response = await apiClient.post('/todos', {text});  // 여기 수정했습니다.
    return response.data;
  } catch (error) {
    console.log("Error addTodo: ", error);
    throw error;
  }
}

export const toggleTodoApi = async (id: number): Promise<Todo> => { // 수정했습니다.
  try {
    const response = await apiClient.patch<Todo>(`/todos/${id}`);   // 수정했습니다.
    return response.data;
  } catch (error) {
    console.log(`Error toggleTodo: ${id}`, error);
    throw error;
  }
}

export const deleteTodoApi = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/todos/${id}`);
  } catch (error) {
    console.log(`Error delete: ${id}`, error);
    throw error;
  }
}
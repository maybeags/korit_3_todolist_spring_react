import type { Todo } from "../types/Todo";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

export const TodoList: React.FC<TodoListProps> = (props: TodoListProps) => {
  const { todos, onToggleComplete, onDeleteTodo } = props;
  return(
    <ul>
      { todos.length === 0 ? (
        <p> no task </p>
      ): (
        todos.map((todo) => (
          <TodoItem 
            key={todo.id}
            todo={todo} 
            onToggleComplete={onToggleComplete} 
            onDeleteTodo={onDeleteTodo}/>
        ))
      )}
    </ul>
  );
}
import type { Todo } from "../types/Todo";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = (props: TodoItemProps) => {
  const { todo, onToggleComplete, onDeleteTodo } = props;

  return (
    <li>
      <span onClick={() => onToggleComplete(todo.id)}>{todo.text}</span> 
      <button onClick={() => onDeleteTodo(todo.id)}> Delete </button>
    </li>
  );
}
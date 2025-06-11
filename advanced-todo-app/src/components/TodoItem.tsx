import type { Todo } from "../types/Todo";

interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDeleteTodo }) => {
  const itemClassName = todo.completed ? 'todo-item completed' : 'todo-item';
  
  return (
    <li className={itemClassName}>
      <div className="todo-content" onClick={() => onToggleComplete(todo.id)}>
        <span className="todo-text" >{todo.text}</span> 
        <span className="todo-author">(author: {todo.author})</span>
      </div>
      <button onClick={() => onDeleteTodo(todo.id)}>끝</button>
    </li>
  );
}
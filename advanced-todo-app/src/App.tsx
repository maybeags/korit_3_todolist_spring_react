import './App.css'
import { useEffect, useState } from 'react';
import type { Todo } from './types/Todo';
import TodoForm from "./components/TodoForm"
import {TodoList} from "./components/TodoList"
import { getAllTodos, addTodoApi, toggleTodoApi, deleteTodoApi } from './services/todoService';
import axios from 'axios';
import { GoogleLogin, type CredentialResponse} from '@react-oauth/google';

function App() {

  const [ todos, setTodos ] = useState<Todo[]>([]);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ authToken, setAuthToken ] = useState<string | null>(() => localStorage.getItem('authToken'));

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (idToken) {
      setAuthToken(idToken);
      localStorage.setItem('authToken', idToken);
    }
  }

  const handleLoginError = () => {
    console.log('로그인 실패')
  }

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setTodos([]);
  }

  // 최초 랜더링 시 useEffect
  useEffect(() => {
    const fetchTodosFromServer = async (): Promise<void> => {
      if (authToken) {
        try {
          setIsLoading(true);
          const serverTodos = await getAllTodos();
          setTodos(serverTodos);
        } catch (error) {
          console.log('서버에서 데이터를 가져오는 데 실패했습니다: ', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            handleLogout();
          }
        } finally {
          setIsLoading(false);
        }
      }
    }
    fetchTodosFromServer();
  }, [authToken]);

  const handleAddTodo = async (text: string): Promise<void> => {
    if (!authToken) return;
    try {
      setIsLoading(true);
      const newTodo = await addTodoApi(text);
      setTodos(prevTodos => [...prevTodos, newTodo]);
    } catch (error) {
      console.log(`todo를 추가하는 데 실패했습니다 : `, error);
    } finally {
      setIsLoading(false);        // 추가했습니다.
    }
  }

  const handleToggleComplete = async (id: number): Promise<void> => {
    if (!authToken) return;
    try {
      const todoToToggle = todos.find(todo => todo.id === id);
      if (!todoToToggle) return;
      const updateTodo = await toggleTodoApi(id);       // 수정했습니다.
      setTodos(prevTodos => 
        prevTodos.map(todo => (todo.id === id ? updateTodo : todo))
      );
    } catch (error) {
      console.log("완료 상태 변경에 실패했습니다 : ", error);
    }
  }

  const handleDeleteTodo = async (id: number): Promise<void> => {
    if (!authToken) return;
    try {
      await deleteTodoApi(id);
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.log('todo를 지우는데 실패했습니다 : ', error);
    }
  }

  return (
    <div className="app-container">
      <header className='app-header'>
        <h1>Todo List</h1>
        <div>
          {
            authToken ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError}>

              </GoogleLogin>
            )
          }
        </div>
      </header>
      <main className='app-main'>
        {
          authToken ? (
            isLoading ? (
              <p>목록을 불러오는 중입니다...</p>
            ) : (
              <>
                <TodoForm onAddTodo={handleAddTodo}/>
                <TodoList todos={todos} onToggleComplete={handleToggleComplete} onDeleteTodo={handleDeleteTodo}/>
              </>
            )
          ) : (
            <h2>로그인 후에 Todo List를 작성하시오</h2>
          )
        }
        <a href=""></a>
      </main>
    </div>
  )
}

export default App

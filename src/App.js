import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialForm = {
    taskName: '',
    description: '',
    status: 'To-Do',
    dueDate: new Date().toISOString().split('T')[0]
  };
  const [form, setForm] = useState(initialForm);

  // Simplified loadTasks function
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Tasks loaded successfully:', data);
      
      // Transform the data to match our frontend format
      const transformedTasks = data.map(task => ({
        id: task.id,
        taskName: task.name,
        description: task.description,
        status: task.status,
        dueDate: task.due_date
      }));
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified addTask function
  const addTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      if (!form.taskName.trim() || !form.description.trim()) {
        setError('Task name and description are required');
        return;
      }
      
      const taskData = {
        name: form.taskName.trim(),
        description: form.description.trim(),
        status: form.status,
        due_date: form.dueDate
      };
      
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
      }
      
      const newTask = await response.json();
      const transformedTask = {
        id: newTask.id,
        taskName: newTask.name,
        description: newTask.description,
        status: newTask.status,
        dueDate: newTask.due_date
      };
      
      setTasks(prevTasks => [transformedTask, ...prevTasks]);
      setForm(initialForm);
      
      // Refresh the task list to ensure we have the latest data
      loadTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.message || 'Failed to add task. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified updateStatus function
  const updateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id ? updatedTask : task
        )
      );
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Simplified deleteTask function
  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    switch(status) {
      case 'To-Do':
        return 'status-todo';
      case 'In Progress':
        return 'status-in-progress';
      case 'Completed':
        return 'status-completed';
      default:
        return 'status-todo';
    }
  };

  const getNextStatus = (currentStatus) => {
    switch(currentStatus) {
      case 'To-Do':
        return 'In Progress';
      case 'In Progress':
        return 'Completed';
      default:
        return currentStatus;
    }
  };

  return (
    <div className="App">
      <h1>Task Tracker</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={addTask} className="task-form">
        <input 
          type="text" 
          placeholder="Task Name" 
          value={form.taskName} 
          onChange={(e) => setForm({...form, taskName: e.target.value})} 
          required 
        />
        <input 
          type="text" 
          placeholder="Description" 
          value={form.description} 
          onChange={(e) => setForm({...form, description: e.target.value})} 
          required 
        />
        <select 
          value={form.status} 
          onChange={(e) => setForm({...form, status: e.target.value})}
        >
          <option value="To-Do">To-Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <input 
          type="date" 
          value={form.dueDate} 
          onChange={(e) => setForm({...form, dueDate: e.target.value})} 
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {loading && tasks.length === 0 ? (
        <div className="loading">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="no-tasks">No tasks found. Add your first task above!</div>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.status === 'Completed' ? 'completed' : ''}`}>
              <div className="task-header">
                <div className="task-title">{task.taskName}</div>
                <div className={`task-status ${getStatusClass(task.status)}`}>
                  {task.status}
                </div>
              </div>
              
              <div className="task-description">{task.description}</div>
              
              <div className="task-due-date">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
                </svg>
                Due: {formatDate(task.dueDate)}
              </div>
              
              <div className="task-actions">
                {task.status !== 'Completed' && (
                  <button 
                    className="action-btn complete-btn" 
                    onClick={() => updateStatus(task.id, getNextStatus(task.status))} 
                    disabled={loading}
                  >
                    {task.status === 'To-Do' ? 'Start Progress' : 'Mark Complete'}
                  </button>
                )}
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => deleteTask(task.id)} 
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react'
import { initDB, getAllItems, addItem, updateItem, deleteItem } from './utils/indexedDB'
import { filterTodos, sortTodos, createTodoData, updateTodoData, getStoredDarkMode, setStoredDarkMode } from './utils/helpers.jsx'
import TopNav from './components/TopNav'
import Sidebar from './components/Sidebar'
import TodoList from './components/TodoList'
import TodoForm from './components/TodoForm'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [filterBy, setFilterBy] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(getStoredDarkMode)

  useEffect(() => {
    const init = async () => {
      try {
        await initDB()
        await Promise.all([loadTodos(), loadCategories()])
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    setStoredDarkMode(darkMode)
  }, [darkMode])

  const loadTodos = async () => {
    try {
      setTodos(await getAllItems('todos'))
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  const loadCategories = async () => {
    try {
      setCategories(await getAllItems('categories'))
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleTodoAction = async (action, data) => {
    try {
      await action(data)
      await loadTodos()
      setShowForm(false)
      setEditingTodo(null)
    } catch (error) {
      console.error('Todo action failed:', error)
    }
  }

  const handleAddTodo = (todoData) => {
    console.log('handleAddTodo received:', todoData)
    handleTodoAction(
      () => addItem('todos', createTodoData(todoData))
    )
  }

  const handleUpdateTodo = (todoId, updatedData) => handleTodoAction(
    () => updateItem('todos', updateTodoData(todoId, updatedData))
  )

  const handleDeleteTodo = async (todoId) => {
    if (window.confirm('Are you sure you want to delete this todo? This action cannot be undone.')) {
      try {
        await deleteItem('todos', todoId)
        await loadTodos()
      } catch (error) {
        console.error('Failed to delete todo:', error)
      }
    }
  }

  const handleDuplicateTodo = (todo) => handleTodoAction(
    () => addItem('todos', createTodoData({
      ...todo,
      title: `${todo.title} (Copy)`
    }))
  )

  const handleToggleComplete = async (todoId) => {
    const todo = todos.find(t => t.id === todoId)
    if (todo) {
      await handleUpdateTodo(todoId, { ...todo, completed: !todo.completed })
    }
  }

  const availableTags = [...new Set(todos.flatMap(todo => todo.tags || []))]

  const filteredAndSortedTodos = sortTodos(
    filterTodos(todos, { selectedCategory, filterBy, selectedTags, searchQuery }),
    sortBy
  )

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <TopNav 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterBy={filterBy}
        setFilterBy={setFilterBy}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onAddNew={() => setShowForm(true)}
      />
      
      <div className="main-content">
        <Sidebar 
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onCategoryChange={loadCategories}
        />
        
        <div className="content-area">
          {showForm && (
            <TodoForm 
              categories={categories}
              editingTodo={editingTodo}
              onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
              onCancel={() => {
                setShowForm(false)
                setEditingTodo(null)
              }}
            />
          )}
          
          <TodoList 
            todos={filteredAndSortedTodos}
            categories={categories}
            onToggleComplete={handleToggleComplete}
            onEdit={(todo) => {
              setEditingTodo(todo)
              setShowForm(true)
            }}
            onDelete={handleDeleteTodo}
            onDuplicate={handleDuplicateTodo}
            onRefresh={loadTodos}
          />
        </div>
      </div>
    </div>
  )
}

export default App

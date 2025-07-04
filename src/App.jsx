import { useState, useEffect } from 'react'
import { initDB, getAllItems, addItem, updateItem, deleteItem, createVersion } from './utils/indexedDB'
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
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB()
        // Load initial data
        loadTodos()
        loadCategories()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const loadTodos = async () => {
    try {
      const todosData = await getAllItems('todos')
      setTodos(todosData)
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const categoriesData = await getAllItems('categories')
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = {
        ...todoData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false
      }
      
      const todoId = await addItem('todos', newTodo)
      await createVersion(todoId, newTodo)
      
      await loadTodos()
      setShowForm(false)
      setEditingTodo(null)
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const handleUpdateTodo = async (todoId, updatedData) => {
    try {
      const updatedTodo = {
        ...updatedData,
        id: todoId,
        updatedAt: new Date().toISOString()
      }
      
      await updateItem('todos', updatedTodo)
      await createVersion(todoId, updatedTodo)
      
      await loadTodos()
      setShowForm(false)
      setEditingTodo(null)
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

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

  const handleDuplicateTodo = async (todo) => {
    try {
      const duplicatedTodo = {
        title: `${todo.title} (Copy)`,
        content: todo.content || '',
        type: todo.type || 'memo',
        categoryId: todo.categoryId || null,
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate || '',
        checklistItems: todo.checklistItems || [],
        listItems: todo.listItems || [],
        tags: todo.tags || [],
        customColor: todo.customColor || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completed: false
      }
      
      const todoId = await addItem('todos', duplicatedTodo)
      await createVersion(todoId, duplicatedTodo)
      
      await loadTodos()
    } catch (error) {
      console.error('Failed to duplicate todo:', error)
    }
  }

  const handleToggleComplete = async (todoId) => {
    const todo = todos.find(t => t.id === todoId)
    if (todo) {
      await handleUpdateTodo(todoId, { ...todo, completed: !todo.completed })
    }
  }

  // Get all available tags from todos
  const availableTags = [...new Set(todos.flatMap(todo => todo.tags || []))]

  const filteredAndSortedTodos = todos
    .filter(todo => {
      // Filter by category
      if (selectedCategory && todo.categoryId !== selectedCategory) return false
      
      // Filter by completion status
      if (filterBy === 'completed' && !todo.completed) return false
      if (filterBy === 'pending' && todo.completed) return false
      
      // Filter by tags
      if (selectedTags.length > 0) {
        const todoTags = todo.tags || []
        if (!selectedTags.some(tag => todoTags.includes(tag))) return false
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          todo.title?.toLowerCase().includes(query) ||
          todo.content?.toLowerCase().includes(query)
        )
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'dueDate':
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'title':
          return (a.title || '').localeCompare(b.title || '')
        case 'createdAt':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

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

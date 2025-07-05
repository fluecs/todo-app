import { format } from 'date-fns'
import { FileText, List, CheckSquare } from 'lucide-react'

// Date formatting utilities
export const formatDate = (dateString) => {
  if (!dateString?.trim()) return null
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : format(date, 'MMM dd, yyyy')
  } catch {
    return null
  }
}

export const isOverdue = (date) => {
  return date && new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString()
}

// Priority utilities
export const getPriorityColor = (priority) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' }
  return colors[priority] || '#6b7280'
}

// Type utilities
export const getTypeIcon = (type) => {
  const icons = {
    memo: <FileText size={16} />,
    list: <List size={16} />,
    checklist: <CheckSquare size={16} />
  }
  return icons[type] || <FileText size={16} />
}

export const getTypeIconLarge = (type) => {
  const icons = {
    memo: <FileText size={20} />,
    list: <List size={20} />,
    checklist: <CheckSquare size={20} />
  }
  return icons[type] || <FileText size={20} />
}

// Category utilities
export const getCategoryName = (categories, categoryId) => {
  return categories.find(c => c.id === categoryId)?.name
}

// Search utilities
export const searchInTodo = (todo, query) => {
  const searchFields = [
    todo.title,
    todo.content,
    ...(todo.tags || []),
    ...(todo.listItems || []),
    ...(todo.checklistItems || []).map(item => item.text)
  ]
  return searchFields.some(field => 
    field?.toLowerCase().includes(query)
  )
}

// Sorting utilities
export const sortTodos = (todos, sortBy) => {
  const sorters = {
    priority: () => todos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }),
    dueDate: () => todos.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    }),
    title: () => todos.sort((a, b) => (a.title || '').localeCompare(b.title || '')),
    createdAt: () => todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return sorters[sortBy]?.() || sorters.createdAt()
}

// Filtering utilities
export const filterTodos = (todos, { selectedCategory, filterBy, selectedTags, searchQuery }) => {
  return todos.filter(todo => {
    if (selectedCategory && todo.categoryId !== selectedCategory) return false
    if (filterBy === 'completed' && !todo.completed) return false
    if (filterBy === 'pending' && todo.completed) return false
    if (selectedTags.length > 0 && !selectedTags.some(tag => (todo.tags || []).includes(tag))) return false
    if (searchQuery && !searchInTodo(todo, searchQuery.toLowerCase())) return false
    return true
  })
}

// Form utilities
export const createTodoData = (formData) => ({
  ...formData,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completed: false
})

export const updateTodoData = (todoId, updatedData) => ({
  ...updatedData,
  id: todoId,
  updatedAt: new Date().toISOString()
})

// Validation utilities
export const validateTodo = (todo) => {
  return todo.title && todo.title.trim().length > 0
}

// Storage utilities
export const getStoredDarkMode = () => {
  try {
    return JSON.parse(localStorage.getItem('darkMode') || 'false')
  } catch {
    return false
  }
}

export const setStoredDarkMode = (darkMode) => {
  localStorage.setItem('darkMode', JSON.stringify(darkMode))
} 
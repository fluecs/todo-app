import { useState, useEffect } from 'react'
import { X, CheckCircle, Circle, Calendar, Tag, AlertTriangle, Clock, GitBranch, FileText, List, CheckSquare, RotateCcw, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { getVersions, restoreVersion, updateItem, createVersion } from '../utils/indexedDB'
import VersionHistory from './VersionHistory'

const formatDate = (dateString) => {
  if (!dateString || !dateString.trim()) return null
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return format(date, 'MMM dd, yyyy')
  } catch (error) {
    console.error('Invalid date:', dateString)
    return null
  }
}

const formatDateTime = (dateString) => {
  if (!dateString || !dateString.trim()) return null
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return null
    return format(date, 'MMM dd, yyyy HH:mm')
  } catch (error) {
    console.error('Invalid date:', dateString)
    return null
  }
}

const TodoDetailView = ({ todo, categories, onClose, onToggleComplete, onRefresh }) => {
  const [versions, setVersions] = useState([])
  const [showVersions, setShowVersions] = useState(false)
  const [checklistItems, setChecklistItems] = useState(todo.checklistItems || [])
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false)
  const [currentTodo, setCurrentTodo] = useState(todo)

  useEffect(() => {
    setChecklistItems(todo.checklistItems || [])
    setCurrentTodo(todo)
  }, [todo])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPriorityDropdown && !event.target.closest('.priority-selector')) {
        setShowPriorityDropdown(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showPriorityDropdown, onClose])

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : null
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'memo': return <FileText size={20} />
      case 'list': return <List size={20} />
      case 'checklist': return <CheckSquare size={20} />
      default: return <FileText size={20} />
    }
  }

  const isOverdue = (date) => {
    if (!date || !date.trim()) return false
    const dueDate = new Date(date)
    const today = new Date()
    return dueDate < today && dueDate.toDateString() !== today.toDateString()
  }

  const handleChecklistToggle = async (index) => {
    const updatedItems = checklistItems.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    )
    setChecklistItems(updatedItems)
    
    // Update the todo with new checklist state
    const updatedTodo = {
      ...currentTodo,
      checklistItems: updatedItems,
      updatedAt: new Date().toISOString()
    }
    
    try {
      await updateItem('todos', updatedTodo)
      await createVersion(currentTodo.id, updatedTodo)
      setCurrentTodo(updatedTodo)
      onRefresh() // Refresh the parent component
    } catch (error) {
      console.error('Failed to update checklist:', error)
    }
  }

  const handleShowVersions = async () => {
    try {
      const todoVersions = await getVersions(todo.id)
      setVersions(todoVersions)
      setShowVersions(true)
    } catch (error) {
      console.error('Failed to load versions:', error)
    }
  }

  const handleRestoreVersion = async (versionId) => {
    if (window.confirm('Are you sure you want to restore this version? This will overwrite the current version.')) {
      try {
        await restoreVersion(currentTodo.id, versionId)
        setShowVersions(false)
        onRefresh() // Refresh the parent component
      } catch (error) {
        console.error('Failed to restore version:', error)
      }
    }
  }

  const handlePriorityChange = async (newPriority) => {
    try {
      const updatedTodo = {
        ...currentTodo,
        priority: newPriority,
        updatedAt: new Date().toISOString()
      }
      
      await updateItem('todos', updatedTodo)
      await createVersion(currentTodo.id, updatedTodo)
      setCurrentTodo(updatedTodo)
      setShowPriorityDropdown(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to update priority:', error)
    }
  }

  return (
    <div className="todo-detail-overlay">
      <button onClick={onClose} className="modal-close-btn">
        <X size={24} />
      </button>
      <div className="todo-detail">
        <div className="detail-header">
          <div className="detail-title">
            {getTypeIcon(currentTodo.type)}
            <h2>{currentTodo.title}</h2>
          </div>
        </div>

        <div className="detail-meta">
          <div className="meta-row">
            <span className="todo-type">{currentTodo.type}</span>
            {currentTodo.categoryId && (
              <>
                <span className="separator">•</span>
                <span className="category">{getCategoryName(currentTodo.categoryId)}</span>
              </>
            )}
            {currentTodo.dueDate && formatDate(currentTodo.dueDate) && (
              <>
                <span className="separator">•</span>
                <span className={`due-date ${isOverdue(currentTodo.dueDate) ? 'overdue' : ''}`}>
                  <Calendar size={14} />
                  {formatDate(currentTodo.dueDate)}
                </span>
              </>
            )}
          </div>
          
          <div className="meta-row">
            <div className="priority-selector">
              <button
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className="priority-dropdown-btn"
                style={{ backgroundColor: getPriorityColor(currentTodo.priority) }}
              >
                {currentTodo.priority}
                <ChevronDown size={14} />
              </button>
              {showPriorityDropdown && (
                <div className="priority-dropdown">
                  <button
                    onClick={() => handlePriorityChange('low')}
                    className={`priority-option ${currentTodo.priority === 'low' ? 'active' : ''}`}
                  >
                    Low
                  </button>
                  <button
                    onClick={() => handlePriorityChange('medium')}
                    className={`priority-option ${currentTodo.priority === 'medium' ? 'active' : ''}`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handlePriorityChange('high')}
                    className={`priority-option ${currentTodo.priority === 'high' ? 'active' : ''}`}
                  >
                    High
                  </button>
                </div>
              )}
            </div>
            <span className="created-date">
              <Clock size={12} />
              Created {formatDate(currentTodo.createdAt) || 'Unknown date'}
            </span>
          </div>
        </div>

        {currentTodo.content && (
          <div className="detail-content">
            <h3>Content</h3>
            <p>{currentTodo.content}</p>
          </div>
        )}

        {currentTodo.type === 'list' && currentTodo.listItems && currentTodo.listItems.length > 0 && (
          <div className="detail-list">
            <h3>List Items</h3>
            <div className="list-items">
              {currentTodo.listItems.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="list-bullet">•</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTodo.type === 'checklist' && checklistItems && checklistItems.length > 0 && (
          <div className="detail-checklist">
            <h3>Checklist ({checklistItems.filter(item => item.completed).length} of {checklistItems.length} completed)</h3>
            <div className="checklist-items">
              {checklistItems.map((item, index) => (
                <div 
                  key={index} 
                  className={`checklist-item ${item.completed ? 'completed' : ''}`}
                  onClick={() => handleChecklistToggle(index)}
                >
                  <div className="checklist-toggle">
                    {item.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                  </div>
                  <span className={item.completed ? 'completed' : ''}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTodo.tags && currentTodo.tags.length > 0 && (
          <div className="detail-tags">
            <h3>Tags</h3>
            <div className="tags-list">
              {currentTodo.tags.map(tag => (
                <span key={tag} className="tag">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}



        {showVersions && (
          <VersionHistory
            versions={versions}
            onRestore={handleRestoreVersion}
            onClose={() => setShowVersions(false)}
            currentTodo={currentTodo}
          />
        )}
      </div>
    </div>
  )
}

export default TodoDetailView 
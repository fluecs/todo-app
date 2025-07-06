import { useState, useEffect } from 'react'
import { X, CheckCircle, Circle, Calendar, Tag, AlertTriangle, Clock, FileText, List, CheckSquare, ChevronDown } from 'lucide-react'
import { updateItem } from '../utils/indexedDB'
import { formatDate, isOverdue, getPriorityColor, getTypeIconLarge, getCategoryName } from '../utils/helpers.jsx'

const TodoDetailView = ({ todo, categories, onClose, onToggleComplete, onRefresh }) => {
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
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showPriorityDropdown, onClose])

  const updateTodo = async (updates) => {
    try {
      const updatedTodo = { ...currentTodo, ...updates, updatedAt: new Date().toISOString() }
      await updateItem('todos', updatedTodo)
      setCurrentTodo(updatedTodo)
      onRefresh()
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  const handleChecklistToggle = async (index) => {
    const updatedItems = checklistItems.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    )
    setChecklistItems(updatedItems)
    await updateTodo({ checklistItems: updatedItems })
  }

  const handlePriorityChange = async (newPriority) => {
    await updateTodo({ priority: newPriority })
    setShowPriorityDropdown(false)
  }

  const PriorityDropdown = () => (
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
          {['low', 'medium', 'high'].map(priority => (
            <button
              key={priority}
              onClick={() => handlePriorityChange(priority)}
              className={`priority-option ${currentTodo.priority === priority ? 'active' : ''}`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const DetailSection = ({ title, children }) => children && (
    <div className={`detail-${title.toLowerCase().replace(' ', '')}`}>
      <h3>{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="modal-overlay">
      <button onClick={onClose} className="modal-close-btn">
        <X size={24} />
      </button>
      <div className="modal modal-large">
        <div className="detail-header">
          <div className="detail-title">
            {getTypeIconLarge(currentTodo.type)}
            <h2>{currentTodo.title}</h2>
          </div>
        </div>

        <div className="detail-meta">
          <div className="meta-row">
            <span className="todo-type">{currentTodo.type}</span>
            {currentTodo.categoryId && (
              <>
                <span className="separator">•</span>
                <span className="category">{getCategoryName(categories, currentTodo.categoryId)}</span>
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
            <PriorityDropdown />
            <span className="created-date">
              <Clock size={12} />
              Created {formatDate(currentTodo.createdAt) || 'Unknown date'}
            </span>
          </div>
        </div>

        {/* Show content for memo type, or when content exists for other types */}
        {(currentTodo.type === 'memo' || currentTodo.content) && (
          <DetailSection title="Content">
            <p>{currentTodo.content}</p>
          </DetailSection>
        )}

        {/* Show list items only for list type */}
        {currentTodo.type === 'list' && currentTodo.listItems?.length > 0 && (
          <DetailSection title="List Items">
            <div className="list-items">
              {currentTodo.listItems.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="list-bullet">•</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {/* Show checklist only for checklist type */}
        {currentTodo.type === 'checklist' && checklistItems.length > 0 && (
          <DetailSection title={`Checklist (${checklistItems.filter(item => item.completed).length} of ${checklistItems.length} completed)`}>
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
          </DetailSection>
        )}

        <DetailSection title="Tags">
          <div className="tags-list">
            {currentTodo.tags?.map(tag => (
              <span key={tag} className="tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        </DetailSection>
      </div>
    </div>
  )
}

export default TodoDetailView 
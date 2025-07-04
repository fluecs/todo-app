import { useState } from 'react'
import { 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Clock,
  GitBranch,
  FileText,
  List,
  CheckSquare,
  Eye,
  Copy
} from 'lucide-react'
import { format } from 'date-fns'
import { getVersions, restoreVersion } from '../utils/indexedDB'
import VersionHistory from './VersionHistory'
import TodoDetailView from './TodoDetailView'

const TodoList = ({ todos, categories, onToggleComplete, onEdit, onDelete, onDuplicate, onRefresh }) => {
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState([])
  const [detailTodo, setDetailTodo] = useState(null)

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

  const getPriorityBackgroundColor = (priority) => {
    switch (priority) {
      case 'high': return '#fef2f2'
      case 'medium': return '#fffbeb'
      case 'low': return '#f0fdf4'
      default: return '#f8fafc'
    }
  }

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'high': return '#fecaca'
      case 'medium': return '#fed7aa'
      case 'low': return '#bbf7d0'
      default: return '#e2e8f0'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'memo': return <FileText size={16} />
      case 'list': return <List size={16} />
      case 'checklist': return <CheckSquare size={16} />
      default: return <FileText size={16} />
    }
  }

  const isOverdue = (date) => {
    if (!date || !date.trim()) return false
    const dueDate = new Date(date)
    const today = new Date()
    return dueDate < today && dueDate.toDateString() !== today.toDateString()
  }

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

  const handleShowVersions = async (todo) => {
    try {
      const todoVersions = await getVersions(todo.id)
      setVersions(todoVersions)
      setSelectedTodo(todo)
      setShowVersions(true)
    } catch (error) {
      console.error('Failed to load versions:', error)
    }
  }

  const handleRestoreVersion = async (versionId) => {
    try {
      await restoreVersion(selectedTodo.id, versionId)
      setShowVersions(false)
      setSelectedTodo(null)
      onRefresh()
    } catch (error) {
      console.error('Failed to restore version:', error)
    }
  }

  const handleDetailView = (todo) => {
    setDetailTodo(todo)
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={48} />
        <h3>No todos yet</h3>
        <p>Create your first todo to get started!</p>
      </div>
    )
  }

  return (
    <div className="todo-list">
      {todos.map(todo => (
        <div 
          key={todo.id} 
          className={`todo-item ${todo.completed ? 'completed' : ''}`}
          style={{
            backgroundColor: todo.customColor || undefined,
            borderColor: todo.customColor ? `${todo.customColor}40` : undefined
          }}
          onClick={() => handleDetailView(todo)}
        >
          <div className="todo-header">
            <div className="todo-main">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleComplete(todo.id)
                }}
                className="complete-btn"
              >
                {todo.completed ? (
                  <CheckCircle size={20} className="completed-icon" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              
              <div className="todo-info">
                <h3 className={`todo-title ${todo.completed ? 'completed' : ''}`}>
                  {todo.title}
                </h3>
                <div className="todo-meta">
                  {getTypeIcon(todo.type)}
                  <span className="todo-type">{todo.type}</span>
                  
                  {todo.categoryId && (
                    <>
                      <span className="separator">•</span>
                      <span className="category">{getCategoryName(todo.categoryId)}</span>
                    </>
                  )}
                  
                  {todo.dueDate && formatDate(todo.dueDate) && (
                    <>
                      <span className="separator">•</span>
                      <span className={`due-date ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}>
                        <Calendar size={14} />
                        {formatDate(todo.dueDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="todo-actions">
              <div className="priority-badge" style={{ backgroundColor: getPriorityColor(todo.priority) }}>
                {todo.priority}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDetailView(todo)
                }}
                className="view-btn list-btn"
                title="View Details"
              >
                <Eye size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowVersions(todo)
                }}
                className="version-btn list-btn"
                title="Version History"
              >
                <GitBranch size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(todo)
                }}
                className="edit-btn list-btn"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate(todo)
                }}
                className="duplicate-btn list-btn"
                title="Duplicate"
              >
                <Copy size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(todo.id)
                }}
                className="delete-btn list-btn"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          
          {todo.content && (
            <div className="todo-content">
              <p>{todo.content}</p>
            </div>
          )}
          
          {todo.type === 'checklist' && todo.checklistItems && todo.checklistItems.length > 0 && (
            <div className="checklist-preview">
              <div className="checklist-progress">
                {todo.checklistItems.filter(item => item.completed).length} of {todo.checklistItems.length} completed
              </div>
              <div className="checklist-items">
                {todo.checklistItems.slice(0, 3).map((item, index) => (
                  <div key={index} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                    {item.completed ? <CheckCircle size={14} /> : <Circle size={14} />}
                    <span>{item.text}</span>
                  </div>
                ))}
                {todo.checklistItems.length > 3 && (
                  <div className="more-items">
                    +{todo.checklistItems.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {todo.type === 'list' && todo.listItems && todo.listItems.length > 0 && (
            <div className="list-preview">
              <div className="list-items">
                {todo.listItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="list-item">
                    <div className="list-bullet">•</div>
                    <span>{item}</span>
                  </div>
                ))}
                {todo.listItems.length > 3 && (
                  <div className="more-items">
                    +{todo.listItems.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          )}
          
          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.map(tag => (
                <span key={tag} className="tag">
                  <Tag size={12} />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="todo-footer">
            <span className="created-date">
              <Clock size={12} />
              Created {formatDate(todo.createdAt) || 'Unknown date'}
            </span>
          </div>
        </div>
      ))}
      
      {showVersions && selectedTodo && (
        <VersionHistory
          versions={versions}
          onRestore={handleRestoreVersion}
          onClose={() => {
            setShowVersions(false)
            setSelectedTodo(null)
          }}
          currentTodo={selectedTodo}
        />
      )}

      {detailTodo && (
        <TodoDetailView
          todo={detailTodo}
          categories={categories}
          onClose={() => setDetailTodo(null)}
          onToggleComplete={onToggleComplete}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}

export default TodoList 
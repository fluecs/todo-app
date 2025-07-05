import { useState } from 'react'
import { 
  CheckCircle, 
  Circle, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Clock,
  FileText,
  List,
  CheckSquare,
  Eye,
  Copy
} from 'lucide-react'
import { formatDate, isOverdue, getPriorityColor, getTypeIcon, getCategoryName } from '../utils/helpers'
import TodoDetailView from './TodoDetailView'

const TodoList = ({ todos, categories, onToggleComplete, onEdit, onDelete, onDuplicate, onRefresh }) => {
  const [detailTodo, setDetailTodo] = useState(null)

  const ActionButton = ({ icon: Icon, onClick, title, className }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={className}
      title={title}
    >
      <Icon size={16} />
    </button>
  )

  const ItemPreview = ({ items, type, maxItems = 3 }) => {
    if (!items?.length) return null
    
    const previewItems = items.slice(0, maxItems)
    const remaining = items.length - maxItems
    
    return (
      <div className={`${type}-preview`}>
        {type === 'checklist' && (
          <div className="checklist-progress">
            {items.filter(item => item.completed).length} of {items.length} completed
          </div>
        )}
        <div className={`${type}-items`}>
          {previewItems.map((item, index) => (
            <div key={index} className={`${type}-item ${item.completed ? 'completed' : ''}`}>
              {type === 'checklist' ? (
                <>
                  {item.completed ? <CheckCircle size={14} /> : <Circle size={14} />}
                  <span>{item.text}</span>
                </>
              ) : (
                <>
                  <div className="list-bullet">•</div>
                  <span>{item}</span>
                </>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <div className="more-items">+{remaining} more items</div>
          )}
        </div>
      </div>
    )
  }

  if (!todos.length) {
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
          onClick={() => setDetailTodo(todo)}
        >
          <div className="todo-header">
            <div className="todo-main">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleComplete(todo.id) }}
                className="complete-btn"
              >
                {todo.completed ? <CheckCircle size={20} className="completed-icon" /> : <Circle size={20} />}
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
                      <span className="category">{getCategoryName(categories, todo.categoryId)}</span>
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
              
              <ActionButton icon={Eye} onClick={() => setDetailTodo(todo)} title="View Details" className="view-btn list-btn" />
              <ActionButton icon={Edit} onClick={() => onEdit(todo)} title="Edit" className="edit-btn list-btn" />
              <ActionButton icon={Copy} onClick={() => onDuplicate(todo)} title="Duplicate" className="duplicate-btn list-btn" />
              <ActionButton icon={Trash2} onClick={() => onDelete(todo.id)} title="Delete" className="delete-btn list-btn" />
            </div>
          </div>
          
          {todo.content && (
            <div className="todo-content">
              <p>{todo.content}</p>
            </div>
          )}
          
          <ItemPreview items={todo.checklistItems} type="checklist" />
          <ItemPreview items={todo.listItems} type="list" />
          
          {todo.tags?.length > 0 && (
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
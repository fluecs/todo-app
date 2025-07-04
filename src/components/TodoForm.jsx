import { useState, useEffect } from 'react'
import { X, Calendar, Tag, AlertTriangle, CheckSquare, List, FileText, Palette } from 'lucide-react'
import { format } from 'date-fns'

const TodoForm = ({ categories, editingTodo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'memo',
    categoryId: null,
    priority: 'medium',
    dueDate: '',
    checklistItems: [],
    listItems: [],
    tags: [],
    customColor: null
  })
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [newListItem, setNewListItem] = useState('')
  const [newTag, setNewTag] = useState('')
  const [expandedChecklist, setExpandedChecklist] = useState(false)
  const [expandedList, setExpandedList] = useState(false)

  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title || '',
        content: editingTodo.content || '',
        type: editingTodo.type || 'memo',
        categoryId: editingTodo.categoryId || null,
        priority: editingTodo.priority || 'medium',
        dueDate: editingTodo.dueDate ? format(new Date(editingTodo.dueDate), 'yyyy-MM-dd') : '',
        checklistItems: editingTodo.checklistItems || [],
        listItems: editingTodo.listItems || [],
        tags: editingTodo.tags || [],
        customColor: editingTodo.customColor || null
      })
    }
  }, [editingTodo])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim()
    }

    if (editingTodo) {
      onSubmit(editingTodo.id, submitData)
    } else {
      onSubmit(submitData)
    }
  }

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklistItems: [...prev.checklistItems, { text: newChecklistItem.trim(), completed: false }]
      }))
      setNewChecklistItem('')
    }
  }

  const addListItem = () => {
    if (newListItem.trim()) {
      setFormData(prev => ({
        ...prev,
        listItems: [...prev.listItems, newListItem.trim()]
      }))
      setNewListItem('')
    }
  }

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index)
    }))
  }

  const removeListItem = (index) => {
    setFormData(prev => ({
      ...prev,
      listItems: prev.listItems.filter((_, i) => i !== index)
    }))
  }

  const toggleChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : 'Select Category'
  }

  return (
    <div className="todo-form-overlay">
      <button onClick={onCancel} className="modal-close-btn">
        <X size={24} />
      </button>
      <div className="todo-form">
        <div className="form-header">
          <h2>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div className="type-selector">
              <button
                type="button"
                className={`type-btn ${formData.type === 'memo' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'memo' }))}
              >
                <FileText size={16} />
                Memo
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'list' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'list' }))}
              >
                <List size={16} />
                List
              </button>
              <button
                type="button"
                className={`type-btn ${formData.type === 'checklist' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'checklist' }))}
              >
                <CheckSquare size={16} />
                Checklist
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter title..."
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter content..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  categoryId: e.target.value ? parseInt(e.target.value) : null 
                }))}
              >
                <option value="">No Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Custom Color</label>
            <div className="color-picker">
              <input
                type="color"
                value={formData.customColor || '#ffffff'}
                onChange={(e) => setFormData(prev => ({ ...prev, customColor: e.target.value }))}
                className="color-input"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, customColor: null }))}
                className="clear-color-btn"
              >
                Clear
              </button>
            </div>
          </div>

          {formData.type === 'list' && (
            <div className="form-group">
              <label>List Items</label>
              <div className="list-items">
                {formData.listItems.slice(0, expandedList ? undefined : 3).map((item, index) => (
                  <div key={index} className="list-item">
                    <div className="list-bullet">•</div>
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeListItem(index)}
                      className="remove-item-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.listItems.length > 3 && (
                  <button
                    type="button"
                    className="expand-btn"
                    onClick={() => setExpandedList(!expandedList)}
                  >
                    {expandedList ? 'Show less' : `+${formData.listItems.length - 3} more items`}
                  </button>
                )}
                <div className="add-list-item">
                  <input
                    type="text"
                    value={newListItem}
                    onChange={(e) => setNewListItem(e.target.value)}
                    placeholder="Add list item..."
                    onKeyPress={(e) => e.key === 'Enter' && addListItem()}
                  />
                  <button type="button" onClick={addListItem}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'checklist' && (
            <div className="form-group">
              <label>Checklist Items</label>
              <div className="checklist-items">
                {formData.checklistItems.slice(0, expandedChecklist ? undefined : 3).map((item, index) => (
                  <div key={index} className="checklist-item">
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(index)}
                      />
                    </div>
                    <span className={item.completed ? 'completed' : ''}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="remove-item-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {formData.checklistItems.length > 3 && (
                  <button
                    type="button"
                    className="expand-btn"
                    onClick={() => setExpandedChecklist(!expandedChecklist)}
                  >
                    {expandedChecklist ? 'Show less' : `+${formData.checklistItems.length - 3} more items`}
                  </button>
                )}
                <div className="add-checklist-item">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    placeholder="Add checklist item..."
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                  />
                  <button type="button" onClick={addChecklistItem}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-container">
              {formData.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="remove-tag-btn"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className="add-tag">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <button type="button" onClick={addTag}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              {editingTodo ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TodoForm 
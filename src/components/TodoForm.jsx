import React, { useState, useEffect, memo, useCallback } from 'react'
import { X, Calendar, Tag, AlertTriangle, CheckSquare, List, FileText, Palette } from 'lucide-react'
import { format } from 'date-fns'

const ItemList = React.memo(function ItemList({ items, type, maxItems = 3, inputValue, setInputValue, addItem, removeItem, toggleChecklistItem, expanded, setExpanded }) {
  const displayItems = items?.length ? items.slice(0, expanded[type] ? undefined : maxItems) : []
  const remaining = items?.length ? items.length - maxItems : 0
  return (
    <div className={`${type}-items`}>
      {displayItems.map((item, index) => (
        <div key={index} className={`${type}-item`}>
          {type === 'checklist' ? (
            <>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleChecklistItem(index)}
                />
              </div>
              <span className={item.completed ? 'completed' : ''}>{item.text}</span>
            </>
          ) : (
            <>
              <div className="list-bullet">•</div>
              <span>{item}</span>
            </>
          )}
          <button
            type="button"
            onClick={() => removeItem(type, index)}
            className="remove-item-btn"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {remaining > 0 && (
        <button
          type="button"
          className="expand-btn"
          onClick={() => setExpanded(prev => ({ ...prev, [type]: !prev[type] }))}
        >
          {expanded[type] ? 'Show less' : `+${remaining} more items`}
        </button>
      )}
      <div className={`add-${type}-item`}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Add ${type} item...`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem(type, inputValue);
              setInputValue('');
            }
          }}
          autoComplete="off"
        />
        <button type="button" onClick={() => { addItem(type, inputValue); setInputValue(''); }}>Add</button>
      </div>
    </div>
  )
})

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
    tags: []
  })
  const [expanded, setExpanded] = useState({ checklist: false, list: false })
  const [tagInput, setTagInput] = useState('')
  const [itemInputs, setItemInputs] = useState({ list: '', checklist: '' })

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
        tags: editingTodo.tags || []
      })
    }
  }, [editingTodo])

  const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    const submitData = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim()
    }
    console.log('Submitting todo:', submitData)
    if (editingTodo) {
      onSubmit(editingTodo.id, submitData)
    } else {
      onSubmit(submitData)
    }
  }

  const addItem = useCallback((type, value) => {
    if (!value.trim()) return
    const updates = {
      checklist: { checklistItems: [...formData.checklistItems, { text: value.trim(), completed: false }] },
      list: { listItems: [...formData.listItems, value.trim()] },
      tag: { tags: formData.tags.includes(value.trim()) ? formData.tags : [...formData.tags, value.trim()] }
    }
    setFormData(prev => ({ ...prev, ...updates[type] }))
    setItemInputs(prev => ({ ...prev, [type]: '' }))
  }, [formData])

  const removeItem = useCallback((type, index) => {
    const updates = {
      checklist: { checklistItems: formData.checklistItems.filter((_, i) => i !== index) },
      list: { listItems: formData.listItems.filter((_, i) => i !== index) },
      tag: { tags: formData.tags.filter((_, i) => i !== index) }
    }
    setFormData(prev => ({ ...prev, ...updates[type] }))
  }, [formData])

  const toggleChecklistItem = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item, i) => 
        i === index ? { ...item, completed: !item.completed } : item
      )
    }))
  }, [])

  const TypeButton = ({ type, icon: Icon, label }) => (
    <button
      type="button"
      className={`type-btn ${formData.type === type ? 'active' : ''}`}
      onClick={() => updateForm('type', type)}
    >
      <Icon size={16} />
      {label}
    </button>
  )

  return (
    <div className="modal-overlay">
      <button onClick={onCancel} className="modal-close-btn">
        <X size={24} />
      </button>
      <div className="modal">
        <div className="modal-header">
          <h2>{editingTodo ? 'Edit Todo' : 'Add New Todo'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <div className="type-selector">
              <TypeButton type="memo" icon={FileText} label="Memo" />
              <TypeButton type="list" icon={List} label="List" />
              <TypeButton type="checklist" icon={CheckSquare} label="Checklist" />
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateForm('title', e.target.value)}
              placeholder="Enter title..."
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => updateForm('content', e.target.value)}
              placeholder="Enter content..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => updateForm('categoryId', e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">No Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => updateForm('priority', e.target.value)}
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
              onChange={(e) => updateForm('dueDate', e.target.value)}
            />
          </div>

          {formData.type === 'list' && (
            <div className="form-group">
              <label>List Items</label>
              <ItemList
                items={formData.listItems}
                type="list"
                inputValue={itemInputs.list}
                setInputValue={val => setItemInputs(prev => ({ ...prev, list: val }))}
                addItem={addItem}
                removeItem={removeItem}
                toggleChecklistItem={toggleChecklistItem}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            </div>
          )}

          {formData.type === 'checklist' && (
            <div className="form-group">
              <label>Checklist Items</label>
              <ItemList
                items={formData.checklistItems}
                type="checklist"
                inputValue={itemInputs.checklist}
                setInputValue={val => setItemInputs(prev => ({ ...prev, checklist: val }))}
                addItem={addItem}
                removeItem={removeItem}
                toggleChecklistItem={toggleChecklistItem}
                expanded={expanded}
                setExpanded={setExpanded}
              />
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
                    onClick={() => removeItem('tag', formData.tags.indexOf(tag))}
                    className="remove-tag-btn"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <div className="add-tag">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addItem('tag', tagInput);
                      setTagInput('');
                    }
                  }}
                />
                <button type="button" onClick={() => { addItem('tag', tagInput); setTagInput(''); }}>Add</button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">
              {editingTodo ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TodoForm 
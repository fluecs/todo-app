import { useState } from 'react'
import { Folder, Plus, Trash2, Edit } from 'lucide-react'
import { addItem, deleteItem, updateItem } from '../utils/indexedDB'

const Sidebar = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  onCategoryChange 
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editCategoryName, setEditCategoryName] = useState('')

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      await addItem('categories', {
        name: newCategoryName.trim(),
        createdAt: new Date().toISOString()
      })
      
      setNewCategoryName('')
      setShowAddForm(false)
      onCategoryChange()
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    if (!editCategoryName.trim() || !editingCategory) return

    try {
      await updateItem('categories', {
        ...editingCategory,
        name: editCategoryName.trim()
      })
      
      setEditCategoryName('')
      setEditingCategory(null)
      onCategoryChange()
    } catch (error) {
      console.error('Failed to update category:', error)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteItem('categories', categoryId)
        if (selectedCategory === categoryId) {
          setSelectedCategory(null)
        }
        onCategoryChange()
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  const startEditCategory = (category) => {
    setEditingCategory(category)
    setEditCategoryName(category.name)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Categories</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="add-category-btn"
        >
          <Plus size={16} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCategory} className="category-form">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="category-input"
            autoFocus
          />
          <div className="form-buttons">
            <button type="submit" className="save-btn">Save</button>
            <button 
              type="button" 
              onClick={() => {
                setShowAddForm(false)
                setNewCategoryName('')
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="categories-list">
        <div 
          className={`category-item ${!selectedCategory ? 'active' : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          <Folder size={16} />
          <span>All Items</span>
        </div>

        {categories.map(category => (
          <div 
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
          >
            {editingCategory?.id === category.id ? (
              <form onSubmit={handleUpdateCategory} className="edit-category-form">
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="category-input"
                  autoFocus
                />
                <div className="form-buttons">
                  <button type="submit" className="save-btn">Save</button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEditingCategory(null)
                      setEditCategoryName('')
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div 
                  className="category-content"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Folder size={16} />
                  <span>{category.name}</span>
                </div>
                <div className="category-actions">
                  <button 
                    onClick={() => startEditCategory(category)}
                    className="edit-btn"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="delete-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default Sidebar 
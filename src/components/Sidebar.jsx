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
	const [formData, setFormData] = useState({ new: '', edit: '' })

	const handleCategoryAction = async (action, data) => {
		try {
			await action(data)
			setFormData({ new: '', edit: '' })
			setShowAddForm(false)
			setEditingCategory(null)
			onCategoryChange()
		} catch (error) {
			console.error('Category action failed:', error)
		}
	}

	const handleAddCategory = (e) => {
		e.preventDefault()
		if (!formData.new.trim()) return
		
		handleCategoryAction(
			() => addItem('categories', {
				name: formData.new.trim(),
				createdAt: new Date().toISOString()
			})
		)
	}

	const handleUpdateCategory = (e) => {
		e.preventDefault()
		if (!formData.edit.trim() || !editingCategory) return
		
		handleCategoryAction(
			() => updateItem('categories', {
				...editingCategory,
				name: formData.edit.trim()
			})
		)
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

	const CategoryForm = ({ type, onSubmit, onCancel, placeholder, value, onChange }) => (
		<form onSubmit={onSubmit} className="category-form">
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className="category-input"
				autoFocus
			/>
			<div className="form-buttons">
				<button type="submit" className="save-btn">Save</button>
				<button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
			</div>
		</form>
	)

	const CategoryItem = ({ category, isEditing }) => (
		<div className={`category-item ${selectedCategory === category?.id ? 'active' : ''}`}>
			{isEditing ? (
				<CategoryForm
					type="edit"
					onSubmit={handleUpdateCategory}
					onCancel={() => { setEditingCategory(null); setFormData(prev => ({ ...prev, edit: '' })) }}
					placeholder="Category name"
					value={formData.edit}
					onChange={(e) => setFormData(prev => ({ ...prev, edit: e.target.value }))}
				/>
			) : (
				<>
					<div className="category-content" onClick={() => setSelectedCategory(category?.id)}>
						<Folder size={16} />
						<span>{category?.name || 'All Items'}</span>
					</div>
					{category && (
						<div className="category-actions">
							<button
								onClick={() => { setEditingCategory(category); setFormData(prev => ({ ...prev, edit: category.name })) }}
								className="edit-btn cat-btn"
							>
								<Edit size={14} />
							</button>
							<button
								onClick={() => handleDeleteCategory(category.id)}
								className="delete-btn cat-btn"
							>
								<Trash2 size={14} />
							</button>
						</div>
					)}
				</>
			)}
		</div>
	)

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
				<CategoryForm
					type="add"
					onSubmit={handleAddCategory}
					onCancel={() => { setShowAddForm(false); setFormData(prev => ({ ...prev, new: '' })) }}
					placeholder="Category name"
					value={formData.new}
					onChange={(e) => setFormData(prev => ({ ...prev, new: e.target.value }))}
				/>
			)}

			<div className="categories-list">
				<CategoryItem category={null} />
				{categories.map(category => (
					<CategoryItem
						key={category.id}
						category={category}
						isEditing={editingCategory?.id === category.id}
					/>
				))}
			</div>
		</aside>
	)
}

export default Sidebar 
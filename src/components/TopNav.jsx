import { Search, Filter, SortAsc, Plus, Grid, List, Tag, X, Moon, Sun } from 'lucide-react'

const TopNav = ({ 
  searchQuery, 
  setSearchQuery, 
  sortBy, 
  setSortBy, 
  filterBy, 
  setFilterBy, 
  selectedTags,
  setSelectedTags,
  availableTags,
  darkMode,
  setDarkMode,
  onAddNew 
}) => {
  return (
    <nav className="top-nav">
      <div className="nav-left">
        <h1 className="app-title">Todo App</h1>
      </div>
      
      <div className="nav-center">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search todos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="nav-right">
        <div className="filter-controls">
          <div className="tag-filter">
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedTags.includes(e.target.value)) {
                  setSelectedTags([...selectedTags, e.target.value])
                }
              }}
              className="tag-select"
            >
              <option value="">Filter by tag...</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            {selectedTags.length > 0 && (
              <div className="selected-tags">
                {selectedTags.map(tag => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className="remove-tag-btn"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
        
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className="theme-toggle-btn"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button onClick={onAddNew} className="add-button">
          <Plus size={20} />
          Add New
        </button>
      </div>
    </nav>
  )
}

export default TopNav 
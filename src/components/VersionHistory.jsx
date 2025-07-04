import { useState } from 'react'
import { X, RotateCcw, Clock, GitBranch, Eye, EyeOff } from 'lucide-react'
import { format } from 'date-fns'

const formatDate = (dateString) => {
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

const VersionHistory = ({ versions, onRestore, onClose, currentTodo }) => {
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showComparison, setShowComparison] = useState(false)

  // Guard against undefined currentTodo
  if (!currentTodo) {
    return (
      <div className="version-history-overlay">
        <button onClick={onClose} className="modal-close-btn">
          <X size={24} />
        </button>
        <div className="version-history">
          <div className="version-header">
            <div className="version-title">
              <GitBranch size={20} />
              <h2>Version History</h2>
            </div>
          </div>
          <div className="version-list">
            <div className="empty-versions">
              <p>Unable to load version history.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleVersionClick = (version) => {
    setSelectedVersion(version)
    setShowComparison(true)
  }

  const handleRestore = (versionId) => {
    if (window.confirm('Are you sure you want to restore this version? This will overwrite the current version.')) {
      onRestore(versionId)
      setShowComparison(false)
      setSelectedVersion(null)
    }
  }

  const handleReject = () => {
    setShowComparison(false)
    setSelectedVersion(null)
  }

  return (
    <div className="version-history-overlay">
      <button onClick={onClose} className="modal-close-btn">
        <X size={24} />
      </button>
      <div className="version-history">
        <div className="version-header">
          <div className="version-title">
            <GitBranch size={20} />
            <h2>Version History</h2>
          </div>
        </div>

        <div className="version-list">
          {versions.length === 0 ? (
            <div className="empty-versions">
              <p>No previous versions found.</p>
            </div>
          ) : (
            versions.map((version, index) => (
              <div key={version.id} className="version-item" onClick={() => handleVersionClick(version)}>
                <div className="version-info">
                  <div className="version-header-info">
                    <span className="version-number">Version {version.versionNumber}</span>
                    <span className="version-date">
                      <Clock size={14} />
                      {formatDate(version.createdAt) || 'Unknown date'}
                    </span>
                  </div>
                  
                  <div className="version-preview">
                    <h4>{version.data.title}</h4>
                    {version.data.content && (
                      <p className="version-content">
                        {version.data.content.length > 100 
                          ? `${version.data.content.substring(0, 100)}...` 
                          : version.data.content
                        }
                      </p>
                    )}
                    
                    <div className="version-meta">
                      <span className="version-type">{version.data.type}</span>
                      {version.data.priority && (
                        <span className={`version-priority ${version.data.priority}`}>
                          {version.data.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {showComparison && selectedVersion && (
            <div className="version-comparison-overlay">
              <div className="version-comparison-modal">
                <div className="comparison-header">
                  <h3>Version Comparison</h3>
                  <button onClick={handleReject} className="modal-close-btn">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="comparison-content">
                  <div className="comparison-columns">
                    <div className="comparison-column">
                      <h4>Previous Version</h4>
                      <div className="version-details">
                        <div className="detail-section">
                          <h5>Title</h5>
                          <p>{selectedVersion.data.title}</p>
                        </div>
                        
                        {selectedVersion.data.content && (
                          <div className="detail-section">
                            <h5>Content</h5>
                            <p>{selectedVersion.data.content}</p>
                          </div>
                        )}

                        <div className="detail-section">
                          <h5>Type</h5>
                          <p>{selectedVersion.data.type}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Priority</h5>
                          <p>{selectedVersion.data.priority}</p>
                        </div>

                        {selectedVersion.data.categoryId && (
                          <div className="detail-section">
                            <h5>Category</h5>
                            <p>{selectedVersion.data.categoryId}</p>
                          </div>
                        )}

                        {selectedVersion.data.dueDate && (
                          <div className="detail-section">
                            <h5>Due Date</h5>
                            <p>{formatDate(selectedVersion.data.dueDate)}</p>
                          </div>
                        )}

                        {selectedVersion.data.customColor && (
                          <div className="detail-section">
                            <h5>Custom Color</h5>
                            <div className="color-preview" style={{ backgroundColor: selectedVersion.data.customColor }}>
                              {selectedVersion.data.customColor}
                            </div>
                          </div>
                        )}

                        {selectedVersion.data.type === 'checklist' && selectedVersion.data.checklistItems && (
                          <div className="detail-section">
                            <h5>Checklist Items</h5>
                            <div className="checklist-items">
                              {selectedVersion.data.checklistItems.map((item, index) => (
                                <div key={index} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                                  <span className={item.completed ? 'completed' : ''}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedVersion.data.type === 'list' && selectedVersion.data.listItems && (
                          <div className="detail-section">
                            <h5>List Items</h5>
                            <div className="list-items">
                              {selectedVersion.data.listItems.map((item, index) => (
                                <div key={index} className="list-item">
                                  <div className="list-bullet">•</div>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedVersion.data.tags && selectedVersion.data.tags.length > 0 && (
                          <div className="detail-section">
                            <h5>Tags</h5>
                            <div className="tags-list">
                              {selectedVersion.data.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="detail-section">
                          <h5>Created</h5>
                          <p>{formatDate(selectedVersion.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="comparison-column">
                      <h4>Current Version</h4>
                      <div className="version-details">
                        <div className="detail-section">
                          <h5>Title</h5>
                          <p>{currentTodo.title}</p>
                        </div>
                        
                        {currentTodo.content && (
                          <div className="detail-section">
                            <h5>Content</h5>
                            <p>{currentTodo.content}</p>
                          </div>
                        )}

                        <div className="detail-section">
                          <h5>Type</h5>
                          <p>{currentTodo.type}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Priority</h5>
                          <p>{currentTodo.priority}</p>
                        </div>

                        {currentTodo.categoryId && (
                          <div className="detail-section">
                            <h5>Category</h5>
                            <p>{currentTodo.categoryId}</p>
                          </div>
                        )}

                        {currentTodo.dueDate && (
                          <div className="detail-section">
                            <h5>Due Date</h5>
                            <p>{formatDate(currentTodo.dueDate)}</p>
                          </div>
                        )}

                        {currentTodo.customColor && (
                          <div className="detail-section">
                            <h5>Custom Color</h5>
                            <div className="color-preview" style={{ backgroundColor: currentTodo.customColor }}>
                              {currentTodo.customColor}
                            </div>
                          </div>
                        )}

                        {currentTodo.type === 'checklist' && currentTodo.checklistItems && (
                          <div className="detail-section">
                            <h5>Checklist Items</h5>
                            <div className="checklist-items">
                              {currentTodo.checklistItems.map((item, index) => (
                                <div key={index} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                                  <span className={item.completed ? 'completed' : ''}>
                                    {item.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {currentTodo.type === 'list' && currentTodo.listItems && (
                          <div className="detail-section">
                            <h5>List Items</h5>
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

                        {currentTodo.tags && currentTodo.tags.length > 0 && (
                          <div className="detail-section">
                            <h5>Tags</h5>
                            <div className="tags-list">
                              {currentTodo.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="detail-section">
                          <h5>Created</h5>
                          <p>{formatDate(currentTodo.createdAt)}</p>
                        </div>

                        <div className="detail-section">
                          <h5>Last Updated</h5>
                          <p>{formatDate(currentTodo.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="comparison-actions">
                  <button onClick={handleReject} className="reject-btn">
                    Keep Current Version
                  </button>
                  <button onClick={() => handleRestore(selectedVersion.id)} className="restore-btn">
                    <RotateCcw size={16} />
                    Restore This Version
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VersionHistory 
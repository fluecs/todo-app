# Todo App

A comprehensive React-based todo application with advanced features including IndexedDB storage, version control, and multiple todo types.

## Features

### 🎯 Core Functionality
- **Multiple Todo Types**: Memos, Lists, and Checklists
- **Categories**: Organize todos with custom categories
- **Priority Levels**: High, Medium, Low priority settings
- **Due Dates**: Optional due dates with overdue indicators
- **Tags**: Add custom tags to todos for better organization

### 🔍 Search & Filter
- **Real-time Search**: Search through todo titles and content
- **Filter Options**: Filter by completion status (All, Pending, Completed)
- **Sort Options**: Sort by creation date, due date, priority, or title
- **Category Filtering**: Filter todos by specific categories

### 📊 Version Control System
- **Automatic Versioning**: Every change creates a new version
- **Version History**: View all previous versions of a todo
- **Restore Functionality**: Restore any previous version
- **Branch-like System**: Similar to Git version control

### 💾 Data Storage
- **IndexedDB**: Client-side database for persistent storage
- **Offline Support**: Works completely offline
- **No Server Required**: All data stored locally in the browser

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Accessibility**: Keyboard navigation and screen reader support
- **Dark/Light Mode Ready**: CSS variables for easy theming

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

### Creating Todos

1. Click the "Add New" button in the top navigation
2. Choose a todo type:
   - **Memo**: Simple text-based notes
   - **List**: Bullet-point style lists
   - **Checklist**: Interactive checkboxes with progress tracking
3. Fill in the details:
   - Title (required)
   - Content (optional)
   - Category (optional)
   - Priority level
   - Due date (optional)
   - Tags (optional)
4. For checklists, add individual items
5. Click "Create" to save

### Managing Categories

1. In the sidebar, click the "+" button next to "Categories"
2. Enter a category name and click "Save"
3. Edit categories by clicking the edit icon
4. Delete categories by clicking the delete icon

### Using Version Control

1. Click the version control icon (Git branch) on any todo
2. View the version history with timestamps
3. Click "Restore" on any version to revert to that state
4. Confirm the restoration when prompted

### Searching and Filtering

1. **Search**: Use the search bar to find todos by title or content
2. **Filter**: Use the filter dropdown to show All, Pending, or Completed todos
3. **Sort**: Use the sort dropdown to order todos by different criteria
4. **Categories**: Click on categories in the sidebar to filter by category

## Project Structure

```
src/
├── components/
│   ├── TopNav.jsx          # Top navigation with search and filters
│   ├── Sidebar.jsx         # Category management sidebar
│   ├── TodoForm.jsx        # Form for creating/editing todos
│   ├── TodoList.jsx        # Main todo list display
│   └── VersionHistory.jsx  # Version control modal
├── utils/
│   └── indexedDB.js        # IndexedDB utilities and CRUD operations
├── App.jsx                 # Main application component
├── App.css                 # Application styles
├── index.css               # Global styles
└── main.jsx                # Application entry point
```

## Technical Details

### IndexedDB Schema

The application uses three main stores:

1. **todos**: Main todo items with all properties
2. **categories**: User-defined categories
3. **versions**: Version history for each todo

### Key Technologies

- **React 19**: Latest React with hooks and modern patterns
- **Vite**: Fast build tool and development server
- **IndexedDB**: Client-side database for persistent storage
- **Lucide React**: Modern icon library
- **date-fns**: Date manipulation utilities

### Browser Support

- Chrome/Edge (Chromium-based): Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Future Enhancements

- [ ] Dark mode support
- [ ] Export/import functionality
- [ ] Cloud synchronization
- [ ] Collaborative editing
- [ ] Advanced search filters
- [ ] Todo templates
- [ ] Recurring todos
- [ ] Calendar view
- [ ] Mobile app (React Native)

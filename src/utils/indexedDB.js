// IndexedDB utility functions for the todo app

const DB_NAME = 'TodoAppDB';
const DB_VERSION = 1;

// Database stores
const STORES = {
  TODOS: 'todos',
  CATEGORIES: 'categories',
  VERSIONS: 'versions'
};

// Initialize the database
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create todos store
      if (!db.objectStoreNames.contains(STORES.TODOS)) {
        const todosStore = db.createObjectStore(STORES.TODOS, { keyPath: 'id', autoIncrement: true });
        todosStore.createIndex('categoryId', 'categoryId', { unique: false });
        todosStore.createIndex('priority', 'priority', { unique: false });
        todosStore.createIndex('dueDate', 'dueDate', { unique: false });
        todosStore.createIndex('type', 'type', { unique: false });
        todosStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create categories store
      if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
        const categoriesStore = db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id', autoIncrement: true });
        categoriesStore.createIndex('name', 'name', { unique: true });
      }

      // Create versions store
      if (!db.objectStoreNames.contains(STORES.VERSIONS)) {
        const versionsStore = db.createObjectStore(STORES.VERSIONS, { keyPath: 'id', autoIncrement: true });
        versionsStore.createIndex('todoId', 'todoId', { unique: false });
        versionsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

// Generic CRUD operations
const getDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

// Add item to store
export const addItem = async (storeName, item) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all items from store
export const getAllItems = async (storeName) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get item by ID
export const getItemById = async (storeName, id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Update item
export const updateItem = async (storeName, item) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Delete item
export const deleteItem = async (storeName, id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Search items
export const searchItems = async (storeName, query, searchFields = ['title', 'content']) => {
  const items = await getAllItems(storeName);
  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => 
    searchFields.some(field => 
      item[field] && item[field].toLowerCase().includes(lowerQuery)
    )
  );
};

// Get items by index
export const getItemsByIndex = async (storeName, indexName, value) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Version control functions
export const createVersion = async (todoId, todoData) => {
  const version = {
    todoId,
    data: todoData,
    createdAt: new Date().toISOString(),
    versionNumber: await getNextVersionNumber(todoId)
  };
  
  return addItem(STORES.VERSIONS, version);
};

export const getVersions = async (todoId) => {
  const versions = await getItemsByIndex(STORES.VERSIONS, 'todoId', todoId);
  return versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getNextVersionNumber = async (todoId) => {
  const versions = await getVersions(todoId);
  return versions.length + 1;
};

export const restoreVersion = async (todoId, versionId) => {
  const version = await getItemById(STORES.VERSIONS, versionId);
  if (version) {
    const restoredTodo = { ...version.data, id: todoId };
    await updateItem(STORES.TODOS, restoredTodo);
    return restoredTodo;
  }
  throw new Error('Version not found');
};

// Export store names for use in components
export { STORES }; 
// IndexedDB utility functions for the todo app

const DB_NAME = 'TodoAppDB';
const DB_VERSION = 1;

// Database stores
const STORES = {
  TODOS: 'todos',
  CATEGORIES: 'categories'
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
    };
  });
};

// Generic database operations
const getDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

const executeTransaction = async (storeName, mode, operation) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// CRUD operations
export const addItem = (storeName, item) => 
  executeTransaction(storeName, 'readwrite', store => store.add(item));

export const getAllItems = (storeName) => 
  executeTransaction(storeName, 'readonly', store => store.getAll());

export const getItemById = (storeName, id) => 
  executeTransaction(storeName, 'readonly', store => store.get(id));

export const updateItem = (storeName, item) => 
  executeTransaction(storeName, 'readwrite', store => store.put(item));

export const deleteItem = (storeName, id) => 
  executeTransaction(storeName, 'readwrite', store => store.delete(id));

// Search items
export const searchItems = async (storeName, query, searchFields = ['title', 'content']) => {
  const items = await getAllItems(storeName);
  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => 
    searchFields.some(field => 
      item[field]?.toLowerCase().includes(lowerQuery)
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

// Export store names for use in components
export { STORES }; 
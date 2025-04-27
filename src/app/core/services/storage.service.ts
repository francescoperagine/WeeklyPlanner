import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'weekly-planner-db';
  private dbVersion = 1;
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDatabase();
  }

  private initDatabase(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for each data type
        if (!db.objectStoreNames.contains('plannerItems')) {
          const plannerStore = db.createObjectStore('plannerItems', { keyPath: 'id' });
          plannerStore.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('todoItems')) {
          const todoStore = db.createObjectStore('todoItems', { keyPath: 'id' });
          todoStore.createIndex('dueDate', 'dueDate', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' });
          notesStore.createIndex('date', 'date', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('reflections')) {
          const reflectionsStore = db.createObjectStore('reflections', { keyPath: 'id' });
          reflectionsStore.createIndex('date', 'date', { unique: false });
          reflectionsStore.createIndex('activityId', 'activityId', { unique: false });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        console.error('Database error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  // Generic CRUD operations for all object stores
  create<T>(storeName: string, item: T): Observable<T> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T>(observer => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.add(item);

          request.onsuccess = () => {
            observer.next(item);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error creating item in ${storeName}:`, error);
        return throwError(() => error);
      })
    );
  }

  getById<T>(storeName: string, id: string): Observable<T | null> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T | null>(observer => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.get(id);

          request.onsuccess = () => {
            observer.next(request.result || null);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error getting item from ${storeName}:`, error);
        return of(null);
      })
    );
  }

  getAll<T>(storeName: string): Observable<T[]> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T[]>(observer => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error getting all items from ${storeName}:`, error);
        return of([]);
      })
    );
  }

  update<T>(storeName: string, item: T): Observable<T> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T>(observer => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.put(item);

          request.onsuccess = () => {
            observer.next(item);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error updating item in ${storeName}:`, error);
        return throwError(() => error);
      })
    );
  }

  delete(storeName: string, id: string): Observable<boolean> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<boolean>(observer => {
          const transaction = db.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(id);

          request.onsuccess = () => {
            observer.next(true);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error deleting item from ${storeName}:`, error);
        return of(false);
      })
    );
  }

  // Query by index
  queryByIndex<T>(storeName: string, indexName: string, value: any): Observable<T[]> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T[]>(observer => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const request = index.getAll(IDBKeyRange.only(value));

          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error querying ${storeName} by ${indexName}:`, error);
        return of([]);
      })
    );
  }

  // Query by date range (useful for planner items, notes, reflections)
  queryByDateRange<T>(
    storeName: string, 
    indexName: string, 
    startDate: Date, 
    endDate: Date
  ): Observable<T[]> {
    return from(this.dbPromise).pipe(
      switchMap(db => {
        return new Observable<T[]>(observer => {
          const transaction = db.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const index = store.index(indexName);
          const range = IDBKeyRange.bound(startDate, endDate);
          const request = index.getAll(range);

          request.onsuccess = () => {
            observer.next(request.result);
            observer.complete();
          };

          request.onerror = () => {
            observer.error(request.error);
          };
        });
      }),
      catchError(error => {
        console.error(`Error querying ${storeName} by date range:`, error);
        return of([]);
      })
    );
  }
}
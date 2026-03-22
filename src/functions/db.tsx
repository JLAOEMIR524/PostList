let db: IDBDatabase;

export function getData(store: string, key: string, DBname: string) {
    const open = indexedDB.open(DBname);
    return new Promise((resolve, reject) => {
        open.onsuccess = () => {
            let request!: IDBRequest;
            db = open.result;
            if ([...db.objectStoreNames].find((name) => name === store)) {
                const transaction = db.transaction(store);
                const objectStore = transaction.objectStore(store);
                if (key === 'all') request = objectStore.getAll();
                else request = objectStore.get(key);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                transaction.oncomplete = () => db.close();
                console.log("Done")
            } else {
                reject(new Error(`Speicher ${store} konnte nicht gefundne werden.`))
            }
        };
    });
};

export const addData = (store: string, payload: object, DBname: string) => {
    const open = indexedDB.open(DBname, 1);

    open.onupgradeneeded = () => {
        db = open.result;
        if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { autoIncrement: true });
        }
    };

    open.onsuccess = () => {
        db = open.result;
        const transaction = db.transaction(store, 'readwrite');
        const objectStore = transaction.objectStore(store);
        const serialized = JSON.parse(JSON.stringify(payload));
        const request = objectStore.add(serialized);
        request.onerror = () => console.error(request.error);
        transaction.oncomplete = () => db.close();
    };

    open.onerror = () => console.error(open.error);
};

export const removeDB = (DBname: string) => {
    indexedDB.deleteDatabase(DBname);
};
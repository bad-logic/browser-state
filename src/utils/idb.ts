export const objectStoreName = 'networkDiagnostics';
export const dbName = 'chromeBrowserState';


export const readFromIdb = (key: number)=>{
    return new Promise((resolve)=>{
        const dbOpenRequest = indexedDB.open(dbName, 4);
        dbOpenRequest.onerror = (event) => {
            console.error('[FG:IDB_ERROR]',event);
            return resolve(null);
        };

        dbOpenRequest.onsuccess = () => {
            console.info('[FG:IDB_SUCCESS]')
            // Store the result of opening the database in the db variable. This is used a lot below
            const Idb = dbOpenRequest.result;
            const transaction = Idb.transaction([objectStoreName], 'readwrite').objectStore(objectStoreName)
            const cursor = transaction.openCursor();

            cursor.onsuccess = (event: Event) => {
                const cursor = (event?.target as IDBRequest).result;
                if(!cursor){
                    return resolve(null);
                }
                const {tabId, reqs} = cursor.value;
                if(tabId === key){
                    transaction.delete(tabId);
                    return resolve(reqs);
                }
                cursor.continue();
            }

            cursor.onerror = (event)=>{
                console.error('[FG:CURSOR_READ_ERROR] ',event);
                return resolve(null);
            }
        };
    });
}
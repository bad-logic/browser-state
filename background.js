import {dbName, objectStoreName} from "./src/utils/idb.js";

let networkData = {};

function detach(tabId,cb){
    chrome.debugger.detach({ tabId },cb);
}

// Detach debugger when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    detach(tabId,()=>{
        if(chrome.runtime.lastError){
            console.error("[BG:CLEANUP_ERROR] ", chrome.runtime.lastError.message)
        }else{
            console.info("[BG:CLEANUP_SUCCESS]")
        }
    });
});

let Idb;

const dbOpenRequest = indexedDB.open(dbName, 4);
dbOpenRequest.onerror = (event) => {
    console.error('[BG:BG:IDB_ERROR]',event);
};

dbOpenRequest.onsuccess = (event) => {
    console.info('[BG:IDB_SUCCESS]')
    // Store the result of opening the database in the db variable. This is used a lot below
    Idb = dbOpenRequest.result;
};

dbOpenRequest.onupgradeneeded = (event) => {
    Idb = event.target.result;

    Idb.onerror = (event) => {
        console.error('[BG:IDB_UPGRADE_ERROR] ',event);
    };

    console.info('[BG:IDB_UPGRADE_SUCCESS]');
    // Create an objectStore for this database
    const store = Idb.createObjectStore(objectStoreName, {keyPath: 'tabId'});
    store.createIndex('reqs', 'reqs', { unique: false });
};

chrome.runtime.onMessage.addListener( (message, sender, cb) => {
    console.info(`[BG:MESSAGE_RECEIVED] `,message.type, message.tabId);
    switch(message.type){
        case 'INITIALIZE_DB':
            if(!Idb){
                console.error('[BG:INITIALIZE_DB_ERROR] ',message.tabId);
                cb(false);
            }else{
                console.info('[BG:INITIALIZE_DB_SUCCESS] ',message.tabId);
                cb(true);
            }
            break;
        case 'ATTACH_DEBUGGER':
            try{
                // attach debugger
                chrome.debugger.attach({ tabId: message.tabId }, "1.3", () => {
                    if (chrome.runtime.lastError) {
                        console.error("[BG:ATTACH_DEBUGGER_ERROR] ", message.tabId , chrome.runtime.lastError.message);
                        cb(false);
                        return;
                    }
                    console.info("[BG:ATTACH_DEBUGGER_SUCCESS] ", message.tabId);
                    // Enable Network domain
                    chrome.debugger.sendCommand({ tabId: message.tabId }, "Network.enable", {}, () => {
                        cb(true);
                    });
                });
            }catch (err){
                console.error("[BG:ATTACH_DEBUGGER_ERROR] ", message.tabId , err);
                cb(false);
            }
            break;
        case 'DETACH_DEBUGGER':
            try{
                // detach debugger
                detach(message.tabId,()=>{
                    if(chrome.runtime.lastError){
                        console.error("[BG:DETACH_DEBUGGER_ERROR] ", message.tabId , chrome.runtime.lastError.message);
                        cb(false);
                    }else{
                        console.info("[BG:DETACH_DEBUGGER_SUCCESS] ", message.tabId);
                        cb(true);
                    }
                });
            }catch (err){
                console.error("[BG:DETACH_DEBUGGER_ERROR] ", message.tabId , err);
                cb(false);
            }
            break;
        case 'GET_NETWORK_DIAGNOSTICS':
            try{
                // get network data
                const data = [];
                for(const r in networkData){
                    if(networkData[r].tabId===message.tabId){
                        data.push({...networkData[r],request:{...networkData[r].request,response:{...networkData[r].response}}});
                        delete networkData[r];
                    }
                }

                // no network reqs captured for this tab
                if(!data.length > 0){
                    cb(false);
                    return;
                }

                // using index db due to limitation for storage bytes in chrome.storage
                // Open a read/write DB transaction, ready for adding the data
                const transaction = Idb.transaction([objectStoreName], 'readwrite');
                transaction.oncomplete = () => {
                    console.info('[BG:GET_NETWORK_DIAGNOSTICS_TSUCCESS]', message.tabId);
                };

                // Handler for any unexpected error
                transaction.onerror = (e) => {
                    console.error('[BG:GET_NETWORK_DIAGNOSTICS_TERROR]', message.tabId, e);
                };

                // get the created object store
                const objectStore = transaction.objectStore(objectStoreName);
                const deleteReqs = objectStore.delete(message.tabId);
                deleteReqs.onsuccess = (ev)=>{
                    console.info('[BG:GET_NETWORK_DIAGNOSTICS_OS_DEL_SUCCESS]');
                    const objectStoreRequest = objectStore.add({
                        tabId: message.tabId,
                        reqs:data
                    });
                    objectStoreRequest.onsuccess = (event) => {
                        console.info('[BG:GET_NETWORK_DIAGNOSTICS_OS_WRITE_SUCCESS]', message.tabId);
                        console.info('[BG:GET_NETWORK_DIAGNOSTICS_SUCCESS]', message.tabId);
                        cb(true);
                    };
                    objectStoreRequest.onerror = (e)=>{
                        cb(false);
                        console.error('[BG:GET_NETWORK_DIAGNOSTICS_OS_WRITE_ERROR] ', message.tabId , e);
                    }
                }
                deleteReqs.onerror = (ev)=>{
                    console.error('[BG:GET_NETWORK_DIAGNOSTICS_OS_DEL_ERROR] ',ev);
                    cb(false);
                }
            }catch (err){
                cb(false);
                console.error('[BG:GET_NETWORK_DIAGNOSTICS_ERROR]', message.tabId, err);
            }
            break;
        default:
            break;
    }
    return true; // keep open for async jobs
});


// Listen for network response events
chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
    if(message === "Network.requestWillBeSent"){
        networkData[params.requestId] = {
            tabId: debuggeeId.tabId,
            requestId:params.requestId,
            method: params.request.method,
            url: params.request.url,
            start: params.timestamp,
            request:{
                ...params.request,
                requestId:params.requestId,
                tabId: debuggeeId.tabId,
                contentType: params.request?.headers['content-type'] ?? params.request?.headers['Content-Type']
            }
        };
    }else if (message === "Network.responseReceived") {
        // Get response body
        chrome.debugger.sendCommand(
            debuggeeId,
            "Network.getResponseBody",
            { requestId: params.requestId },
            (response) => {
                if (networkData[params.requestId]) {
                    networkData[params.requestId] = {
                        ...networkData[params.requestId],
                        status: params.response.status,
                        statusLine: params.response.statusText,
                        end: params.timestamp,
                        response:{
                            ...params.response,
                            requestId:params.requestId,
                            body: response ? response.body : null,
                            base64Encoded: response ? response.base64Encoded : false,
                            tabId: debuggeeId.tabId,
                            contentType: params.response?.headers['content-type'] ?? params.response?.headers['Content-Type'] ?? params.response.mimeType
                        }
                    };
                }
            }
        );
    }
});



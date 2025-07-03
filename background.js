let networkData = {};

// Detach debugger when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.debugger.detach({ tabId });
});


chrome.runtime.onMessage.addListener(async (message, sender, cb) => {
    console.log("MESSAGE RECEIVED", {message, sender, cb});
    if (message.type === "ATTACH_DEBUGGER") {
        // attach debugger
        chrome.debugger.attach({ tabId: message.tabId }, "1.3", () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                cb({debuggerAttached: false});
                return;
            }
            // Enable Network domain
            chrome.debugger.sendCommand({ tabId: message.tabId }, "Network.enable", {}, () => {
                console.log("Network domain enabled for tab", message.tabId);
                cb({debuggerAttached: false});
            });
        });
    }else if(message.type === "DETACH_DEBUGGER"){
        // detach debugger
        chrome.debugger.detach({ tabId:message.tabId });
        cb({debuggerAttached: false});
    }else if (message.type === "GET_SNAPSHOT_DATA") {
        // get network data
        console.log({networkData})
        const data = [];
        for(const r in networkData){
            data.push(networkData[r]);
        }
        cb({ networkData: data });
        networkData = {}; // Reset after sending
    }
});



// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === "complete") {
//         chrome.debugger.attach({ tabId }, "1.3", () => {
//             if (chrome.runtime.lastError) {
//                 console.error(chrome.runtime.lastError.message);
//                 return;
//             }
//             // Enable Network domain
//             chrome.debugger.sendCommand({ tabId }, "Network.enable", {}, () => {
//                 console.log("Network domain enabled for tab", tabId);
//             });
//         });
//     }
// });



// Listen for network response events
chrome.debugger.onEvent.addListener((debuggeeId, message, params) => {
    console.log({debuggeeId,message,params})
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



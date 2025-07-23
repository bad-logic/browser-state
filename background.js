
let networkData = {};

function detach(tabId){
    console.info("detaching debugger from tab ", tabId);
    chrome.debugger.detach({ tabId });
}

// Detach debugger when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    detach(tabId);
});


chrome.runtime.onMessage.addListener( (message, sender, cb) => {
    console.info("MESSAGE RECEIVED", {message, sender, cb});
    if (message.type === "ATTACH_DEBUGGER") {
        console.info("attaching debugger to tab ", message.tabId)
        // attach debugger
        chrome.debugger.attach({ tabId: message.tabId }, "1.3", () => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                cb({attached: false});
                return;
            }
            // Enable Network domain
            chrome.debugger.sendCommand({ tabId: message.tabId }, "Network.enable", {}, () => {
                cb({attached: true});
            });
        });
    }else if(message.type === "DETACH_DEBUGGER"){
        // detach debugger
        detach(message.tabId);
        cb({attached: false});
    }else if (message.type === "GET_NETWORK_DIAGNOSTICS") {
        console.log({networkData})
        // get network data
        const data = [];
        for(const r in networkData){
            if(networkData[r].tabId===message.tabId){
                data.push({...networkData[r],request:{...networkData[r].request,response:{...networkData[r].response}}});
                delete networkData[r];
            }
        }
        cb({ networkData: data });
    }
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



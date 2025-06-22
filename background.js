import {getTabId, localStorage} from "./utility.js";

let networkData = [];
const storageKey = 'network-requests';

async function store(info) {
    console.log("[requestId]: ", info.requestId);
    // get items from local store
    let data = await localStorage.getFromLocalStore(storageKey);
    console.log("retrieving [requests] from storage", {data});
    if (data) {
        console.log("requests found with [length]: ", data.length)
        const index = data.findIndex((r) => r.requestId === info.requestId);
        console.log("[index]: ", index);
        if (index !== -1) {
            console.log("found index")
            data[index] = {...data[index], ...info}
        } else {
            console.log("index not found")
            data.push(info);
        }
    } else {
        console.log("requests not found")
        data = [];
        data.push(info);
    }
    console.log("updating the storage")
    localStorage.saveToLocalStore(storageKey, data);
}

chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        const info = {
            requestId: details.requestId,
            tabId: details.tabId,
            method: details.method,
            url: details.url,
            requestBody: details.requestBody,
            start: details.timeStamp
        }
        store(info);
        networkData.push({
            ...info
        });
    },
    {urls: ["<all_urls>"]},
    ["requestBody"]
);

chrome.webRequest.onCompleted.addListener(
    (details) => {

        const info = {
            requestId: details.requestId,
            tabId: details.tabId,
            method: details.method,
            url: details.url,
            status: details.statusCode,
            statusLine: details.statusLine,
            responseHeaders: details.responseHeaders,
            end: details.timeStamp
        }

        store(info);
        networkData.push({
            ...info
        });
    },
    {urls: ["<all_urls>"]},
    ["responseHeaders"]
);

async function getNetworkCalls(cb) {
    const data = await localStorage.getFromLocalStore(storageKey);
    if (!data) {
        return [];
    }
    const currentTabId = await getTabId();
    console.log({currentTabId})
    cb({calls: data.filter(d => d.tabId === currentTabId)});
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("GET_SNAPSHOT_DATA", {message, sender, sendResponse});
    if (message.type === "GET_SNAPSHOT_DATA") {
        sendResponse({networkData});
        networkData = []; // Reset after sending
    }
});
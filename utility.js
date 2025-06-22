export function getTabId() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            resolve(tabId);
        });
    })
}

export const localStorage = {
    cleanLocalStorage: () => {
        chrome.storage.local.clear();
    },
    getFromLocalStore: (key) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get([key], (data) => {
                if (data[key]) {
                    return resolve(JSON.parse(data[key]));
                }
                return resolve(null);
            });
        })
    },
    saveToLocalStore: (key, data) => {
        chrome.storage.local.set({[key]: JSON.stringify(data)});
    }
}
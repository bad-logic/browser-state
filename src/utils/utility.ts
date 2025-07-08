export function getTabId():Promise<number> {
    return new Promise((resolve,reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            if(tabId){
                return resolve(tabId);
            }
            reject("cannot get tab id");
        });
    })
}

export const localStorage = {
    cleanLocalStorage: async() => {
        await chrome.storage.local.clear();
    },
    getFromLocalStore: (key:string) => {
        return new Promise((resolve) => {
            chrome.storage.local.get([key], (data:Record<string,string>) => {
                if (data[key]) {
                    return resolve(JSON.parse(data[key]));
                }
                return resolve(null);
            });
        })
    },
    saveToLocalStore: async(key:string, data:object| null) => {
        await chrome.storage.local.set({[key]: data ? JSON.stringify(data) : null});
    }
}
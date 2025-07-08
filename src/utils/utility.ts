

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
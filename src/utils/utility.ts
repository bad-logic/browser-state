interface ITab{
    id:number,
    title:string,
    host?:string
}
export function getTabInfo():Promise<ITab> {
    return new Promise((resolve,reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            if(tabId){
                const d:ITab = {id: tabId, title:tabs[0].title ?? ''};
                if(tabs[0].url){
                    const url = new URL(tabs[0].url);
                    d.host = url.hostname;
                }
                return resolve(d);
            }
            reject("cannot get tab id");
        });
    })
}
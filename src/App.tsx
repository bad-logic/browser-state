import {useEffect, useState} from 'react'
import SnapshotViewer from "./components/SnapShotViewer.tsx";
import type {IPageData, IRequest} from "./utils/interfaces.ts";
import NetworkTab from "./components/NetworkTab.tsx";
import {getTabInfo, localStorage} from "./utils/utility.ts";


function App() {
    const [snapshotData, setSnapshotData] = useState<IPageData | null>(null);
    const [networkData, setNetworkData] = useState<IRequest[]| null>(null);
    const [activeTab, setActiveTab] = useState('html');
    const [tabId, setTabId] = useState(-1);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        getTabInfo().then(({id})=>{
            setTabId(id);
            chrome.debugger.getTargets().then((arr)=>{
                const tabInfo = arr.find(t=>t.tabId===id);
                console.log("current tab information",{tabInfo});
                if(tabInfo){
                    setIsCapturing(tabInfo.attached);
                }
                localStorage.getFromLocalStore(`${id}-snapshot`).then((d)=>{
                    console.log("snapshot",{d});
                    if(d){
                        setSnapshotData(d as IPageData)
                        localStorage.getFromLocalStore(`${id}-network`).then((d)=>{
                            if(d){
                                console.log("network",{d});
                                setNetworkData(d as IRequest[]);
                            }
                        });
                    }
                });
            })

        });
    }, [])

    const reset = ()=> {
        setSnapshotData(null);
        setNetworkData(null);
        localStorage.saveToLocalStore(`${tabId}-snapshot`,null);
        localStorage.saveToLocalStore(`${tabId}-network`,null);
        setActiveTab('html');
    }

    const clearCache = ()=>{
        localStorage.cleanLocalStorage();
    }

    const generateReport = ()=>{
        // Get html, css, js
        // @ts-expect-error chrome object is available in Chrome extension environment
        chrome.tabs.sendMessage(tabId,{type: "CAPTURE_BROWSER_SNAPSHOT"},(pageData: IPageData) => {
            setSnapshotData(pageData);
            localStorage.saveToLocalStore(`${tabId}-snapshot`,pageData);
        });

        // Get network data
        // @ts-expect-error chrome object is available in Chrome extension environment
        chrome.runtime.sendMessage({type: "GET_NETWORK_DIAGNOSTICS"},(response: { networkData: IRequest[] }) => {
            setNetworkData(response.networkData);
            localStorage.saveToLocalStore(`${tabId}-network`,response.networkData);
        });
    }

    const captureSnapshot = () => {
        if(tabId !== -1){
            if(isCapturing){
                setIsCapturing(false);
                generateReport();
                // @ts-expect-error chrome object is available in Chrome extension environment
                chrome.runtime.sendMessage({type: "DETACH_DEBUGGER", tabId },(response: {debuggerAttached:boolean}) => {
                    setIsCapturing(response.debuggerAttached)
                });
            }else{
                setIsCapturing(true);
                setSnapshotData(null);
                setNetworkData(null);
                // @ts-expect-error chrome object is available in Chrome extension environment
                chrome.runtime.sendMessage({type: "ATTACH_DEBUGGER", tabId },(response: {debuggerAttached:boolean}) => {
                    setIsCapturing(response.debuggerAttached)
                });
            }
        }else{
            console.error("cannot capture data");
            alert("Capture Failed!!!");
        }
    };

    return (
        <div className="w-[800px] h-[600px] p-4 overflow-hidden flex flex-col">
            <div className="flex flex-row">
                <h1 className="text-xl font-semibold mb-4 flex items-center gap-2">Tab: {tabId}</h1>
                <button
                    className="ml-2 px-3 py-2 cursor-pointer border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    title="Reset"
                    aria-label="Reset"
                    onClick={reset}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.364 3.05762C18.7782 3.05762 19.114 3.3934 19.114 3.80762V8.05026C19.114 8.46447 18.7782 8.80026 18.364 8.80026H14.1213C13.7071 8.80026 13.3713 8.46447 13.3713 8.05026C13.3713 7.63604 13.7071 7.30026 14.1213 7.30026H16.4817C13.6363 5.05718 9.4987 5.24825 6.87348 7.87348C4.04217 10.7048 4.04217 15.2952 6.87348 18.1265C9.70478 20.9578 14.2952 20.9578 17.1265 18.1265C19.0234 16.2297 19.6504 13.5428 19.0039 11.1219C18.897 10.7217 19.1348 10.3106 19.535 10.2038C19.9352 10.0969 20.3462 10.3347 20.4531 10.7349C21.2321 13.6518 20.478 16.8964 18.1872 19.1872C14.7701 22.6043 9.2299 22.6043 5.81282 19.1872C2.39573 15.7701 2.39573 10.2299 5.81282 6.81282C9.04483 3.5808 14.1762 3.40576 17.614 6.28768V3.80762C17.614 3.3934 17.9497 3.05762 18.364 3.05762Z"
                            fill="#1C274C"
                        />
                    </svg>
                </button>

                <button
                    className="ml-2 px-3 py-2 cursor-pointer border border-gray-300 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    title="Clear Cache"
                    aria-label="Clear Cache"
                    onClick={clearCache}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7"
                        />
                    </svg>
                </button>
            </div>
            {
                ((!snapshotData && !networkData) || isCapturing) ?
                    (
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                onClick={captureSnapshot}
                                className="relative h-24 w-24 rounded-full bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 border border-gray-100 text-black font-semibold shadow-xl flex justify-center items-center hover:bg-opacity-60 transition cursor-pointer"
                                aria-label="Capture Snapshot"
                            >
                                {isCapturing ? (
                                    <>
                                        <span
                                            className="absolute h-20 w-20 rounded-full border-4 border-gray-700 border-t-transparent animate-spin"/>
                                        <span className="relative z-10">Stop</span>
                                    </>
                                ) : (
                                    "Capture"
                                )}
                            </button>
                        </div>
                    )
                    :
                    (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex space-x-2 mb-3">
                                {['html', 'css', 'js', 'network'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-t-lg border-b-2 ${
                                            activeTab === tab ? 'border-blue-600 bg-white font-semibold' : 'border-transparent bg-gray-100'
                                        }`}
                                    >
                                        {tab.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 border rounded-b-lg bg-white overflow-auto p-3">
                                {activeTab !== 'network' ? (
                                    <SnapshotViewer
                                        type={activeTab}
                                        content={
                                            activeTab === 'html'
                                                ? snapshotData?.html
                                                : activeTab === 'css'
                                                    ? snapshotData?.styles
                                                    : snapshotData?.scripts
                                        }
                                    />
                                ) : (
                                    <NetworkTab networkData={networkData!}/>
                                )}
                            </div>
                        </div>
                    )
            }
        </div>
    );
}

export default App

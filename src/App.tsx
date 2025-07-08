import {useEffect, useState} from 'react'
import SnapshotViewer from "./components/SnapShotViewer.tsx";
import type {IPageData, IRequest} from "./utils/interfaces.ts";
import NetworkTab from "./components/NetworkTab.tsx";
import {getTabId} from "./utils/utility.ts";


function App() {
    const [snapshotData, setSnapshotData] = useState<IPageData | null>(null);
    const [networkData, setNetworkData] = useState<IRequest[]| null>(null);
    const [activeTab, setActiveTab] = useState('html');
    const [tabId, setTabId] = useState(-1);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        getTabId().then(id=>{
            setTabId(id);
            chrome.debugger.getTargets().then((arr)=>{
                const tabInfo = arr.find(t=>t.tabId===id);
                console.log("current tab information >>>",{tabInfo});
                if(tabInfo){
                    setIsCapturing(tabInfo.attached);
                }
            })
        });

    }, [])

    const reset = ()=>{
        setSnapshotData(null);
        setNetworkData(null);
        setActiveTab('html');
    }

    const generateReport = ()=>{
        // Get html, css, js
        // @ts-expect-error chrome object is available in Chrome extension environment
        chrome.tabs.sendMessage(tabId,{type: "CAPTURE_SNAPSHOT"},(pageData: IPageData) => {
            setSnapshotData(pageData);
        });

        // Get network data
        // @ts-expect-error chrome object is available in Chrome extension environment
        chrome.runtime.sendMessage({type: "GET_SNAPSHOT_DATA"},(response: { networkData: IRequest[] }) => {
            setNetworkData(response.networkData);
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
                    className="ml-2 w-8 h-8 flex items-center justify-center cursor-pointer rounded hover:bg-gray-200"
                    aria-label="Reset"
                    onClick={reset}
                >
                    {/* Inline SVG refresh icon */}
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(0)">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path fillRule="evenodd" clipRule="evenodd"
                                  d="M18.364 3.05762C18.7782 3.05762 19.114 3.3934 19.114 3.80762V8.05026C19.114 8.46447 18.7782 8.80026 18.364 8.80026H14.1213C13.7071 8.80026 13.3713 8.46447 13.3713 8.05026C13.3713 7.63604 13.7071 7.30026 14.1213 7.30026H16.4817C13.6363 5.05718 9.4987 5.24825 6.87348 7.87348C4.04217 10.7048 4.04217 15.2952 6.87348 18.1265C9.70478 20.9578 14.2952 20.9578 17.1265 18.1265C19.0234 16.2297 19.6504 13.5428 19.0039 11.1219C18.897 10.7217 19.1348 10.3106 19.535 10.2038C19.9352 10.0969 20.3462 10.3347 20.4531 10.7349C21.2321 13.6518 20.478 16.8964 18.1872 19.1872C14.7701 22.6043 9.2299 22.6043 5.81282 19.1872C2.39573 15.7701 2.39573 10.2299 5.81282 6.81282C9.04483 3.5808 14.1762 3.40576 17.614 6.28768V3.80762C17.614 3.3934 17.9497 3.05762 18.364 3.05762Z"
                                  fill="#1C274C"></path>
                        </g>
                    </svg>
                </button>
            </div>
            {
                ((!snapshotData && !networkData) || isCapturing) ?
                    (
                        <div className="flex flex-1 items-center justify-center">
                            <button
                                onClick={captureSnapshot}
                                className="relative h-24 w-24 rounded-full bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 border border-gray-100 text-black font-semibold shadow-xl flex justify-center items-center hover:bg-opacity-60 transition"
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

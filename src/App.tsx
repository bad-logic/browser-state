import {useEffect, useState} from 'react'
import SnapshotViewer from "./components/SnapShotViewer.tsx";
import type {IPageData, IRequest} from "./utils/interfaces.ts";
import NetworkTab from "./components/NetworkTab.tsx";


function App() {
    const [snapshotData, setSnapshotData] = useState<IPageData | null>(null);
    const [networkData, setNetworkData] = useState<IRequest[]>([]);
    const [activeTab, setActiveTab] = useState('html');
    const [tabId, setTabId] = useState(-1)


    useEffect(() => {
        // @ts-ignore
        chrome.tabs.query({active: true, currentWindow: true}, (tabs: { id: any; }[]) => {
            const tabId = tabs[0].id;
            setTabId(tabId);
        });
    }, [])

    const captureSnapshot = () => {
        // location.reload();
        // @ts-ignore
        chrome.tabs.sendMessage(
            tabId,
            {type: "CAPTURE_SNAPSHOT"},
            (pageData: IPageData) => {
                setSnapshotData(pageData);
            });

        // @ts-ignore
        // chrome.tabs.sendMessage(
        //     tabId,
        //     {type: "GET_SNAPSHOT_DATA"},
        //     (pageData: { calls: IRequest[] }) => {
        //         console.log("GET_SNAPSHOT_DATA", {pageData})
        //     });

        // Get network data
        chrome.runtime.sendMessage(
            {type: "GET_SNAPSHOT_DATA"},
            (response: { networkData: IRequest[] }) => {
                setNetworkData(response.networkData);
            });
    };

    return (
        <div className="w-[800px] h-[600px] p-4 overflow-hidden flex flex-col">
            <h1 className="text-xl font-semibold mb-4">Page Snapshot: {tabId}</h1>

            <div className="mb-4 space-x-2">
                <button
                    onClick={() => localStorage.clear()}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                    Clear
                </button>
                <button
                    onClick={captureSnapshot}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                    Capture Snapshot
                </button>
            </div>

            {snapshotData && (
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
                                        ? snapshotData.html
                                        : activeTab === 'css'
                                            ? snapshotData.styles
                                            : snapshotData.scripts
                                }
                            />
                        ) : (
                            <NetworkTab networkData={networkData}/>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App

import {useEffect, useRef, useState} from "react";
import type {IRequest} from "../utils/interfaces.ts";
import {Card, CardContent} from "./Card.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./Tabs.tsx";
import {ScrollArea} from "./ScrollArea.tsx";
import CodeBlock from "./CodeBlock.tsx";
import {createHarFromRequests, downloadHarFile} from "../utils/har.ts";
import {getTabInfo} from "../utils/utility.ts";


interface INetworkPanel {
    networkData: IRequest [];
}

export default function NetworkTab({networkData}: INetworkPanel) {
    const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [host, setHost] = useState<string|null>();
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        getTabInfo().then(({host})=>{
            setHost((host));
        })
    },[]);

    useEffect(() => {
        setActiveTab("overview");
    }, [selectedRequest]);

    const renderContent = ( data: any, type = "application/json", isBase64Encoded = false) => {
        if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
            return <p className="text-sm text-gray-500">No data</p>;
        }
        if(type==="application/json") {
            return(
                <div className={`flex overflow-auto`}>
                    <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-2 rounded-md">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
            );
        }else if (type.startsWith("image")) {
            return <img src={isBase64Encoded ? `data:${type};base64,${data}` : data } alt={`response image`}/>
        } else {
            return <CodeBlock code={isBase64Encoded ? atob(data) : data}/>;
        }
    };

    const handleDownload = ()=>{
        downloadHarFile(createHarFromRequests(networkData),`${host ?? window.location}.json`)
    }

    return (
        <div className="relative p-4">
            {networkData.length !== 0  &&
                <div className="flex justify-end">
                    <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-gray-700 rounded transition cursor-pointer"
                    title="Download File"
                    aria-label="Download File"
                >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v8m0 0l-4-4m4 4l4-4M12 4v8"
                            />
                        </svg>
                    </button>
                </div>
            }
            {/* Request list */}
            <ScrollArea className="max-h-[80vh] rounded-xl p-2 w-full">
                <div className="space-y-2">
                    {networkData.length === 0 ?
                        <p className="text-sm text-gray-500">No data Captured</p>
                        : networkData.map((req) => (
                            <Card
                                key={req.requestId}
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => setSelectedRequest(req)}
                            >
                                <CardContent className="flex justify-between items-center p-2">
                                    <div className="w-10/12">
                                        <p className="text-sm font-medium truncate">{req.method} {req.url}</p>
                                        <p className="text-xs text-gray-500 truncate">{req.statusLine}</p>
                                    </div>
                                    <span className="text-sm text-green-600">{req.status}</span>
                                </CardContent>
                            </Card>
                        ))}
                </div>
            </ScrollArea>

            {/* Drawer */}
            <div
                ref={drawerRef}
                className={`h-[80vh] w-[600px] bg-white shadow-xl transform transition-transform duration-300 border-l border-t z-50 fixed bottom-8 right-0 rounded-xl ${
                    selectedRequest ? "translate-x-0" : "translate-x-full pointer-events-none"
                }`}
            >
                {selectedRequest && (
                    <div className="p-4 h-full flex flex-col">
                        {/* Close icon top left */}
                        <div className="flex justify-start mb-4">
                            <button
                                aria-label="Close drawer"
                                onClick={() => setSelectedRequest(null)}
                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>

                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Request Details</h2>
                            <p className="text-sm text-gray-600">{selectedRequest.url}</p>
                        </div>

                        <Tabs value={activeTab} className="flex-1">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="request">Request</TabsTrigger>
                                <TabsTrigger value="requestbody">Request[Body]</TabsTrigger>
                                <TabsTrigger value="response">Response</TabsTrigger>
                                <TabsTrigger value="responsebody">Response[Body]</TabsTrigger>
                            </TabsList>

                            <div className="my-2">
                                <TabsContent value="overview">
                                    {renderContent({
                                        method: selectedRequest.method,
                                        url: selectedRequest.url,
                                        status: selectedRequest.status,
                                        duration: selectedRequest.end - selectedRequest.start,
                                    })}
                                </TabsContent>
                                <TabsContent value="request">
                                    {renderContent(selectedRequest.request)}
                                </TabsContent>
                                <TabsContent value="requestbody">
                                    {renderContent(selectedRequest.request?.postData, selectedRequest.request?.contentType)}
                                </TabsContent>
                                <TabsContent value="response">
                                    {renderContent(selectedRequest.response)}
                                </TabsContent>
                                <TabsContent value="responsebody">
                                    {renderContent(selectedRequest.response?.body, selectedRequest.response?.contentType, selectedRequest.response?.base64Encoded)}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}
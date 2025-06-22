import {useState} from "react";
import type {IRequest} from "../utils/interfaces.ts";
import {Card, CardContent} from "./Card.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "./Tabs.tsx";
import {ScrollArea} from "./ScrollArea.tsx";


interface INetworkPanel {
    networkData: IRequest [];
}

export default function NetworkTab({networkData}: INetworkPanel) {
    const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);

    return (
        <div className="grid md:grid-cols-2 gap-4 p-4">
            <ScrollArea className="h-[80vh] border rounded-xl">
                <div className="p-2 space-y-2">
                    {networkData.map((req) => (
                        <Card
                            key={req.requestId}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => setSelectedRequest(req)}
                        >
                            <CardContent className="flex justify-between items-center p-2">
                                <div>
                                    <p className="text-sm font-medium">{req.method} {req.url}</p>
                                    <p className="text-xs text-gray-500">{req.statusLine}</p>
                                </div>
                                <span className="text-sm text-green-600">{req.status}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>

            <div className="h-[80vh] border rounded-xl p-4 overflow-auto">
                {selectedRequest ? (
                    <Tabs defaultValue="overview">
                        <TabsList className="mb-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="headers">Headers</TabsTrigger>
                            <TabsTrigger value="body">Body</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview">
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify({
                method: selectedRequest.method,
                url: selectedRequest.url,
                status: selectedRequest.statusLine,
                duration: selectedRequest.end - selectedRequest.start,
            }, null, 2)}</pre>
                        </TabsContent>
                        <TabsContent value="headers">
                            <pre
                                className="text-sm whitespace-pre-wrap">{JSON.stringify(selectedRequest.responseHeaders, null, 2)}</pre>
                        </TabsContent>
                        <TabsContent value="body">
                            <pre
                                className="text-sm whitespace-pre-wrap">{JSON.stringify(selectedRequest.requestBody, null, 2)}</pre>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <p className="text-gray-500">Select a request to view details</p>
                )}
            </div>
        </div>
    );
}
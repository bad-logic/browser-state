import {useState} from 'react';
import type {IRequest} from "../utils/interfaces.ts";


interface INetworkPanel {
    networkData: IRequest [];
}

function NetworkPanel({networkData}: INetworkPanel) {
    const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);

    console.log("[networkData]: ", networkData.length)
    return (
        <div className="network-panel">
            <div className="request-list">
                {networkData.map((request, index) => (
                    <div
                        key={index}
                        className="request-item"
                        onClick={() => setSelectedRequest(request)}
                    >
                        <span>{request.method || 'GET'}</span>
                        :
                        <span>{request.url}</span>
                        <span>{request.status || 'Pending'}</span>
                    </div>
                ))}
            </div>

            {selectedRequest && (
                <div className="request-details">
                    <h3>Request Details</h3>
                    <pre>{JSON.stringify(selectedRequest, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default NetworkPanel;
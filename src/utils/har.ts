import type {IRequest} from "./interfaces.ts";

export const createHarFromRequests = (requests: IRequest[]) => {
    return {
        log: {
            version: '1.2',
            creator: {
                name: 'Browser State',
                version: '1.0'
            },
            // @TODO fix entries to match with har files
            entries:requests.map(req => {
                return {
                    _connectionId: req.response.connectionId,
                    _initiator: {},
                    _priority: "",
                    _resourceType: req.response.contentType,
                    connection: "",
                    request: req.request,
                    response: req.response,
                    cache: {},
                    serverIPAddress: req.response.remoteIPAddress,
                    startedDateTime: new Date(req.start).toISOString(), //2025-07-15T01:59:51.177Z, @TODO fix this
                    time: req.end - req.start,
                    timings: req.response.timing
                }
            })
        }
    };
}

export const downloadHarFile = (har: object, filename = 'network.har')=> {
    const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
import type {IRequest,Request,Response} from "./interfaces.ts";


const generateRequest = (request:Request)=>{
    if(!request || !Object.keys(request).length){
        return {};
    }
    return {
        method: request.method,
        url: request.url,
        headers: request.headers ? Object.keys(request.headers).map(key=>{
            return {
                "name":key,
                "value":request.headers[key]
            }
        }):{},
        // @TODO try with the following
        // postData: request.postData,
        // "queryString": [],
        // "cookies": [],
        // "headersSize": -1,
        // "bodySize": 0
    }

}

const generateResponse = (response:Response)=>{
    if(!response || !Object.keys(response).length){
        return {};
    }
    return {
        status: response?.status,
        statusText: response?.statusText,
        url: response?.url,
        protocol:response?.protocol,
        remoteIPAddress:response?.remoteIPAddress,
        remotePort:response?.remotePort,
        headers: response.headers ? Object.keys(response.headers).map(key=>{
            return {
                "name":key,
                "value":response.headers[key]
            }
        }):{},
        alternateProtocolUsage: response?.alternateProtocolUsage,
        mimeType:response?.mimeType,
        contentType:response?.contentType,
        base64Encoded: response?.base64Encoded,
        encodedDataLength:response?.encodedDataLength,
        charset:response?.charset,
        body: response?.body,
        responseTime:response?.responseTime,
        connectionReused:response?.connectionReused,
        fromDiskCache:response?.fromDiskCache,
        fromPrefetchCache:response?.fromPrefetchCache,
        fromServiceWorker:response?.fromServiceWorker,
        securityDetails:response?.securityDetails,
        timing:response?.timing,
        // @TODO try with the following
        // cookies: [],

    }
}

export const createHarFromRequests = (requests: IRequest[]) => {
    return {
        log: {
            version: '1.2',
            creator: {
                name: 'Browser State',
                version: '1.0'
            },
            entries:requests.map(req => {
                return {
                    _connectionId: req?.response?.connectionId,
                    _initiator: {},
                    _priority: "",
                    _resourceType: req?.response?.contentType,
                    connection: req?.response?.remotePort,
                    request: generateRequest(req?.request),
                    response: generateResponse(req?.response),
                    cache: {},
                    serverIPAddress: req?.response?.remoteIPAddress,
                    time: req?.end - req?.start,
                    timings: req?.response?.timing
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
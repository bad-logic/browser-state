export interface Request{
    requestId: number,
    headers: Record<string,string>,
    postData: unknown,
    contentType: string,
    method: string,
    url: string
}

export interface Response {
    requestId: number,
    headers: Record<string,string>,
    body: unknown,
    base64Encoded: boolean,
    contentType: string,
    status: number,
    statusText:string,
    mimeType: string,
    url:string,
    encodedDataLength:string,
    charset:string,
    responseTime:string,
    connectionReused:string,
    fromDiskCache:string,
    fromPrefetchCache:string,
    fromServiceWorker:string,
    protocol:string,
    remoteIPAddress:string,
    remotePort:string,
    securityDetails:string,
    timing:string,
    alternateProtocolUsage:string
}

export interface IRequest {
    requestId: number,
    tabId: number,
    method: string;
    url: string;
    status: string,
    statusLine: string,
    request: Request & Record<string,unknown>,
    response: Response & Record<string,unknown>,
    start: number,
    end: number
}

export interface IPageData {
    html: string,
    styles: string,
    scripts: string
}
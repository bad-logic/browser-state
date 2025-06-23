export interface IRequest {
    requestId: number,
    tabId: number,
    method: string;
    url: string;
    status: string,
    statusLine: string,
    request: {
        requestId: number,
        headers: Record<string,string>,
        postData: unknown,
        contentType: string
    } & Record<string,unknown>,
    response: {
        requestId: number,
        headers: Record<string,string>,
        body: unknown,
        base64Encoded: boolean,
        contentType: string
    } & Record<string,unknown>,
    start: number,
    end: number
}

export interface IPageData {
    html: string,
    styles: string,
    scripts: string
}
export interface IRequest {
    requestId: number,
    tabId: number,
    method: string;
    url: string;
    status: string,
    statusLine: string,
    requestBody: any,
    responseHeaders: any,
    start: number,
    end: number
}

export interface IPageData {
    html: string,
    styles: string,
    scripts: string
}
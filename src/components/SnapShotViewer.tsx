import {useEffect, useRef, useState} from "react";

interface ISnapShotViewer {
    type: string;
    content: string
}

function SnapshotViewer({type, content}: ISnapShotViewer) {

    const codeRef = useRef<HTMLPreElement>(null);
    const [tab,setTab] = useState<string>('');

    useEffect(()=>{
        // @ts-ignore
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log({tabs})
            const currentUrl = tabs.url;
            const domain = new URL(currentUrl).hostname;
            setTab(domain)
            console.log("Current domain:", domain);
        });
    },[])


    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        alert("Copied to clipboard!");
    };

    const handleDownload = () => {
        if (!content) return;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${tab}-snapshot-${new Date().getUTCMilliseconds()}.${type}`;
        a.click();
        URL.revokeObjectURL(url);
        console.log({a,url,tab})
    };

    const lines = content ? content.split("\n") : [];

    return (
        <div className="relative border rounded-lg overflow-hidden bg-gray-900 text-gray-100 font-mono">
            <div className="flex justify-between items-center bg-gray-800 px-4 py-2 border-b border-gray-700">
                <h2 className="font-semibold text-lg">{type.toUpperCase()}</h2>
                <div className="space-x-2">
                    <button
                        onClick={handleCopy}
                        className="p-2 hover:bg-gray-700 rounded transition"
                        title="Copy to clipboard"
                        aria-label="Copy to clipboard"
                    >
                        {/* Clipboard icon */}
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
                                d="M8 16h8M8 12h8m-6 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-2m-4 0H6a2 2 0 00-2 2v12a2 2 0 002 2h2z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="p-2 hover:bg-gray-700 rounded transition"
                        title="Download file"
                        aria-label="Download file"
                    >
                        {/* Download icon */}
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
            </div>
            <div className="flex overflow-auto max-h-[60vh]">
        <pre
            className="select-none bg-gray-800 text-gray-500 text-right pr-4 leading-6"
            aria-hidden="true"
        >
          {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
          ))}
        </pre>
                <pre
                    ref={codeRef}
                    className="flex-1 px-4 py-2 whitespace-pre-wrap leading-6"
                >
          <code>{content || "No content captured"}</code>
        </pre>
            </div>
        </div>
    );
}

export default SnapshotViewer;
import React, {useRef} from "react";

interface ICodeProps {
    code: string;
}

export default function CodeBlock({code,className=""}:ICodeProps & React.HTMLAttributes<HTMLDivElement>){

    const codeRef = useRef<HTMLPreElement>(null);
    const lines = code ? code.split("\n") : [];

    return (
        <div className={`flex overflow-auto ${className}`}>
                <pre
                    className="select-none bg-gray-800 text-gray-500 text-right pr-4 leading-6"
                    aria-hidden="true"
                >
                  {lines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                  ))}
                </pre>
            <pre ref={codeRef} className="flex-1 px-4 py-2 whitespace-pre-wrap leading-6">
                  <code>{code || "No content captured"}</code>
                </pre>
        </div>
    );
}
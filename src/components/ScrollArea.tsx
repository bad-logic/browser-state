import React from "react";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
    maxHeight?: string | number; // e.g. "400px" or 400
};

export const ScrollArea: React.FC<ScrollAreaProps> = ({children, className = "", ...props}) => {

    return (
        <div
            className={`scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 ${className}`}
            style={{
                overflowY: "auto"
            }}
            {...props}
        >
            {children}
        </div>
    );
};
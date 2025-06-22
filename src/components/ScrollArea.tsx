import React from "react";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
    maxHeight?: string | number; // e.g. "400px" or 400
};

export const ScrollArea: React.FC<ScrollAreaProps> = ({children, className = "", maxHeight = "300px", ...props}) => {
    const style =
        typeof maxHeight === "number"
            ? {maxHeight: `${maxHeight}px`, overflowY: "auto"}
            : {maxHeight, overflowY: "auto"};

    return (
        <div
            className={`scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-100 ${className}`}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};
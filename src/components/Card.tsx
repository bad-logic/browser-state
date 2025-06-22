import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({children, className = "", ...props}) => {
    return (
        <div
            className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent: React.FC<CardContentProps> = ({children, className = "", ...props}) => {
    return (
        <div className={`p-4 ${className}`} {...props}>
            {children}
        </div>
    );
};
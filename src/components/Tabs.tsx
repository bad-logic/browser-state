import React, {createContext, useContext, useState} from "react";

type TabsContextType = {
    selected: string;
    setSelected: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

type TabsProps = {
    value: string;
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export const Tabs: React.FC<TabsProps> = ({value, className = "", children}) => {
    const [selected, setSelected] = useState(value);

    return (
        <TabsContext.Provider value={{selected, setSelected}}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export const TabsList: React.FC<TabsListProps> = ({children, className = "", ...props}) => {
    return (
        <div
            className={`flex border-b border-gray-300 bg-gray-100 rounded-t-md ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

type TabsTriggerProps = {
    value: string;
    children: React.ReactNode;
    className?: string;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({value, children, className = ""}) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsTrigger must be used within a Tabs component");

    const {selected, setSelected} = context;
    const isSelected = selected === value;

    return (
        <button
            type="button"
            onClick={() => setSelected(value)}

            className={`px-4 py-2 text-sm font-medium focus:outline-none ${
                isSelected
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-800"
            } ${className}`}
        >
            {children}
        </button>
    );
};

type TabsContentProps = {
    value: string;
    children: React.ReactNode;
    className?: string;
};

export const TabsContent: React.FC<TabsContentProps> = ({value, children, className = ""}) => {
    const context = useContext(TabsContext);
    if (!context) throw new Error("TabsContent must be used within a Tabs component");

    const {selected} = context;

    if (selected !== value) return null;

    return <div className={`p-4 h-[50vh] overflow-auto ${className}`}>{children}</div>;
};
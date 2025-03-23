import { createContext, useContext, useState } from "react";
import { Viewport } from "@xyflow/react";

import { NodeEdgeData } from "@shared/app.types";


interface DiagramContextProps {
    codeView: {
        graphData: NodeEdgeData|undefined;
        setGraphData: React.Dispatch<React.SetStateAction<NodeEdgeData|undefined>>;
        viewport: Viewport|undefined;
        setViewport: React.Dispatch<React.SetStateAction<Viewport|undefined>>;
    };
    componentView: {
        graphData: NodeEdgeData|undefined;
        setGraphData: React.Dispatch<React.SetStateAction<NodeEdgeData|undefined>>;
        viewport: Viewport|undefined;
        setViewport: React.Dispatch<React.SetStateAction<Viewport|undefined>>;
    };
}

interface DiagramProviderProps {
    children: React.ReactNode;
}

const DiagramContext = createContext<DiagramContextProps|undefined>(undefined);

export const DiagramProvider = ({ children }: DiagramProviderProps) => {
    const [codeGraphData, setCodeGraphData] = useState<NodeEdgeData>();
    const [codeViewport, setCodeViewport] = useState<Viewport>();
    const [componentGraphData, setComponentGraphData] = useState<NodeEdgeData>();
    const [componentViewport, setComponentViewport] = useState<Viewport>();

    const ctxObject = {
        codeView: {
            graphData: codeGraphData,
            setGraphData: setCodeGraphData,
            viewport: codeViewport,
            setViewport: setCodeViewport,
        },
        componentView: {
            graphData: componentGraphData,
            setGraphData: setComponentGraphData,
            viewport: componentViewport,
            setViewport: setComponentViewport,
        }
    };

    return (
        <DiagramContext.Provider value={ctxObject}>
            {children}
        </DiagramContext.Provider>
    );
}

export const useDiagramContext = () => {
    return useContext(DiagramContext);
}

import React, { createContext, useContext, useState } from "react";
import { Viewport } from "@xyflow/react";

import { NodeEdgeData } from "@shared/app.types";

import { ViewType } from "../App.types";

export interface DiagramContextView {
    graphData: NodeEdgeData|undefined;
    setGraphData: React.Dispatch<React.SetStateAction<NodeEdgeData|undefined>>;
    viewport: Viewport|undefined;
    setViewport: React.Dispatch<React.SetStateAction<Viewport|undefined>>;
}

interface DiagramContextProps {
    codeView: DiagramContextView;
    componentView: DiagramContextView;
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

export const useDiagramContext = (view: ViewType) => {
    const ctx = useContext(DiagramContext);
    if (!ctx) {
        console.error("Unable to retrieve context!");
        return;
    }

    return (view === ViewType.CODE_VIEW) ? ctx.codeView : ctx.componentView;
}

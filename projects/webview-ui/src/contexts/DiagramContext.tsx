import React, { createContext, useContext, useState } from "react";
import { Viewport } from "@xyflow/react";

import { NodeEdgeData } from "@shared/app.types";
import { FunctionDescription } from "@shared/node.types";

import { ViewType } from "../App.types";
import { initialCompNodes, initialNodes } from "../nodes";
import { initialCompEdges, initialEdges } from "../edges";

interface NodeEdgeDataExtended extends NodeEdgeData {
    isTouched: boolean; // only be false if the data came straight from the extension
}
interface FnDescriptionsByNodeId {
    [key: string]: FunctionDescription[];
}

export interface DiagramContextView {
    graphData: NodeEdgeDataExtended|undefined;
    setGraphData: React.Dispatch<React.SetStateAction<NodeEdgeDataExtended>>;
    viewport: Viewport|undefined;
    setViewport: React.Dispatch<React.SetStateAction<Viewport|undefined>>;
    nodeFnDesc?: FnDescriptionsByNodeId;
    setNodeFnDesc?: React.Dispatch<React.SetStateAction<FnDescriptionsByNodeId>>;
}

interface DiagramContextProps {
    codeView: DiagramContextView;
    componentView: DiagramContextView;
}

const DiagramContext = createContext<DiagramContextProps|undefined>(undefined);

interface DiagramProviderProps {
    children: React.ReactNode;
}

export const DiagramProvider = ({ children }: DiagramProviderProps) => {
    const [codeGraphData, setCodeGraphData] = useState<NodeEdgeDataExtended>({
        nodes: initialNodes,
        edges: initialEdges,
        isTouched: false,
    });
    const [codeViewport, setCodeViewport] = useState<Viewport>();
    const [codeNodeFnDesc, setCodeNodeFnDesc] = useState<FnDescriptionsByNodeId>({});

    const [componentGraphData, setComponentGraphData] = useState<NodeEdgeDataExtended>({
        nodes: initialCompNodes,
        edges: initialCompEdges,
        isTouched: false,
    });
    const [componentViewport, setComponentViewport] = useState<Viewport>();

    const ctxObject = {
        codeView: {
            graphData: codeGraphData,
            setGraphData: setCodeGraphData,
            viewport: codeViewport,
            setViewport: setCodeViewport,
            nodeFnDesc: codeNodeFnDesc,
            setNodeFnDesc: setCodeNodeFnDesc,
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

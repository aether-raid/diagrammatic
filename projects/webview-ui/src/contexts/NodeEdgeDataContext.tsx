import { NodeEdgeData } from "@shared/app.types";
import { createContext, useContext, useState } from "react";

interface NodeEdgeDataContextProps {
  codeNodeEdgeData: NodeEdgeData|undefined;
  setCodeNodeEdgeData: React.Dispatch<React.SetStateAction<NodeEdgeData|undefined>>;

  componentNodeEdgeData: NodeEdgeData|undefined;
  setComponentNodeEdgeData: React.Dispatch<React.SetStateAction<NodeEdgeData|undefined>>;
}

interface NodeEdgeDataProviderProps {
  children: React.ReactNode;
}

const NodeEdgeDataContext = createContext<NodeEdgeDataContextProps|undefined>(undefined);

export const NodeEdgeDataProvider = ({ children }: NodeEdgeDataProviderProps) => {
  const [codeNodeEdgeData, setCodeNodeEdgeData] = useState<NodeEdgeData>();
  const [componentNodeEdgeData, setComponentNodeEdgeData] = useState<NodeEdgeData>();

  return (
    <NodeEdgeDataContext.Provider value={{
      codeNodeEdgeData,
      setCodeNodeEdgeData,
      componentNodeEdgeData,
      setComponentNodeEdgeData
    }}>
      {children}
    </NodeEdgeDataContext.Provider>
  )
}

export const useNodeEdgeDataContext = () => {
  const context = useContext(NodeEdgeDataContext);
  return context;
}

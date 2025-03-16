import { AppNode } from "@shared/node.types";
import { createContext, useContext, useState } from "react";

interface NodeDataContextProps {
  codeNodes: AppNode[]|undefined;
  setCodeNodes: React.Dispatch<React.SetStateAction<AppNode[]|undefined>>;

  componentNodes: AppNode[]|undefined;
  setComponentNodes: React.Dispatch<React.SetStateAction<AppNode[]|undefined>>;
}

interface NodeDataProviderProps {
  children: React.ReactNode;
}

const NodeDataContext = createContext<NodeDataContextProps|undefined>(undefined);

export const NodeDataProvider = ({ children }: NodeDataProviderProps) => {
  const [codeNodes, setCodeNodes] = useState<AppNode[]>();
  const [componentNodes, setComponentNodes] = useState<AppNode[]>();

  return (
    <NodeDataContext.Provider value={{
      codeNodes,
      setCodeNodes,
      componentNodes,
      setComponentNodes
    }}>
      {children}
    </NodeDataContext.Provider>
  )
}

export const useNodeDataContext = () => {
  const context = useContext(NodeDataContext);
  return context;
}
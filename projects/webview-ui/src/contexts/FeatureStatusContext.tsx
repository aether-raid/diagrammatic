import { createContext, useContext, useState } from "react";

import { Feature, FeatureStatus } from "@shared/app.types";


interface FeatureStatusContextProps {
  getFeatureStatus: (feature: Feature) => FeatureStatus;
  setFeatureStatus: (feature: Feature, status: FeatureStatus) => void;
}

interface FeatureStatusProviderProps {
  children: React.ReactNode;
}

const FeatureStatusContext = createContext<FeatureStatusContextProps|undefined>(undefined);

export const FeatureStatusProvider = ({ children }: FeatureStatusProviderProps) => {
  const [componentDiagram, setComponentDiagram] = useState<FeatureStatus>(FeatureStatus.DISABLED);
  const [nodeDescriptions, setNodeDescriptions] = useState<FeatureStatus>(FeatureStatus.DISABLED);

  const getFeatureStatus = (feature: Feature) => {
    switch (feature) {
      case Feature.COMPONENT_DIAGRAM:
        return componentDiagram;
      case Feature.NODE_DESCRIPTIONS:
        return nodeDescriptions;
      default:
        throw new Error(`unknown feature: ${feature}`);
    }
  }

  const setFeatureStatus = (feature: Feature, status: FeatureStatus) => {
    switch (feature) {
      case Feature.COMPONENT_DIAGRAM:
        setComponentDiagram(status);
        return;
      case Feature.NODE_DESCRIPTIONS:
        setNodeDescriptions(status);
        return;
      default:
        throw new Error(`unknown feature: ${feature}`);
    }
  }

  return (
    <FeatureStatusContext.Provider value={{
      getFeatureStatus,
      setFeatureStatus,
    }}>
      {children}
    </FeatureStatusContext.Provider>
  )
}

export const useFeatureStatusContext = () => {
  const context = useContext(FeatureStatusContext);
  return context;
}

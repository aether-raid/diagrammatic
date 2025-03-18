import { MemoryRouter, Route, Routes } from "react-router-dom"

import CodeView from "./CodeView"
import ComponentView from "./ComponentView"
import { NodeEdgeDataProvider } from "./contexts/NodeEdgeDataContext"

export const App = () => {
  return (
    <NodeEdgeDataProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<CodeView />} />
          <Route path="/componentView" element={<ComponentView />} />
        </Routes>
      </MemoryRouter>
    </NodeEdgeDataProvider>
  )
}

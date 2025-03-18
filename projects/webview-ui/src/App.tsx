import { MemoryRouter, Route, Routes } from "react-router-dom"

import CodeView from "./views/CodeView"
import ComponentView from "./views/ComponentView"
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

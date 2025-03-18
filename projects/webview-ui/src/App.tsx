import { MemoryRouter, Route, Routes } from "react-router-dom"

import CodeView from "./CodeView"
import ComponentView from "./ComponentView"
import { NodeDataProvider } from "./NodeDataContext"

export const App = () => {
  return (
    <NodeDataProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<CodeView />} />
          <Route path="/componentView" element={<ComponentView />} />
        </Routes>
      </MemoryRouter>
    </NodeDataProvider>
  )
}

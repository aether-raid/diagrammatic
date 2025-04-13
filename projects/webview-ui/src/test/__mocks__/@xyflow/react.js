const mockSetCenter = jest.fn();
const mockGetNodes = jest.fn().mockReturnValue([]);
const mockSetNodes = jest.fn();
const mockSetEdges = jest.fn();
const mockSetViewport = jest.fn();

const mockUseReactFlow = jest.fn().mockReturnValue({
    getNodes: mockGetNodes,
    setNodes: mockSetNodes,
    setEdges: mockSetEdges,
    setViewport: mockSetViewport,
    setCenter: mockSetCenter,
});

const mockGetNodesBounds = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
});

const mockGetViewportForBounds = jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    zoom: 1,
});

const Panel = ({ children, position }) => (
    <div data-testid="xy-flow-panel" className={`panel-${position}`}>
        {children}
    </div>
);


export const useReactFlow = mockUseReactFlow;
export const getNodesBounds = mockGetNodesBounds;
export const getViewportForBounds = mockGetViewportForBounds;
declare module './__mocks__/@xyflow/react' {
    export const mockSetCenter: jest.Mock<any>;
    export const mockGetNodes: jest.Mock<any>;
    export const mockSetNodes: jest.Mock<any>;
    export const mockSetEdges: jest.Mock<any>;
    export const mockSetViewport: jest.Mock<any>;
    export const mockUseReactFlow: jest.Mock<any>;
    export const mockGetNodesBounds: jest.Mock<any>;
    export const mockGetViewportForBounds: jest.Mock<any>;

    export const useReactFlow: any;
    export const getNodesBounds: any;
    export const getViewportForBounds: any;
}
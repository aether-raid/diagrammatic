import { BaseEdge, EdgeLabelRenderer, EdgeProps, getStraightPath, useReactFlow } from "@xyflow/react"

import { type CustomEdge as CustomEdgeType } from "@shared/edge.types";


export function CustomEdge ({ id, sourceX, sourceY, targetX, targetY }: EdgeProps<CustomEdgeType>) {
    const { setEdges } = useReactFlow();
    const [edgePath, labelX, labelY] = getStraightPath({
        sourceX, sourceY,
        targetX, targetY
    });
    
    const onClick = () => {
        setEdges(edges => edges.filter(e => e.id !== id));
    }

    return (
        <>
            <BaseEdge id={id} path={edgePath} />
            <EdgeLabelRenderer>
                <button className="nodrag nopan" onClick={onClick}
                    style = {{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all'
                    }}
                >
                    Delete
                </button>
            </EdgeLabelRenderer>
        </>
    )
}

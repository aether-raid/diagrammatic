import { Handle, NodeProps, Position } from "@xyflow/react";
import { type EntityCompNode as EntityCompNodeType } from "@shared/compNode.types";


export function EntityCompNode({ data }: NodeProps<EntityCompNodeType>) {

    return (
        <div className='custom__node entity-node'>
                <div className={`p-2 fw-bold rounded-top entity__${data.name}`}>
                    <p>{data.name}</p>
                </div>

            <div style={{ padding: '10px', backgroundColor: '#000000', borderRadius: '5px'}}>
                {data.description && <p>{data.description}</p>}
                {/* {data.files && (
                    <ul>
                        {data.files.map((file, index) => (
                            <li key={index}>{file}</li>
                        ))}
                    </ul>
                )} */}
            </div>


            {/* Handles */}
            <Handle type='source' position={Position.Right} id='comp' />
            <Handle type='target' position={Position.Left} id='comp' />
        </div>
    )
}

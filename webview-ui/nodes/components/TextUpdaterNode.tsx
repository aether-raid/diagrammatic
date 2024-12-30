import { ChangeEvent, useCallback } from "react"

import { Handle, NodeProps, Position } from "@xyflow/react";

import { type TextUpdaterNode } from "../types";


export function TextUpdaterNode ({ isConnectable }: NodeProps<TextUpdaterNode>) {
    const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        console.log(event.target.value);
    }, []);

    return (
        <div className='custom__node text-updater-node'>
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Bottom} id="b" isConnectable={isConnectable} />

            <div>
                <label htmlFor="text">Text:</label>
                <input id="text" name="text" onChange={onChange} className="nodrag" />
            </div>
        </div>
    )
}

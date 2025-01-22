import { useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";

import { EntityNodeItem } from "./EntityNodeItem";
import { type EntityNode } from "@shared/node.types";


export function EntityNode ({ id, data }: NodeProps<EntityNode>) {
  const [hoveredRow, setHoveredRow] = useState<string|undefined>('');

  useEffect(() => {
    console.log('running useEffect to setHoveredEntity');
    if (!data.setHoveredEntity) { return; }

    data.setHoveredEntity(hoveredRow
      ? { nodeId: id, rowId: hoveredRow }
      : undefined
    );
  }, [hoveredRow])

  return (
    <div className='custom__node entity-node'>
      <p className={`p-2 fw-bold rounded-top entity__${data.entityType}`}>{ data.entityName }</p>
      <table>
        <tbody>
          {data.items.map(item => <EntityNodeItem
            key={item.name}
            itemName={item.name}
            highlighted={item.highlighted ?? false}
            setHoveredRow={setHoveredRow}
          />)}
        </tbody>
      </table>

      {/* Handles */}
      <Handle type='target' position={Position.Top} id='entity' />
    </div>
  )
}

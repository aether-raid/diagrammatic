import { useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

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
      <OverlayTrigger
        overlay={
          <Tooltip>
            { data.filePath }
          </Tooltip>
        }
      >
        <div className={`p-2 fw-bold rounded-top entity__${data.entityType}`}>
          <p className={'fs-7 fw-light'}>{ data.entityType }</p>
          <p>{ data.entityName }</p>
        </div>
      </OverlayTrigger>
      <table className='w-100'>
        <tbody>
          {data.items.map(item => <EntityNodeItem
            key={item.name}
            itemName={item.name}
            highlighted={item.highlighted ?? false}
            location={{
              filePath: data.filePath,
              lineNumber: item.lineNumber,
            }}
            setHoveredRow={setHoveredRow}
          />)}
        </tbody>
      </table>

      {/* Handles */}
      <Handle type='target' position={Position.Top} id='entity' />
    </div>
  )
}

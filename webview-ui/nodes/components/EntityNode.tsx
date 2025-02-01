import { useEffect, useState } from "react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import { EntityNodeItem } from "./EntityNodeItem";
import { type EntityNode as EntityNodeType } from "@shared/node.types";


export function EntityNode ({ id, data }: NodeProps<EntityNodeType>) {
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
          <Popover>
            <Popover.Header className="px-3">{ data.filePath }</Popover.Header>
            <Popover.Body className="py-2 px-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Popover.Body>
          </Popover>
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

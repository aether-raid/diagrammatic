import { useEffect, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import { Handle, NodeProps, Position } from "@xyflow/react";

import { type EntityNode as EntityNodeType } from "@shared/node.types";

import { EntityNodeItem } from "./EntityNodeItem";
import { NodeSecurityBanner } from "./NodeSecurityBanner";


export function EntityNode ({ id, data }: NodeProps<EntityNodeType>) {
  const [hoveredRow, setHoveredRow] = useState<string|undefined>('');

  useEffect(() => {
    console.log('running useEffect to setHoveredEntity');
    if (!data.setHoveredEntity) { return; }

    data.setHoveredEntity(hoveredRow
      ? { nodeId: id, rowId: hoveredRow }
      : undefined
    );
  }, [hoveredRow, id])

  return (
    <div className='custom__node entity-node'>
      <OverlayTrigger
        overlay={
          <Popover>
            <Popover.Header className="px-3">{ data.filePath }</Popover.Header>
            <Popover.Body className="py-2 px-3 fst-italic">
              { data.description ?? 'No description available.' }
            </Popover.Body>
          </Popover>
        }
      >
        <div className={`d-flex flex-column rounded-top entity__${data.entityType}`}>
          <div className="py-2">
            <p className="fs-8">{ data.entityType }</p>
            <p className="fw-bold">
              <span className={data.matchesSearchTerm ? "bg-highlighter text-black" : ""}>
                { data.entityName }
              </span>
            </p>
          </div>
          <NodeSecurityBanner security={data.security}/>
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
              lineNumber: item.startPosition.row,
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



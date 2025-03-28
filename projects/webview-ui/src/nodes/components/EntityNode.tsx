import { useEffect, useState } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import { Handle, NodeProps, Position } from "@xyflow/react";

import { type EntityNode as EntityNodeType } from "@shared/node.types";

import { useFeatureStatusContext } from "../../contexts/FeatureStatusContext";
import { EntityNodeItem } from "./EntityNodeItem";
import { NodeSecurityBanner } from "./NodeSecurityBanner";
import { Feature, FeatureStatus } from "@shared/app.types";


export function EntityNode ({ id, data }: NodeProps<EntityNodeType>) {
  const featureStatusCtx = useFeatureStatusContext();
  const nodeDescriptionStatus = featureStatusCtx?.getFeatureStatus(Feature.NODE_DESCRIPTIONS);

  const [hoveredRow, setHoveredRow] = useState<string|undefined>('');

  useEffect(() => {
    console.log('running useEffect to setHoveredEntity');
    if (!data.setHoveredEntity) { return; }

    data.setHoveredEntity(hoveredRow
      ? { nodeId: id, rowId: hoveredRow }
      : undefined
    );
  }, [hoveredRow, id])

  const renderNodeDescriptions = () => {
    switch (nodeDescriptionStatus) {
      case FeatureStatus.DISABLED:
        return "Node descriptions are disabled (No valid API key provided)";
      case FeatureStatus.ENABLED_LOADING:
        return "Descriptions are loading...";
      case FeatureStatus.ENABLED_DONE:
        return data.description ?? "No description available";
    }
  }

  return (
    <div className={`custom__node entity-node overflow-hidden ${data.matchesSearchTerm ? "search-matched-node" : ""}`}>
      <OverlayTrigger
        overlay={
          <Popover>
            <Popover.Header className="px-3 fs-7 fw-semibold">{ data.filePath }</Popover.Header>
            <Popover.Body className="py-2 px-3 fst-italic fs-7">
              { renderNodeDescriptions() }
            </Popover.Body>
          </Popover>
        }
      >
        <div className={`d-flex flex-column entity__${data.entityType}`}>
          <div className="py-2">
            <p className="fs-8">{ data.entityType }</p>
            <p className="fw-bold">{ data.entityName }</p>
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
            itemType={item.type}
            setHoveredRow={setHoveredRow}
          />)}
        </tbody>
      </table>

      {/* Handles */}
      <Handle type='target' position={Position.Top} id='entity' />
    </div>
  )
}



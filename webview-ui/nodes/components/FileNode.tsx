import { useEffect, useState } from "react";
import { NodeProps } from "@xyflow/react";

import { EntityRow } from "./EntityRow";
import { type FileNode } from "@shared/node.types";


export function FileNode ({ id, data }: NodeProps<FileNode>) {
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
    <div className='custom__node file-node'>
      <p className="p-2 fw-bold rounded-top bg-primary">{ data.fileName }</p>
      <table>
        <tbody>
          {data.entities.map(entity => <EntityRow
            key={entity.name}
            fnName={entity.name}
            highlighted={entity.highlighted ?? false}
            setHoveredRow={setHoveredRow}
          />)}
        </tbody>
      </table>
    </div>
  )
}

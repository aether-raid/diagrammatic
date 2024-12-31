import { NodeProps } from "@xyflow/react";

import { EntityRow } from "./EntityRow";
import { type FileNode } from "../types";


export function FileNode ({ data }: NodeProps<FileNode>) {
  return (
    <div className='custom__node file-node'>
      <p className="p-2 fw-bold rounded-top bg-primary">{ data.fileName }</p>
      <table>
        <tbody>
          {data.entities.map(entityName => <EntityRow fnName={entityName} />)}
        </tbody>
      </table>
    </div>
  )
}

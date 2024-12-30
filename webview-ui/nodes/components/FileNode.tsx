import { NodeProps } from "@xyflow/react";

import { FunctionRow } from "./FunctionRow";
import { type FileNode } from "../types";


export function FileNode ({ data }: NodeProps<FileNode>) {
  return (
    <div className='custom__node file-node'>
      <p className="p-2 fw-bold rounded-top bg-primary">{ data.fileName }</p>
      <table>
        <tbody>
          <FunctionRow fnName='harvestPotato' />
          <FunctionRow fnName='harvestCorn' />
        </tbody>
      </table>
    </div>
  )
}

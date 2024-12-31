import { Handle, Position } from "@xyflow/react";


interface FunctionRowProps {
  fnName: string;
}

export function FunctionRow ({ fnName }: FunctionRowProps) {
  return (
    <tr>
      <td className="px-3 py-2 position-relative">
        { fnName }

        {/* Handles */}
        <Handle type='target' position={Position.Left} id={`${fnName}-target`} />
        <Handle type='source' position={Position.Right} id={`${fnName}-source`} />
      </td>
    </tr>
  )
};

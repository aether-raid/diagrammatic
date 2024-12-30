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
        <Handle type='source' position={Position.Left} />
        <Handle type='target' position={Position.Left} />
        <Handle type='source' position={Position.Right} />
        <Handle type='target' position={Position.Right} />
      </td>
    </tr>
  )
};

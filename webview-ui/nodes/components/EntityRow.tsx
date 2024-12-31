import { Handle, Position } from "@xyflow/react";


interface EntityRowProps {
  fnName: string;
}

export function EntityRow ({ fnName }: EntityRowProps) {
  return (
    <tr>
      <td className="px-3 py-2 position-relative">
        { fnName }

        {/* Handles */}
        <Handle type='target' position={Position.Left} id={fnName} />
        <Handle type='source' position={Position.Right} id={fnName} />
      </td>
    </tr>
  )
};

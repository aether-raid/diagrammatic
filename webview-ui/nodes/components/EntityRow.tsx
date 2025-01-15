import { Handle, Position } from "@xyflow/react";


interface EntityRowProps {
  fnName: string;
  highlighted: boolean;
  setHoveredRow: React.Dispatch<React.SetStateAction<string|undefined>>;
}

export function EntityRow ({ fnName, highlighted, setHoveredRow }: EntityRowProps) {
  const onMouseEnter = () => setHoveredRow(fnName);
  const onMouseLeave = () => setHoveredRow(undefined);

  return (
    <tr
      className={highlighted ? 'highlighted-row' : ''}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <td className="px-3 py-2 position-relative">
        { fnName }

        {/* Handles */}
        <Handle type='target' position={Position.Left} id={fnName} />
        <Handle type='source' position={Position.Right} id={fnName} />
      </td>
    </tr>
  )
};

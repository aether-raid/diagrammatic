import { Handle, Position } from "@xyflow/react";


interface EntityNodeItemProps {
  itemName: string;
  highlighted: boolean;
  setHoveredRow: React.Dispatch<React.SetStateAction<string|undefined>>;
}

export function EntityNodeItem ({ itemName, highlighted, setHoveredRow }: EntityNodeItemProps) {
  const onMouseEnter = () => setHoveredRow(itemName);
  const onMouseLeave = () => setHoveredRow(undefined);

  return (
    <tr
      className={highlighted ? 'highlighted-row' : ''}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <td className="px-3 py-2 position-relative">
        { itemName }

        {/* Handles */}
        <Handle type='target' position={Position.Left} id={itemName} />
        <Handle type='source' position={Position.Right} id={itemName} />
      </td>
    </tr>
  )
};

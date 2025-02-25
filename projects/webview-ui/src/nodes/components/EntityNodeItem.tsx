import React from "react";
import { Handle, Position } from "@xyflow/react";

import { sendJumpToLineMessageToExtension } from "../../helpers/vscodeApiHandler";
import { CodeLocation } from "../../App.types";


interface EntityNodeItemProps {
  itemName: string;
  highlighted: boolean;
  location: CodeLocation;
  setHoveredRow: React.Dispatch<React.SetStateAction<string|undefined>>;
}

export function EntityNodeItem ({ itemName, highlighted, location, setHoveredRow }: EntityNodeItemProps) {
  const onMouseEnter = () => setHoveredRow(itemName);
  const onMouseLeave = () => setHoveredRow(undefined);

  const onRowClick = () => {
    if (location.filePath === undefined || location.lineNumber === undefined) {
      console.error(`Unknown filePath (${location.filePath}) or lineNumber (${location.lineNumber})!`);
      return;
    }
    console.log(`filePath (${location.filePath}) and lineNumber (${location.lineNumber})!`);
    sendJumpToLineMessageToExtension(location.filePath, location.lineNumber);
  }

  return (
    <tr
      className={highlighted ? 'highlighted-row' : ''}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onRowClick}
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

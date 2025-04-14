import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import { SerializedDiagnostic } from "@shared/vscode.types";

import { sendJumpToLineMessageToExtension } from '../../helpers/vscodeApiHandler';

import "./styles/IssueItem.css";

interface IssueItemProps {
  issue: SerializedDiagnostic;
  filePath?: string;
}

export const IssueItem = ({ issue, filePath }: IssueItemProps) => {
  const { range } = issue;

  const handleClick = () => {
    if (!filePath) {
      console.error(`Unknown filePath (${filePath})`);
      return;
    }
    sendJumpToLineMessageToExtension(filePath, range.start.line);
  };

  return (
    <div
      onClick={handleClick}
      className="d-flex justify-content-between gap-3 px-3 p-2 border-bottom user-select-none cursor-pointer issue-item-hover fs-7"
    >
      <div className='d-flex align-items-center text-nowrap'>Line { range.start.line + 1 }</div>
      <OpenInNewRoundedIcon fontSize='small' />
    </div>
  );
}

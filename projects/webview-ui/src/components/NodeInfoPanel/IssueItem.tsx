import { SerializedDiagnostic } from "@shared/vscode.types";

import { sendJumpToLineMessageToExtension } from '../../helpers/vscodeApiHandler';

import "./styles/IssueItem.css";

interface IssueItemProps {
  issue: SerializedDiagnostic;
  filePath?: string;
}

export const IssueItem = ({ issue, filePath }: IssueItemProps) => {
  const { message, range } = issue;

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
      <span>{ message }</span>
      <div className='d-flex border-start ps-2 align-items-center fst-italic text-nowrap'>
        <span>Line { range.start.line }</span>
      </div>
    </div>
  );
}

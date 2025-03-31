import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import LaunchIcon from '@mui/icons-material/Launch';

import { DiagnosticSeverityEnum, SerializedDiagnostic } from "@shared/vscode.types";

import { sendJumpToLineMessageToExtension } from '../../helpers/vscodeApiHandler';


interface IssueItemProps {
  issue: SerializedDiagnostic;
  filePath?: string;
}

export const IssueItem = ({ issue, filePath }: IssueItemProps) => {
  const { message, range, severity } = issue;

  const bgColor = severity === DiagnosticSeverityEnum.Error
    ? 'bg-danger'
    : 'bg-warning';

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
      className={
        `d-flex justify-content-between gap-3 px-3 p-2 border-bottom ${bgColor} bg-opacity-25 user-select-none cursor-pointer issue-text-hover fs-7`}
    >
      <div className='d-flex gap-2 align-items-center'>
        { severity === DiagnosticSeverityEnum.Warning && <WarningRoundedIcon /> }
        { severity === DiagnosticSeverityEnum.Error && <DangerousRoundedIcon /> }
        <span>{ message }</span>
      </div>
      <div className='d-flex align-items-center fst-italic text-nowrap'>
        <span>Line { range.start.line }</span>
      </div>

    </div>
  );
}
export const LineItem = ({ lineNumber, filePath }: {lineNumber: number, filePath:string|undefined}) => {

  const handleClick = () => {
    if (!filePath) {
      console.error(`Unknown filePath (${filePath})`);
      return;
    }

    sendJumpToLineMessageToExtension(filePath, lineNumber);
  };

  const displayLine = Math.max(0, lineNumber) + 1;
  return (
    <div
      onClick={handleClick}
      className={
        `d-flex justify-content-between align-items-center gap-3 px-3 py-1 user-select-none cursor-pointer issue-text-hover`}
    >
        <span className='fs-7 font-weight-normal text-nowrap'>Line&nbsp;{ displayLine }</span>
        <LaunchIcon style={{fontSize: '16px'}}/>
    </div>
  );
}

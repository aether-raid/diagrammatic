import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { DiagnosticSeverityEnum, SerializedDiagnostic } from "@shared/vscode.types";

import { sendJumpToLineMessageToExtension } from '../../helpers/vscodeApiHandler';


interface IssueItemProps {
  issue: SerializedDiagnostic;
  filePath: string;
}

export const IssueItem = ({ issue, filePath }: IssueItemProps) => {
  const { message, range, severity } = issue;

  const bgColor = severity === DiagnosticSeverityEnum.Error
    ? 'bg-danger-subtle'
    : 'bg-warning-subtle';

  const handleClick = () => {
    sendJumpToLineMessageToExtension(filePath, range.start.line);
  };

  return (
    <div
      onClick={handleClick}
      className={`d-flex justify-content-between gap-3 p-3 border-bottom ${bgColor}`}
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

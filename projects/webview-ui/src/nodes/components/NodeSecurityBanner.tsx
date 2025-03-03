import DangerousRoundedIcon from '@mui/icons-material/DangerousRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { EntityLintData } from "@shared/node.types";
import { DiagnosticSeverityEnum, SerializedDiagnostic } from "@shared/vscode.types";
import { useEffect, useState } from 'react';

interface NodeSecurityBannerProps {
  security?: EntityLintData
}

export const NodeSecurityBanner = ({ security }: NodeSecurityBannerProps) => {
  const [warningCount, setWarningCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

  const displaySecurityBannerCondition =
      security
      && (
        (security.clean?.length ?? 0) > 0
        || (security.vulnerability?.length ?? 0) > 0
        || (security.extras?.length ?? 0) > 0
      );

  const countIssuesBySeverity = (severity: DiagnosticSeverityEnum) => {
    let count = 0;
    (Object.entries(security ?? []) as [string, SerializedDiagnostic[]][])
      .map(([_type, issues]) => {
        count += issues.reduce((total, issue) => (issue.severity === severity ? total + 1 : total), 0)
      })

    return count;
  }

  useEffect(() => {
    setWarningCount(countIssuesBySeverity(DiagnosticSeverityEnum.Warning));
    setErrorCount(countIssuesBySeverity(DiagnosticSeverityEnum.Error));
  }, [security]);

  return (
    <>
      { displaySecurityBannerCondition &&
        <div className="d-flex justify-content-evenly bg-black bg-opacity-75">
          { warningCount > 0 &&
            <div className="text-warning">
              <WarningRoundedIcon fontSize="small" />
              <span className="align-middle">{warningCount}</span>
            </div>
          }

          { errorCount > 0 &&
            <div className="text-danger">
              <DangerousRoundedIcon fontSize="small" />
              <span className="align-middle">{errorCount}</span>
            </div>
          }
        </div>
      }
    </>
  );
}

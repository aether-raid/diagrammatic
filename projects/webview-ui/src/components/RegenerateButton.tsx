import { getVsCodeApi } from "../helpers/vscodeApiHandler";

interface RegenerateButtonProps {
    label: string;
    disabled?: boolean;
  }

export const RegenerateButton = ({
    label,
    disabled = false,
}: RegenerateButtonProps) => {
    const handleRegenerateDiagram  = () =>  {
        const vscode = getVsCodeApi();
        vscode.postMessage({
            command: 'get-component-diagram',
        });
    }
    return (
        <button onClick={handleRegenerateDiagram} disabled={disabled}>
            {label}
        </button>
    )
};

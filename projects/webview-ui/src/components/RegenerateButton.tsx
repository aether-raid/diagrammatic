import React from 'react'; // Do not remove this (for testing)
import { sendRegenerateComponentDiagramMessageToExtension } from "../helpers/vscodeApiHandler";

interface RegenerateButtonProps {
    label: string;
    disabled?: boolean;
    onRegenerate?: () => void;
}

export const RegenerateButton = ({
    label,
    disabled = false,
    onRegenerate,
}: RegenerateButtonProps) => {
    const handleRegenerateDiagram = () =>  {
        if (onRegenerate) onRegenerate();
        sendRegenerateComponentDiagramMessageToExtension();
    }
    return (
        <button onClick={handleRegenerateDiagram} disabled={disabled}>
            {label}
        </button>
    )
};

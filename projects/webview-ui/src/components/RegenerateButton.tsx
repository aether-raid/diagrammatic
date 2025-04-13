import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { sendRegenerateComponentDiagramMessageToExtension } from "../helpers/vscodeApiHandler";
import { HiddenLabelButton } from "./HiddenLabelButton/HiddenLabelButton";

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
        <HiddenLabelButton
            icon={<RefreshRoundedIcon />}
            label={label}
            onClick={handleRegenerateDiagram}
            disabled={disabled}
        />
    )
};

import { useNavigate } from "react-router-dom";

import FlipCameraAndroidRoundedIcon from '@mui/icons-material/FlipCameraAndroidRounded';

import { HiddenLabelButton } from "./HiddenLabelButton/HiddenLabelButton";

interface NavigationButtonProps {
  target: string;
  label: string;
  disabled?: boolean;
  onNavigate?: () => void;
}

export const NavigationButton = ({
    target,
    label,
    disabled = false,
    onNavigate,
}: NavigationButtonProps) => {
    const navigate = useNavigate();

    const onNavigateClick = () => {
        if (onNavigate) onNavigate();
        navigate(target); // Navigate to the new page
    };

    return (
        <HiddenLabelButton
            icon={<FlipCameraAndroidRoundedIcon />}
            label={label}
            onClick={onNavigateClick}
            disabled={disabled}
        />
    )
};

import { useNavigate } from "react-router-dom";

interface NavigationButtonProps {
  target: string;
  label: string;
  onNavigate?: () => void;
}

export const NavigationButton = ({ target, label, onNavigate }: NavigationButtonProps) => {
    const navigate = useNavigate();

    const onNavigateClick = () => {
        if (onNavigate) onNavigate();
        navigate(target); // Navigate to the new page
    };

    return (
        <button onClick={onNavigateClick} >
            {label}
        </button>
    )
};

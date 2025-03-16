import { useNavigate } from "react-router-dom";

interface ComponentButtonProps {
  onNavigate?: () => void;
}

export const ComponentButton = ({ onNavigate }: ComponentButtonProps) => {
    const navigate = useNavigate();

    const onNavigateClick = () => {
        if (onNavigate) onNavigate();
        navigate("/compView"); // Navigate to the new page
    };

    return (
        <button onClick={onNavigateClick} >
            Component View
        </button>
    )
};

import { ReactNode } from "react";
import Button from "react-bootstrap/esm/Button"

import "./HiddenLabelButton.css"

interface HiddenLabelButtonProps {
    icon: ReactNode;
    label: string;
    variant?: string;
    [key: string]: any;
}

export const HiddenLabelButton = ({
    icon,
    label,
    variant="light",
    ...props
}: HiddenLabelButtonProps) => {
    return (
        <Button
            variant={variant}
            className="hidden-label-button"
            {...props}
        >
            {icon}
            <span className="ms-1 align-middle">{label}</span>
        </Button>
    )
}

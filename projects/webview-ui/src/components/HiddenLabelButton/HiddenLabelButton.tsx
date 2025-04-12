import { ReactNode } from "react";
import Button from "react-bootstrap/esm/Button"

import "./HiddenLabelButton.css"

interface HiddenLabelButtonProps {
    icon: ReactNode;
    label: string;
    alwaysShowLabel?: boolean; // turns it into a normal button
    variant?: string;
    [key: string]: any; // eslint-disable-line  @typescript-eslint/no-explicit-any -- passes in extra props to the button
}

export const HiddenLabelButton = ({
    icon,
    label,
    alwaysShowLabel=false,
    variant="light",
    ...props
}: HiddenLabelButtonProps) => {
    return (
        <Button
            variant={variant}
            size="sm"
            className={`${alwaysShowLabel ? "" : "hidden-label-button"}`}
            {...props}
        >
            {icon}
            <span className="ms-1 align-middle">{label}</span>
        </Button>
    )
}

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';

import { HiddenLabelButton } from "./HiddenLabelButton/HiddenLabelButton";

interface AutoLayoutButtonProps {
    handleLayout: (direction: string) => void;
}

export const AutoLayoutButton = ({
    handleLayout,
}: AutoLayoutButtonProps) => {
    return (
        <HiddenLabelButton
            icon={<GridViewRoundedIcon />}
            label="Auto Layout"
            onClick={() => handleLayout("LR")}
        />
    )
};

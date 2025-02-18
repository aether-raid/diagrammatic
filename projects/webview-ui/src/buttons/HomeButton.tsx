import { Panel } from "@xyflow/react";

import { useNavigate } from "react-router-dom";


function HomeButton(){
    const navigate = useNavigate();
    const onNavigateClick = () => {
        navigate("/"); // Navigate to the new page
    };

    return (
        <Panel position="top-right">
            <button style={{marginTop: "24px"}} onClick={onNavigateClick} >
                Code View
            </button>
        </Panel>
    )
};

export default HomeButton;

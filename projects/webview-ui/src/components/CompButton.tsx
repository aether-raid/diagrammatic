import { Panel } from "@xyflow/react";

import { useNavigate } from "react-router-dom";


function ComponentButton(){
    const navigate = useNavigate();
    const onNavigateClick = () => {
        navigate("/compView"); // Navigate to the new page
    };

    return (
        <Panel position="top-right">
            <button style={{marginTop: "24px"}} onClick={onNavigateClick} >
                Component View
            </button>
        </Panel>
    )
};

export default ComponentButton;

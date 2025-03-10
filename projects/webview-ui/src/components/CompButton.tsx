import { useNavigate } from "react-router-dom";


function ComponentButton(){
    const navigate = useNavigate();
    const onNavigateClick = () => {
        navigate("/compView"); // Navigate to the new page
    };

    return (
        <button onClick={onNavigateClick} >
            Component View
        </button>
    )
};

export default ComponentButton;

import { useNavigate } from "react-router-dom";


function HomeButton(){
    const navigate = useNavigate();
    const onNavigateClick = () => {
        navigate("/"); // Navigate to the new page
    };

    return (
        <button onClick={onNavigateClick} >
            Code View
        </button>
    )
};

export default HomeButton;

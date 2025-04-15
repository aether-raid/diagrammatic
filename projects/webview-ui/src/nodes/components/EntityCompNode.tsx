import { Handle, NodeProps, Position } from "@xyflow/react";
import { type ComponentEntityNode as ComponentEntityNodeType } from "@shared/node.types";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { sendJumpToLineMessageToExtension } from "../../helpers/vscodeApiHandler";

export function EntityCompNode({ data }: NodeProps<ComponentEntityNodeType>) {
    function extractFileName(filePath: string): string | null {
        const match = filePath.match(/([^\\]+)$/);
        return match ? match[1] : null;
    }

    const onFileClick = (filePath: string) => {
        sendJumpToLineMessageToExtension(filePath, 0);
    }
    return (
        <div className='custom__node entity-comp-node p-0' style={{ width: "250px" }}>
            <div className={`p-2 fw-bold rounded-top`}>
                <p>{data.name}</p>
            </div>

            <div className="p-2 bg-black rounded-bottom">
                {data.description && <p>{data.description}</p>}
                <div style={{ marginTop: "10px" }}>
                    <Accordion
                        sx={{ width: '100%', backgroundColor: "#222222" }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon style={{ color: "#FFFFFF" }} />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            style={{ minHeight: "0px", height: "30px" }}
                        >
                            <p style={{ color: "#FFFFFF" }}>View files</p>
                        </AccordionSummary>
                        <AccordionDetails>
                            <p style={{ color: "#FFFFFF", wordWrap: 'break-word' }}>
                                {data.files && (
                                    <ul>
                                        {data.files.map((file: string) => (
                                            <div key={extractFileName(file)} className="center-container">
                                                <button
                                                    key={extractFileName(file)}
                                                    style={{ color: "#FFFFFF", margin: "2px 0px" }}
                                                    className="text-button"
                                                    onClick={() => onFileClick(file)}>{extractFileName(file)}</button>
                                            </div>
                                        ))}
                                    </ul>
                                )}
                            </p>
                        </AccordionDetails>
                    </Accordion>
                </div>
            </div>


            {/* Handles */}
            <Handle type='source' position={Position.Right} id='comp' />
            <Handle type='target' position={Position.Left} id='comp' />
        </div>
    )
}

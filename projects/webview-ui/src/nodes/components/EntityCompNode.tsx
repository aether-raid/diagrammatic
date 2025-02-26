import { Handle, NodeProps, Position } from "@xyflow/react";
import { type EntityCompNode as EntityCompNodeType } from "@shared/compNode.types";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export function EntityCompNode({ data }: NodeProps<EntityCompNodeType>) {
    function extractFileName(filePath: string): string | null {
        const match = filePath.match(/([^\\]+)$/);
        return match ? match[1] : null;
    }
    return (
        <div className='custom__node entity-node' style={{ width: "250px" }}>
            <div className={`p-2 fw-bold rounded-top entity__${data.name}`}>
                <p>{data.name}</p>
            </div>

            <div style={{ padding: '10px', backgroundColor: '#000000', borderRadius: '5px' }}>
                {data.description && <p>{data.description}</p>}
                <div style={{ marginTop: "10px" }}>
                    <Accordion
                        sx={{ width: '100%', backgroundColor: "#222222" }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon style={{ color: "#FFFFFF" }} />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            style={{ minHeight:"0px", height:"30px"}}
                        >
                            <p style={{ color: "#FFFFFF" }}>View files</p>
                        </AccordionSummary>
                        <AccordionDetails>
                            <p style={{ color: "#FFFFFF" }}>
                                {data.files && (
                                    <ul>
                                        {data.files.map((file, index) => (
                                            <li key={extractFileName(file)} style={{color: "#FFFFFF", margin:"2px 0px"}}>{extractFileName(file)}</li>
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

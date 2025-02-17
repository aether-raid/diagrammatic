import { Accordion, AccordionTrigger, AccordionItem, AccordionContent, AccordionHeader } from "@radix-ui/react-accordion";
import { ReactElement } from "react";
import { MdOutlineSecurity, MdOutlineCleaningServices, MdErrorOutline, MdOutlineWarningAmber } from "react-icons/md"; 
import { BsChevronDown } from "react-icons/bs";

import { DiagnosticSeverityEnum, SerializedDiagnostic } from "@shared/vscode.types";

import { sendJumpToLineMessageToExtension } from "../../vscodeApiHandler";


const NodeLints = ({lints, filePath}: {lints: {
    clean?: SerializedDiagnostic[];
    vulnerability?: SerializedDiagnostic[];
    extras?: SerializedDiagnostic[];
} | undefined, filePath: string|undefined}) => {
    if (!lints) {return <></>}
    const { clean, vulnerability } = lints;

    return (
        <>
            {(clean && clean.length > 0)
                && <NodeIssue filePath={filePath} header="clean-code" issues={clean} Icon={<MdOutlineCleaningServices style={{ marginRight: '8px' }}/>}/>}

            {(vulnerability && vulnerability.length > 0)
                && <NodeIssue filePath={filePath} header="Security" issues={vulnerability} Icon={<MdOutlineSecurity style={{ marginRight: '8px' }}/>}/>}
        </>
    );
}

const NodeItem = ({issue, filePath}: {issue: SerializedDiagnostic, filePath: string|undefined}) => {
    const {message, range, severity} = issue;

    try {
        // console.log("range ", range);
        
        // TODO: look into this
        // not sure why it is not following the type definition
        const lineNumber = range.start.line;
        if (!lineNumber) { throw new Error('No line number found!'); }

        const onRowClick = () => {
            if (!lineNumber || !filePath) {
                console.error(`Unknown filePath (${filePath}) or lineNumber (${lineNumber + 1})!`);
                return;
            }
            sendJumpToLineMessageToExtension(filePath, lineNumber);
        }

        return (
            <div
                onClick={() => onRowClick()}
                style={{
                    width: '100%',
                    cursor: 'pointer',
                    padding: '10px',
                    border: '1px solid #ccc',
                    margin: '5px 0',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <p>{message}</p>
                <p>Line: {lineNumber}</p>
                {severity === DiagnosticSeverityEnum.Error && <MdOutlineWarningAmber />}
                {severity === DiagnosticSeverityEnum.Warning && <MdErrorOutline />}
            </div>
        )
    } catch (error) {
        console.error('Error rendering NodeItem: ', error);
        return <></>
    }
}


const NodeIssue = ({issues, header, Icon, filePath}: {issues: SerializedDiagnostic[], header: string, Icon: ReactElement<any, any>, filePath: string|undefined}) => {
    if(!issues || issues.length < 1){return <></>}
    console.table(issues);
  return (
    <tr>
        <td className="px-3 py-2 position-relative" style={{ backgroundColor: '#cfa000' }}>
            <div className="d-flex align-items-center" style={{ width: '100%' }}>
            <Accordion type="single" collapsible style={{ width: '100%' }}>
                <AccordionItem value={header}>
                    <AccordionHeader>
                        <AccordionTrigger style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', border: 'none', backgroundColor: '#cfa000', color:'#ffffff', paddingBottom:'10px', paddingTop:'10px' }}>
                            {Icon}
                            <p className="mb-0" style={{ flexGrow: 1 }}>{header}</p>
                            <BsChevronDown style={{ marginLeft: '8px' }}/>
                        </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                        {
                            issues.map((issue) => <NodeItem issue={issue} filePath={filePath} key={`${filePath}<line: ${issue.range.start.line}>-${issue.message}`}/>)
                        }
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            </div>
        </td>
    </tr>
  )
}

export default NodeLints
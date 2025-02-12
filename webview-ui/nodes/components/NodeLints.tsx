import { Accordion, AccordionTrigger, AccordionItem, AccordionContent, AccordionHeader } from "@radix-ui/react-accordion";
import { MdOutlineSecurity, MdOutlineCleaningServices, MdErrorOutline, MdOutlineWarningAmber } from "react-icons/md"; 
import { BsChevronDown } from "react-icons/bs";
import { type Diagnostic } from "vscode";
import { ReactElement } from "react";
import { sendJumpToLineMessageToExtension } from "../../vscodeApiHandler";
import { DiagnosticSeverity } from "@shared/app.types";

const NodeLints = ({lints, filePath}: {lints:{
    clean?: Diagnostic[];
    vulnerability?: Diagnostic[];
    extras?: Diagnostic[];
} | undefined, filePath: string|undefined}) => {
    if (!lints){return <></>}
    const { clean, vulnerability } = lints;

    return <>
        {(clean && clean.length > 0) && <NodeIssue filePath={filePath} header="clean-code" issues={clean} Icon={<MdOutlineCleaningServices style={{ marginRight: '8px' }}/>}/>}
        {(vulnerability && vulnerability.length > 0) && <NodeIssue filePath={filePath} header="Security" issues={vulnerability} Icon={<MdOutlineSecurity style={{ marginRight: '8px' }}/>}/>}
    </>
}

const NodeItem = ({issue, filePath}: {issue: Diagnostic, filePath: string|undefined}) => {
    const {message, range, severity} = issue;

    try {
        console.log("range ", range);
        
        // not sure why it is not following the type definition
        const lineNumber = range[0].line
        if (!lineNumber) {throw new Error('No line number found!');}
        const onRowClick = () => {
            if (!lineNumber || !filePath) {
            console.error(`Unknown filePath (${filePath}) or lineNumber (${lineNumber + 1})!`);
            return;
            }
            sendJumpToLineMessageToExtension(filePath, lineNumber);
        }

        
        return <div 
        onClick={() => onRowClick()}
        style={{ width: '100%', cursor: 'pointer', padding: '10px', border: '1px solid #ccc', margin: '5px 0', flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
            <p>{message}</p>
            <p>Line: {lineNumber}</p>
            {severity === DiagnosticSeverity.Error && <MdOutlineWarningAmber />}
            {severity === DiagnosticSeverity.Warning && <MdErrorOutline />}
        </div>
        
    } catch (error) {
        console.error('Error rendering NodeItem: ', error);
        return <></>
    }
}


const NodeIssue = ({issues, header, Icon, filePath}: {issues: Diagnostic[], header: string, Icon: ReactElement<any, any>, filePath: string|undefined}) => {
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
                            issues.map((issue) => <NodeItem issue={issue} filePath={filePath} key={`${filePath}-${issue.code?.toString}`}/>)
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
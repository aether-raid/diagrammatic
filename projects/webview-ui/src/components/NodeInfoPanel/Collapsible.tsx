import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { DiagnosticSeverityEnum } from "@shared/vscode.types"
import React, { JSX, useState } from "react"

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}
function ChevronsUpDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-chevrons-up-down"
      {...props}
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  );
}

const CollapsibleGroup = ({source, message, severity, children}: {source:string, message:string, severity:number, children: JSX.Element[]}) => {
    const bgColor = severity === DiagnosticSeverityEnum.Error
        ? 'bg-danger'
        : 'bg-warning';
    
    const [isOpen, setIsOpen] = useState(false)

    return <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-[350px] mb-1"
        >
            <div className={`d-flex px-3 py-1 items-center d-flex justify-content-between gap-3 ${bgColor} bg-opacity-25`}>
                <p className="d-flex align-items-center fs-7">
                    Rule:&nbsp;
                    <span className="fw-normal">{source}</span>
                </p>
                <CollapsibleTrigger asChild>
                    <button className={`border-0 p-0 h-8 rounded-md pl-3 bg-transparent user-select-none cursor-pointer issue-text-hover`}>
                        <ChevronsUpDown width={16} height={16}/>
                    </button>
                </CollapsibleTrigger>
                
            </div>
            <CollapsibleContent>
                <p className="px-3 pt-1 pb-3 fs-7"> Description:&nbsp;
                    <span className=" ">{message}</span>
                </p>
                {...children}
            </CollapsibleContent>
        </Collapsible>
}
export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleGroup }

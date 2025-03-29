import { FunctionDescription } from "@shared/node.types";
import { DiagramContextView } from "../contexts/DiagramContext";

export const attachFnDescriptionsToNode = (
    ctxRef: DiagramContextView,
    nodeId: string,
    data: FunctionDescription[],
) => {
    const node = ctxRef.graphData?.nodes.find(node => node.id === nodeId);
    if (!node || node.type !== "entity") {
        console.error("Unable to locate node.");
        return;
    }

    const tmpItems = node.data.items.map(row => {
        const desc = data.find(d => d.function_name === row.name);
        row.documentation = desc;
        return row;
    })
    node.data.items = tmpItems;
}

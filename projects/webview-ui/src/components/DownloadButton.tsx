// @ts-ignore: React is needed for testing, but not used in the component
import React from 'react'; 
import {
    useReactFlow,
    getNodesBounds,
    getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";

import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

import { HiddenLabelButton } from "./HiddenLabelButton/HiddenLabelButton";


function downloadImage(dataUrl: string) {
    const a = document.createElement("a");

    a.setAttribute("download", "reactflow.png");
    a.setAttribute("href", dataUrl);
    a.click();
}

const imageWidth = 3840;
const imageHeight = 2160;

interface DownloadButtonProps {
    minZoom?: number;
    maxZoom?: number;
}

function DownloadButton({minZoom, maxZoom}: DownloadButtonProps) {
    const { getNodes } = useReactFlow();

    const onClick = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getNodesBounds(getNodes());
        const viewport = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            minZoom ?? 0.5,
            maxZoom ?? 2,
            0.02 // padding
        );
        const viewportEl = document.querySelector<HTMLElement>('.react-flow__viewport');
        if (!viewportEl) return;

        const paths = viewportEl.querySelectorAll<SVGPathElement>('.react-flow__edges path');
        paths.forEach((path) => {
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '2');
        });
        const labels = viewportEl.querySelectorAll<SVGTextElement>('.react-flow__edge-textwrapper text');
        labels.forEach((text) => {
        text.setAttribute('fill', 'white');  // or any color you want for the labels
        });

        toPng(viewportEl, {
            backgroundColor: "#000000",
            width: imageWidth,
            height: imageHeight,
            style: {
                width: "" + imageWidth,
                height: "" + imageHeight,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
        }).then(downloadImage);
    };

    return (
        <>
            <HiddenLabelButton
                icon={<DownloadRoundedIcon />}
                label="Download Diagram"
                onClick={onClick}
            />
        </>
    );
}

export default DownloadButton;

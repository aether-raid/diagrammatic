import { useState, useCallback, useEffect } from "react";
import { Panel, XYPosition } from "@xyflow/react";

import Button from 'react-bootstrap/Button';

import { AppNode } from "@shared/node.types";

interface SearchBarProps {
    nodes: AppNode[];
    setCenter: (x: number, y: number, options?: { zoom?: number }) => void;
    matchedNodesState: [AppNode[], React.Dispatch<React.SetStateAction<AppNode[]>>];
}

const SearchBar: React.FC<SearchBarProps> = ({
  nodes,
  setCenter,
  matchedNodesState: [matchedNodes, setMatchedNodes],
}) => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

    const zoomAndCenterPosition = (position: XYPosition, zoomLevel: number = 1.5) => {
        const { x, y } = position;
        setCenter(x, y, { zoom: zoomLevel });
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            jumpToNextMatch();
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    useEffect(() => {
        if (!searchInput) {
            setMatchedNodes([]);
            return;
        }

        // Search nodes by title
        const matches = nodes.filter((node) => {
            if (node.data && "entityName" in node.data) {
                return node.data.entityName
                    .toLowerCase()
                    .includes(searchInput.toLowerCase());
            }
            return false;
        });

        setMatchedNodes(matches);
        setCurrentMatchIndex(-1); // Handled & reset to 0 by the useEffect for currentMatchIndex below
    }, [nodes, searchInput]);

    // Navigate to the previous match in the list
    const jumpToPrevMatch = useCallback(() => {
        if (matchedNodes.length === 0) return;
        const prevIndex = (currentMatchIndex - 1 + matchedNodes.length) % matchedNodes.length;
        setCurrentMatchIndex(prevIndex);
    }, [matchedNodes, currentMatchIndex, setCenter]);

    // Navigate to the next match in the list
    const jumpToNextMatch = useCallback(() => {
        if (matchedNodes.length === 0) return;
        const nextIndex = (currentMatchIndex + 1) % matchedNodes.length;
        setCurrentMatchIndex(nextIndex);
    }, [matchedNodes, currentMatchIndex, setCenter]);

    // Auto-center & zoom upon changing match index
    useEffect(() => {
        if (currentMatchIndex < 0) {
            setCurrentMatchIndex(0);
            return;
        }
        if (matchedNodes.length === 0) { return; }

        zoomAndCenterPosition(matchedNodes[currentMatchIndex].position);
    }, [currentMatchIndex]);

    return (
        <Panel position="top-left">
            <div className="d-flex gap-2 align-items-center rounded text-white bg-charcoal">
                <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search node by title"
                    className="w-auto p-1"
                />
                {searchInput && (
                    <div className="d-flex gap-2 align-items-center">
                        <Button
                            variant="secondary"
                            size="sm"
                            title="Previous Match"
                            onKeyDown={handleSearchKeyDown}
                            onClick={jumpToPrevMatch}
                        >
                            &#8592;
                        </Button>
                        <span>
                            {Math.min(currentMatchIndex + 1, matchedNodes.length)}
                            / {matchedNodes.length}
                        </span>
                        <Button
                            variant="secondary"
                            size="sm"
                            title="Next Match"
                            onKeyDown={handleSearchKeyDown}
                            onClick={jumpToNextMatch}
                        >
                            &#8594;
                        </Button>
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default SearchBar;

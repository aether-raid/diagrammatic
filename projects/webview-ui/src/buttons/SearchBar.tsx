import { useState, useCallback, useEffect } from "react";
import { Panel, XYPosition } from "@xyflow/react";

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const zoomAndCenterPosition = (position: XYPosition, zoomLevel: number = 1.5) => {
        const { x, y } = position;
        setCenter(x, y, { zoom: zoomLevel });
    }

    const performSearch = useCallback(() => {
        if (!searchInput) {
            // TODO: better indication on no matches found.
            // alert("Please enter a node title to search");
            return;
        }

        // Find the node by title, currently it will search for the first node that contains the search input
        const matches = nodes.filter((node) => {
            if (node.data && "entityName" in node.data) {
                return node.data.entityName
                    .toLowerCase()
                    .includes(searchInput.toLowerCase());
            }
            return false;
        });

        setMatchedNodes(matches);
        setCurrentMatchIndex(0);

        // Immediately center on first match
        if (matches.length !== 0) { zoomAndCenterPosition(matches[0].position) }
    }, [nodes, searchInput, setCenter]);

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
        if (matchedNodes.length === 0) { return; }
        zoomAndCenterPosition(matchedNodes[currentMatchIndex].position);
    }, [currentMatchIndex]);

    return (
        <Panel position="top-left">
            <div
                className="search-bar"
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#20232a",
                    borderRadius: "4px",
                    color: "white",
                }}
            >
                <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search node by title"
                    style={{
                        padding: "5px",
                        width: "300px",
                        marginRight: "10px",
                    }}
                />
                <button
                    onClick={performSearch}
                    style={{ padding: "5px", marginRight: "10px" }}
                >
                    Search
                </button>
                {matchedNodes.length > 0 && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                        }}
                    >
                        <button
                            onClick={jumpToPrevMatch}
                            style={{
                                padding: "5px",
                                marginRight: "5px",
                                cursor: "pointer",
                                backgroundColor: "#444",
                                border: "none",
                                borderRadius: "2px",
                                color: "white",
                            }}
                            title="Previous match"
                        >
                            &#8592;
                        </button>
                        <span style={{ marginRight: "5px" }}>
                            {currentMatchIndex + 1} / {matchedNodes.length}
                        </span>
                        <button
                            onClick={jumpToNextMatch}
                            style={{
                                padding: "5px",
                                cursor: "pointer",
                                backgroundColor: "#444",
                                border: "none",
                                borderRadius: "2px",
                                color: "white",
                            }}
                            title="Next match"
                        >
                            &#8594;
                        </button>
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default SearchBar;

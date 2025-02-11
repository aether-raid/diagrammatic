import { useState, useCallback } from "react";
import { AppNode } from "@shared/node.types";
import { Panel } from "@xyflow/react";

interface SearchBarProps {
    nodes: AppNode[];
    setCenter: (x: number, y: number, options?: { zoom?: number }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ nodes, setCenter }) => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [matchedNodes, setMatchedNodes] = useState<AppNode[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const performSearch = useCallback(() => {
        if (!searchInput) {
            alert("Please enter a node title to search");
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

        if (matches.length === 0) {
            alert("Node not found.");
            setMatchedNodes([]);
            setCurrentMatchIndex(0);
        } else {
            setMatchedNodes(matches);
            setCurrentMatchIndex(0);
            // Immediately center on the first match
            const { x, y } = matches[0].position;
            setCenter(x, y, { zoom: 1.5 });
        }
    }, [nodes, searchInput, setCenter]);

    // Navigate to the previous match in the list
    const handlePrevMatch = useCallback(() => {
        if (matchedNodes.length === 0) return;
        // Use modulo arithmetic for circular navigation
        const newIndex =
            (currentMatchIndex - 1 + matchedNodes.length) % matchedNodes.length;
        setCurrentMatchIndex(newIndex);
        const { x, y } = matchedNodes[newIndex].position;
        setCenter(x, y, { zoom: 1.5 });
    }, [matchedNodes, currentMatchIndex, setCenter]);

    // Navigate to the next match in the list
    const handleNextMatch = useCallback(() => {
        if (matchedNodes.length === 0) return;
        const newIndex = (currentMatchIndex + 1) % matchedNodes.length;
        setCurrentMatchIndex(newIndex);
        const { x, y } = matchedNodes[newIndex].position;
        setCenter(x, y, { zoom: 1.5 });
    }, [matchedNodes, currentMatchIndex, setCenter]);

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
                            onClick={handlePrevMatch}
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
                            onClick={handleNextMatch}
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

import { useState, useCallback, useEffect } from "react";
import { AppNode } from "@shared/node.types";
import { Panel } from "@xyflow/react";

interface SearchBarProps {
    nodes: AppNode[];
    setCenter: (x: number, y: number, options?: { zoom?: number }) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ nodes, setCenter }) => {
    const [searchInput, setSearchInput] = useState<string>("");

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    const handleSearch = useCallback(() => {
        if (!searchInput) {
            alert("Please enter a node title to search");
            return;
        }

        // Find the node by title
        const targetNode = nodes.find((node) => {
            if (node.data && "entityName" in node.data) {
                return node.data.entityName
                    .toLowerCase()
                    .includes(searchInput.toLowerCase());
            }
            return false;
        });

        if (targetNode) {
            const { x, y } = targetNode.position;
            setCenter(x, y, { zoom: 1.5 }); // Center the view on the found node
        } else {
            alert("Node not found.");
        }
    }, [nodes, searchInput, setCenter]);

    return (
        <Panel position="top-left">
            <div className="search-bar">
                <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search node by title"
                    className="p-[5px] w-[300px] mr-[10px]"
                />
                <button onClick={handleSearch} className="p-[5px]">
                    Search
                </button>
            </div>
        </Panel>
    );
};

export default SearchBar;

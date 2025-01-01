

/**
 *  Helper function for development to view the original code from a node
 */
export function sliceSourceCode(node) {
  const startPos = node.startPosition;
  const endPos = node.endPosition; // { row: 14, column: 9}

  const lines = sourceCode.split("\n");
  const snippet = lines
    .slice(startPos.row, endPos.row + 1)
    .map((line, index) => {
      const startCol = index === 0 ? startPos.column : 0;
      const endCol = index === lines.length - 1 ? endPos.column : line.length;
      return line.slice(startCol, endCol);
    })
    .join("\n");
  return snippet;
}

/**
 *  Helper function for development to visualise an AST tree
 */
export function visualizeAST(node, depth = 0) {
  const indentation = "  ".repeat(depth);
  console.log(
    `${indentation}- ${node.type} (${node.startPosition.row}:${node.startPosition.column} - ${node.endPosition.row}:${node.endPosition.column})`
  );
  for (let i = 0; i < node.childCount; i++) {
    visualizeAST(node.child(i), depth + 1);
  }
}

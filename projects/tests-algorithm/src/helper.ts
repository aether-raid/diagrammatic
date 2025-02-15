import * as fs from "fs";
import * as path from "path";

export function countFilesAndLines(
  directory: string,
  allowedExtensions: string[] = [".ts", ".py", ".tsx", ".java", ".cpp"]
): {
  fileCount: number;
  lineCount: number;
} {
  let fileCount = 0;
  let lineCount = 0;

  function processDirectory(dir: string) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else {
        const ext = path.extname(file);
        if (allowedExtensions.includes(ext)) {
          fileCount++;
          const fileContent = fs.readFileSync(fullPath, "utf8");
          lineCount += fileContent.split("\n").length;
        }
      }
    }
  }

  processDirectory(directory);
  return { fileCount, lineCount };
}

export function countEntityTypes(
  entities: { data: { entityType: string } }[]
): Record<string, number> {
  return entities.reduce((acc, entity) => {
    const type = entity.data.entityType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export function compareEntityCounts(
  counts1: Record<string, number>,
  counts2: Record<string, number>
): void {
  const allKeys = new Set([...Object.keys(counts1), ...Object.keys(counts2)]);

  for (const key of allKeys) {
    const count1 = counts1[key] || 0;
    const count2 = counts2[key] || 0;

    if (count1 !== count2) {
      console.log(`${key}:`, "(expected)", count1, "(returned)", count2);
    }
  }
}

export function calculatePrecisionRecallF1ForNodes(
  predictedList: {
    data: {
      entityType: string;
      entityName: string;
      filePath: string;
      items: { name: string; lineNumber: number }[];
    };
  }[],
  groundTruthList: {
    data: {
      entityType: string;
      entityName: string;
      filePath: string;
      items: { name: string; lineNumber: number }[];
    };
  }[]
) {
  const predictedSet = new Set(
    predictedList.map(
      (e) => `${e.data.entityType}:${e.data.entityName}:${e.data.filePath}`
    )
  );
  const groundTruthSet = new Set(
    groundTruthList.map(
      (e) => `${e.data.entityType}:${e.data.entityName}:${e.data.filePath}`
    )
  );

  const nodeTP = [...predictedSet].filter((item) =>
    groundTruthSet.has(item)
  ).length;
  const nodeFPSet = [...predictedSet].filter(
    (item) => !groundTruthSet.has(item)
  );
  const nodeFNSet = [...groundTruthSet].filter(
    (item) => !predictedSet.has(item)
  );

  /* 
  console.log("falsePositives", nodeFPSet);
  console.log("falseNegatives", nodeFNSet);
  */

  const nodeFP = nodeFPSet.length;
  const nodeFN = nodeFNSet.length;

  let functionTP = 0,
    functionFP = 0,
    functionFN = 0;

  groundTruthList.forEach((actualEntity) => {
    const predictedEntity = predictedList.find(
      (p) =>
        p.data.entityName === actualEntity.data.entityName &&
        p.data.entityType === actualEntity.data.entityType &&
        p.data.filePath === actualEntity.data.filePath
    );

    if (!predictedEntity) {
      functionFN += actualEntity.data.items.length; // all functions in entity not found
      return;
    }

    const actualItems = new Set(
      actualEntity.data.items.map(
        (i) =>
          `${actualEntity.data.entityType}:${actualEntity.data.entityName}:${i.name}:${i.lineNumber}`
      )
    );
    const predictedItems = new Set(
      predictedEntity.data.items.map(
        (i) =>
          `${predictedEntity.data.entityType}:${predictedEntity.data.entityName}:${i.name}:${i.lineNumber}`
      )
    );

    const truePositives = [...predictedItems].filter((name) =>
      actualItems.has(name)
    );
    const falsePositives = [...predictedItems].filter(
      (name) => !actualItems.has(name)
    );
    const falseNegatives = [...actualItems].filter(
      (name) => !predictedItems.has(name)
    );

    /* if (falsePositives.length > 0) {
      console.log("falsePositives:", falsePositives);
    }
    if (falseNegatives.length > 0) {
      console.log("falseNegatives:", falseNegatives);
    } */

    functionTP += truePositives.length;
    functionFP += falsePositives.length;
    functionFN += falseNegatives.length;
  });

  const nodePrecision = nodeTP / (nodeTP + nodeFP || 1);
  const nodeRecall = nodeTP / (nodeTP + nodeFN || 1);
  const nodeF1 =
    (2 * (nodePrecision * nodeRecall)) / (nodePrecision + nodeRecall || 1);

  console.log("==== Metrics for Nodes ===");
  console.log("Precision:", nodePrecision);
  console.log("Recall:", nodeRecall);
  console.log("F1:", nodeF1);

  const functionPrecision = functionTP / (functionTP + functionFP || 1);
  const functionRecall = functionTP / (functionTP + functionFN || 1);
  const functionF1 =
    (2 * functionPrecision * functionRecall) /
    (functionPrecision + functionRecall || 1);

  console.log("==== Metrics for Functions ===");
  console.log("Precision:", functionPrecision);
  console.log("Recall:", functionRecall);
  console.log("F1:", functionF1);

  return { nodeTP, nodeFP, nodeFN, functionTP, functionFP, functionFN };
}

export function calculatePrecisionRecallF1ForEdges(
  predictedList: {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    markerEnd: { type: string };
  }[],
  groundTruthList: {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    markerEnd: { type: string };
  }[]
) {
  const predictedSet = new Set(
    predictedList.map(
      (e) => `${e.source}:${e.sourceHandle}:${e.target}:${e.targetHandle}`
    )
  );
  const groundTruthSet = new Set(
    groundTruthList.map(
      (e) => `${e.source}:${e.sourceHandle}:${e.target}:${e.targetHandle}`
    )
  );

  const edgeTP = [...predictedSet].filter((item) =>
    groundTruthSet.has(item)
  ).length;
  const edgeFPSet = [...predictedSet].filter(
    (item) => !groundTruthSet.has(item)
  );
  const edgeFNSet = [...groundTruthSet].filter(
    (item) => !predictedSet.has(item)
  );

  const edgeFP = edgeFPSet.length;
  const edgeFN = edgeFNSet.length;

  const edgePrecision = edgeTP / (edgeTP + edgeFP || 1);
  const edgeRecall = edgeTP / (edgeTP + edgeFN || 1);
  const edgeF1 =
    (2 * (edgePrecision * edgeRecall)) / (edgePrecision + edgeRecall || 1);

  console.log("==== Metrics for Edges ===");
  console.log("Precision:", edgePrecision);
  console.log("Recall:", edgeRecall);
  console.log("F1:", edgeF1);

  return { edgeTP, edgeFP, edgeFN };
}

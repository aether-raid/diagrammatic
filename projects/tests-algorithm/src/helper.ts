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

export function calculatePrecisionRecallF1(
  predictedList: {
    data: {
      entityType: string;
      entityName: string;
      items: { name: string; lineNumber: number }[];
    };
  }[],
  groundTruthList: {
    data: {
      entityType: string;
      entityName: string;
      items: { name: string; lineNumber: number }[];
    };
  }[]
) {
  const predictedSet = new Set(
    predictedList.map((e) => `${e.data.entityType}:${e.data.entityName}`)
  );
  const groundTruthSet = new Set(
    groundTruthList.map((e) => `${e.data.entityType}:${e.data.entityName}`)
  );

  const nodeTP = [...predictedSet].filter((item) =>
    groundTruthSet.has(item)
  ).length;
  const nodeFP = [...predictedSet].filter((item) => !groundTruthSet.has(item));
  const nodeFN = [...groundTruthSet].filter((item) => !predictedSet.has(item));

  let functionTP = 0,
    functionFP = 0,
    functionFN = 0;

  groundTruthList.forEach((actualEntity) => {
    const predictedEntity = predictedList.find(
      (p) =>
        p.data.entityName === actualEntity.data.entityName &&
        p.data.entityType === actualEntity.data.entityType
    );

    if (!predictedEntity) {
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

  console.log(nodeFP);
  console.log(nodeFN);

  const nodePrecision = nodeTP / (nodeTP + nodeFP.length || 1);
  const nodeRecall = nodeTP / (nodeTP + nodeFN.length || 1);
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

  const overallPrecision =
    (nodeTP + functionTP) /
    (nodeTP + functionTP + (nodeFP.length + functionFP) || 1);
  const overallRecall =
    (nodeTP + functionTP) /
    (nodeTP + functionTP + (nodeFN.length + functionFN) || 1);
  const overallF1 =
    (2 * overallPrecision * overallRecall) /
    (overallPrecision + overallRecall || 1);

  console.log("==== Overall Metrics ===");
  console.log("Precision:", overallPrecision);
  console.log("Recall:", overallRecall);
  console.log("F1:", overallF1);
}

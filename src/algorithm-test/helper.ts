import * as fs from "fs";
import * as path from "path";

export function countFilesAndLines(directory: string): {
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
        fileCount++;
        const fileContent = fs.readFileSync(fullPath, "utf8");
        lineCount += fileContent.split("\n").length;
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

export function calculateMetrics(
  predicted: { data: { entityType: string; entityName: string } }[],
  groundTruth: { data: { entityType: string; entityName: string } }[]
) {
  const predictedSet = new Set(
    predicted.map((e) => `${e.data.entityType}:${e.data.entityName}`)
  );
  const groundTruthSet = new Set(
    groundTruth.map((e) => `${e.data.entityType}:${e.data.entityName}`)
  );

  const truePositives = [...predictedSet].filter((item) =>
    groundTruthSet.has(item)
  ).length;
  const falsePositives = [...predictedSet].filter(
    (item) => !groundTruthSet.has(item)
  ).length;
  const falseNegatives = [...groundTruthSet].filter(
    (item) => !predictedSet.has(item)
  ).length;

  const precision = truePositives / (truePositives + falsePositives || 1);
  const recall = truePositives / (truePositives + falseNegatives || 1);
  const f1 = (2 * (precision * recall)) / (precision + recall || 1);

  return { precision, recall, f1 };
}

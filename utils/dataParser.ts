import { DataPoint } from "../types";

export const parseCSV = (input: string): DataPoint[] => {
  const lines = input.trim().split('\n');
  if (lines.length < 1) return [];

  // Detect delimiter (tab or comma)
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : ',';

  // We assume no header if the first row has numbers in column 2 and 3
  const firstRowParts = lines[0].split(delimiter);
  const probablyHasHeader = isNaN(parseFloat(firstRowParts[1]?.replace('%', '')));
  
  const startIndex = probablyHasHeader ? 1 : 0;

  const data: DataPoint[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(delimiter);
    if (parts.length < 3) continue;

    const category = parts[0].trim();
    // Clean strings like "14%" -> 14
    const cleanNumber = (str: string) => {
        if(!str) return 0;
        return parseFloat(str.replace(/[^0-9.-]/g, ''));
    };

    const leftValue = cleanNumber(parts[1]);
    const rightValue = cleanNumber(parts[2]);

    data.push({
      category,
      leftValue,
      rightValue
    });
  }

  return data;
};

export const generateCSV = (data: DataPoint[], leftLabel: string, rightLabel: string): string => {
    let output = `Category,${leftLabel},${rightLabel}\n`;
    data.forEach(d => {
        output += `${d.category},${d.leftValue},${d.rightValue}\n`;
    });
    return output;
};

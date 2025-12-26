import { ChartConfig, DataPoint } from "./types";

export const DEFAULT_CONFIG: ChartConfig = {
  title: "三方供应商金额占比分布",
  subtitle: "金额呈现橄榄型分布",
  leftLabel: "2022年",
  rightLabel: "2023年",
  leftColor: "#6dbf8a", // Greenish
  rightColor: "#95d15c", // Lighter Green
  showGrid: true,
  showValues: true,
  barSize: 30,
  gap: 10,
};

export const DEFAULT_DATA: DataPoint[] = [
  { category: "小于50w", leftValue: 14, rightValue: 15 },
  { category: "50w-100w", leftValue: 12, rightValue: 13 },
  { category: "100w-300w", leftValue: 27, rightValue: 25 },
  { category: "300w-500w", leftValue: 12, rightValue: 12 },
  { category: "500w-1000w", leftValue: 15, rightValue: 16 },
  { category: "1000w-2000w", leftValue: 11, rightValue: 8 },
  { category: "2000w以上", leftValue: 9, rightValue: 11 },
];

export const EXAMPLE_DATA_CSV = `Category,2022年,2023年
小于50w,14,15
50w-100w,12,13
100w-300w,27,25
300w-500w,12,12
500w-1000w,15,16
1000w-2000w,11,8
2000w以上,9,11`;

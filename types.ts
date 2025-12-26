export interface DataPoint {
  category: string;
  leftValue: number;
  rightValue: number;
  [key: string]: string | number;
}

export interface ChartConfig {
  title: string;
  subtitle: string;
  leftLabel: string;
  rightLabel: string;
  leftColor: string;
  rightColor: string;
  showGrid: boolean;
  showValues: boolean;
  showAsPercentage: boolean;
  barSize: number;
  gap: number;
}

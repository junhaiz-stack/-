import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Cell,
} from 'recharts';
import { ChartConfig, DataPoint } from '../types';

interface ButterflyChartProps {
  data: DataPoint[];
  config: ChartConfig;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-md text-sm">
        <p className="font-bold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span>{entry.name}:</span>
            <span className="font-mono font-bold">
              {Math.abs(entry.value)}
              {/* Guess percentage if values are small, otherwise show raw */}
              {Math.abs(entry.value) <= 100 && (Math.abs(entry.value) % 1 !== 0 || Math.abs(entry.value) < 1) ? '' : '%'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ButterflyChart: React.FC<ButterflyChartProps> = ({ data, config }) => {
  // Transformation:
  // To create a butterfly chart in Recharts, we typically use one negative series and one positive series on a vertical layout.
  // We need to transform the 'left' values to be negative numbers so they grow to the left.
  const processedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      // Make left value negative for the chart logic
      displayLeft: -Math.abs(item.leftValue),
      displayRight: Math.abs(item.rightValue),
    }));
  }, [data]);

  // Calculate max domain to make the chart symmetrical relative to 0
  const maxValue = useMemo(() => {
    let max = 0;
    processedData.forEach(d => {
      max = Math.max(max, Math.abs(d.leftValue), Math.abs(d.rightValue));
    });
    // Add some padding
    return Math.ceil(max * 1.3);
  }, [processedData]);

  const yAxisWidth = 150; // Fixed width for labels to align nicely

  // Value formatter for the axis ticks (remove negative sign)
  const formatTick = (val: number) => Math.abs(val).toString();

  // Custom Label to render absolute values outside bars
  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const absValue = Math.abs(value);
    
    // For vertical bar chart with negative values (left side):
    // - x is the right edge of the bar (near center line 0)
    // - width is negative (bar extends leftward)
    // - x + width gives the left edge of the bar
    // For positive values (right side):
    // - x is the left edge of the bar (near center line 0)
    // - width is positive (bar extends rightward)
    
    // Calculate position outside the bar with proper spacing
    const spacing = 3; // Space between bar and label
    const labelX = value < 0 
      ? x + width - spacing  // Left side: position to the left of the bar's left edge
      : x + width + spacing; // Right side: position to the right of the bar's right edge
    
    return (
      <text 
        x={labelX}
        y={y + height / 2} 
        fill="#475569" 
        textAnchor={value < 0 ? "end" : "start"} 
        dominantBaseline="middle"
        fontSize={13}
        fontWeight={600}
        className="font-semibold"
      >
        {absValue}%
      </text>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
        {/* Title Section */}
      <div className="text-center mb-6 w-full">
        <h2 className="text-xl font-bold text-orange-600 mb-1">{config.title}</h2>
        {config.subtitle && (
            <p className="text-sm font-semibold text-gray-800">{config.subtitle}</p>
        )}
      </div>

      {/* Chart Container */}
      <div className="relative w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={processedData}
            stackOffset="sign"
            margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
            barCategoryGap={config.gap}
          >
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e5e7eb" />}
            
            <XAxis 
              type="number" 
              domain={[-maxValue, maxValue]} 
              tickFormatter={formatTick}
              stroke="#94a3b8"
              fontSize={12}
            />
            
            <YAxis 
              dataKey="category" 
              type="category" 
              width={yAxisWidth}
              tick={{ fontSize: 13, fill: '#475569' }}
              interval={0}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
            
            <ReferenceLine x={0} stroke="#333" />

            {/* Left Bar (Negative) */}
            <Bar 
              dataKey="displayLeft" 
              name={config.leftLabel} 
              fill={config.leftColor} 
              barSize={config.barSize}
              isAnimationActive={true}
              stackId="butterfly"
            >
               {config.showValues && <LabelList dataKey="displayLeft" content={renderCustomLabel} />}
            </Bar>

            {/* Right Bar (Positive) */}
            <Bar 
              dataKey="displayRight" 
              name={config.rightLabel} 
              fill={config.rightColor} 
              barSize={config.barSize}
              isAnimationActive={true}
              stackId="butterfly"
            >
               {config.showValues && <LabelList dataKey="displayRight" content={renderCustomLabel} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend / Footer */}
      <div className="flex items-center justify-center gap-8 mt-4">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: config.leftColor}}></span>
            <span className="text-sm font-medium text-slate-600">{config.leftLabel}</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{backgroundColor: config.rightColor}}></span>
            <span className="text-sm font-medium text-slate-600">{config.rightLabel}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { ButterflyChart } from './components/ButterflyChart';
import { ChartConfig, DataPoint } from './types';
import { DEFAULT_CONFIG, DEFAULT_DATA, EXAMPLE_DATA_CSV } from './constants';
import { parseCSV, generateCSV } from './utils/dataParser';
import { Settings, BarChart3, Upload, FileText, Download, RotateCcw } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<DataPoint[]>(DEFAULT_DATA);
  const [config, setConfig] = useState<ChartConfig>(DEFAULT_CONFIG);
  const [inputText, setInputText] = useState<string>(EXAMPLE_DATA_CSV);
  const [activeTab, setActiveTab] = useState<'editor' | 'settings'>('editor');
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Sync Input Text when Data changes externally (e.g. reset)
  useEffect(() => {
     // Optional: If we wanted two-way binding strictly. 
     // For now, we only parse Input -> Data when user types.
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    const parsed = parseCSV(text);
    if (parsed.length > 0) {
      setData(parsed);
    }
  };

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetData = () => {
    setData(DEFAULT_DATA);
    setInputText(EXAMPLE_DATA_CSV);
    setConfig(DEFAULT_CONFIG);
  };

  const handleExportScreenshot = async () => {
    if (!chartContainerRef.current) return;

    try {
      // 查找包含图表的容器
      const chartWrapper = chartContainerRef.current;
      const svgElement = chartWrapper.querySelector('svg');
      
      if (!svgElement) {
        alert('无法找到图表元素');
        return;
      }

      // 获取SVG的尺寸
      const svgRect = svgElement.getBoundingClientRect();
      const svgWidth = svgRect.width || parseInt(svgElement.getAttribute('width') || '800');
      const svgHeight = svgRect.height || parseInt(svgElement.getAttribute('height') || '450');

      // 序列化SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // 添加XML声明和命名空间（如果需要）
      const svgWithDeclaration = `<?xml version="1.0" encoding="UTF-8"?>${svgData}`;
      
      // 创建SVG Blob
      const svgBlob = new Blob([svgWithDeclaration], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // 创建Image对象
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // 如果Canvas不可用，直接下载SVG
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = `butterfly-chart-${new Date().getTime()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
        return;
      }

      // 设置canvas尺寸
      canvas.width = svgWidth;
      canvas.height = svgHeight;

      img.onload = () => {
        try {
          // 绘制白色背景
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制SVG图像
          ctx.drawImage(img, 0, 0);

          // 转换为blob并下载
          canvas.toBlob((blob) => {
            if (!blob) {
              // 如果PNG导出失败，尝试下载SVG
              const link = document.createElement('a');
              link.href = svgUrl;
              link.download = `butterfly-chart-${new Date().getTime()}.svg`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(svgUrl);
              return;
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `butterfly-chart-${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);
          }, 'image/png', 1.0);
        } catch (error) {
          console.error('绘制失败:', error);
          // 备用：直接下载SVG
          const link = document.createElement('a');
          link.href = svgUrl;
          link.download = `butterfly-chart-${new Date().getTime()}.svg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(svgUrl);
        }
      };

      img.onerror = () => {
        // 如果图片加载失败，直接下载SVG
        const link = document.createElement('a');
        link.href = svgUrl;
        link.download = `butterfly-chart-${new Date().getTime()}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(svgUrl);
      };

      // 设置图片源
      img.src = svgUrl;
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试。如果问题持续，请尝试使用浏览器的截图功能。');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <BarChart3 size={24} />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800">Butterfly Chart Studio</h1>
                <p className="text-xs text-slate-500">Compare datasets visually</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={resetData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
                <RotateCcw size={16} /> Reset
            </button>
            <button 
                onClick={handleExportScreenshot}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
            >
                <Download size={16} /> Export (Screenshot)
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col h-[50vh] lg:h-auto overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <FileText size={16} /> Data Input
                </button>
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Settings size={16} /> Customization
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {activeTab === 'editor' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Paste Data (CSV/Excel)</label>
                            <p className="text-xs text-slate-500 mb-2">Format: Category, Left Value, Right Value</p>
                            <textarea
                                className="w-full h-96 p-4 font-mono text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                value={inputText}
                                onChange={handleTextChange}
                                placeholder="Category, 2022, 2023..."
                            />
                        </div>
                        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 mb-1">Quick Tip</h4>
                            <p className="text-xs text-blue-700">You can copy data directly from Excel or Google Sheets and paste it here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Titles & Labels</h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Chart Title</label>
                                <input 
                                    type="text" 
                                    value={config.title}
                                    onChange={(e) => handleConfigChange('title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
                                <input 
                                    type="text" 
                                    value={config.subtitle}
                                    onChange={(e) => handleConfigChange('subtitle', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Series Configuration</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Left Label</label>
                                    <input 
                                        type="text" 
                                        value={config.leftLabel}
                                        onChange={(e) => handleConfigChange('leftLabel', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Right Label</label>
                                    <input 
                                        type="text" 
                                        value={config.rightLabel}
                                        onChange={(e) => handleConfigChange('rightLabel', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Left Color</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={config.leftColor}
                                            onChange={(e) => handleConfigChange('leftColor', e.target.value)}
                                            className="h-8 w-8 rounded border border-slate-200 cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-400">{config.leftColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Right Color</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="color" 
                                            value={config.rightColor}
                                            onChange={(e) => handleConfigChange('rightColor', e.target.value)}
                                            className="h-8 w-8 rounded border border-slate-200 cursor-pointer"
                                        />
                                        <span className="text-xs text-slate-400">{config.rightColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Show Values on Bars</label>
                                <input 
                                    type="checkbox"
                                    checked={config.showValues}
                                    onChange={(e) => handleConfigChange('showValues', e.target.checked)}
                                    className="rounded text-orange-600 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Show as Percentage</label>
                                <input 
                                    type="checkbox"
                                    checked={config.showAsPercentage}
                                    onChange={(e) => handleConfigChange('showAsPercentage', e.target.checked)}
                                    className="rounded text-orange-600 focus:ring-orange-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm text-slate-600">Show Grid Lines</label>
                                <input 
                                    type="checkbox"
                                    checked={config.showGrid}
                                    onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
                                    className="rounded text-orange-600 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Bar Thickness ({config.barSize}px)</label>
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="50" 
                                    value={config.barSize}
                                    onChange={(e) => handleConfigChange('barSize', parseInt(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Bar Spacing ({config.gap}px)</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="30" 
                                    value={config.gap}
                                    onChange={(e) => handleConfigChange('gap', parseInt(e.target.value))}
                                    className="w-full accent-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>

        {/* Chart Preview Area */}
        <section className="flex-1 bg-slate-50 p-4 lg:p-8 flex items-center justify-center overflow-auto">
            <div ref={chartContainerRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-12 w-full max-w-6xl min-h-[500px] flex flex-col justify-center">
                <ButterflyChart data={data} config={config} />
            </div>
        </section>
      </main>
    </div>
  );
}

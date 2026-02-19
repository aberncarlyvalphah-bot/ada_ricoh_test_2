'use client';

import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Download } from 'lucide-react';
import DataDetailsTable from './DataDetailsTable';

// Mock data - 模拟学生成绩数据
const mockChartData = {
  dimensions: ['科目', '成绩'],
  source: [
    { 科目: '语文', 成绩: 85 },
    { 科目: '数学', 成绩: 92 },
    { 科目: '英语', 成绩: 88 },
    { 科目: '物理', 成绩: 78 },
    { 科目: '化学', 成绩: 82 },
    { 科目: '生物', 成绩: 75 },
    { 科目: '历史', 成绩: 90 },
    { 科目: '地理', 成绩: 86 },
    { 科目: '政治', 成绩: 88 },
    { 科目: '音乐', 成绩: 92 },
    { 科目: '美术', 成绩: 95 },
    { 科目: '体育', 成绩: 88 },
  ],
};

// Additional mock data for scatter and heatmap
const scatterData = [
  [85, 78, '语文'],
  [92, 85, '数学'],
  [88, 80, '英语'],
  [78, 75, '物理'],
  [82, 78, '化学'],
  [75, 72, '生物'],
  [90, 82, '历史'],
  [86, 79, '地理'],
  [88, 84, '政治'],
  [92, 88, '音乐'],
  [95, 92, '美术'],
  [88, 85, '体育'],
];

const heatmapData = [
  [0, 0, 85],
  [0, 1, 78],
  [0, 2, 88],
  [1, 0, 92],
  [1, 1, 85],
  [1, 2, 82],
  [2, 0, 88],
  [2, 1, 80],
  [2, 2, 84],
  [3, 0, 78],
  [3, 1, 75],
  [3, 2, 78],
];

const previewData = [
  { 科目: '语文', 成绩: 85 },
  { 科目: '数学', 成绩: 92 },
  { 科目: '英语', 成绩: 88 },
  { 科目: '物理', 成绩: 78 },
  { 科目: '化学', 成绩: 82 },
];

type ChartType = 'radar' | 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';

interface ChartConfig {
  showLegend: boolean;
  showDataLabels: boolean;
  color: string;
  backgroundColor: string;
  borderColor: string;
}

export default function CanvasPanel() {
  const [chartType, setChartType] = useState<ChartType>('radar');
  const [showConfig, setShowConfig] = useState(false);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    showLegend: true,
    showDataLabels: false,
    color: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
  });

  const presetColors = [
    { name: 'Blue', color: '#3b82f6' },
    { name: 'Green', color: '#22c55e' },
    { name: 'Red', color: '#ef4444' },
    { name: 'Purple', color: '#a855f7' },
    { name: 'Orange', color: '#f97316' },
    { name: 'Cyan', color: '#06b6d4' },
  ];

  // Professional color palettes for pie charts
  const colorPalettes = {
    blue: [
      { name: 'Deep Blue', color: '#1e40af' },
      { name: 'Medium Blue', color: '#3b82f6' },
      { name: 'Light Blue', color: '#60a5fa' },
      { name: 'Pale Blue', color: '#93c5fd' },
      { name: 'Very Pale Blue', color: '#bfdbfe' },
      { name: 'Extra Pale Blue', color: '#dbeafe' },
    ],
    green: [
      { name: 'Deep Green', color: '#14532d' },
      { name: 'Medium Green', color: '#22c55e' },
      { name: 'Light Green', color: '#4ade80' },
      { name: 'Pale Green', color: '#86efac' },
      { name: 'Very Pale Green', color: '#bbf7d0' },
      { name: 'Extra Pale Green', color: '#dcfce7' },
    ],
    red: [
      { name: 'Deep Red', color: '#991b1b' },
      { name: 'Medium Red', color: '#ef4444' },
      { name: 'Light Red', color: '#f87171' },
      { name: 'Pale Red', color: '#fca5a5' },
      { name: 'Very Pale Red', color: '#fecaca' },
      { name: 'Extra Pale Red', color: '#fee2e2' },
    ],
    purple: [
      { name: 'Deep Purple', color: '#6b21a8' },
      { name: 'Medium Purple', color: '#a855f7' },
      { name: 'Light Purple', color: '#c084fc' },
      { name: 'Pale Purple', color: '#d8b4fe' },
      { name: 'Very Pale Purple', color: '#e9d5ff' },
      { name: 'Extra Pale Purple', color: '#f3e8ff' },
    ],
    orange: [
      { name: 'Deep Orange', color: '#9a3412' },
      { name: 'Medium Orange', color: '#f97316' },
      { name: 'Light Orange', color: '#fb923c' },
      { name: 'Pale Orange', color: '#fdba74' },
      { name: 'Very Pale Orange', color: '#fdba74' },
      { name: 'Extra Pale Orange', color: '#ffedd5' },
    ],
    cyan: [
      { name: 'Deep Cyan', color: '#0e7490' },
      { name: 'Medium Cyan', color: '#06b6d4' },
      { name: 'Light Cyan', color: '#22d3ee' },
      { name: 'Pale Cyan', color: '#67e8f9' },
      { name: 'Very Pale Cyan', color: '#a5f3fc' },
      { name: 'Extra Pale Cyan', color: '#caf0f8' },
    ],
    rainbow: [
      { name: 'Red', color: '#ef4444' },
      { name: 'Orange', color: '#f97316' },
      { name: 'Yellow', color: '#eab308' },
      { name: 'Green', color: '#22c55e' },
      { name: 'Blue', color: '#3b82f6' },
      { name: 'Purple', color: '#a855f7' },
    ],
  };

  // Get current palette based on selected color
  const getCurrentPalette = () => {
    if (chartConfig.color.startsWith('#3b')) return colorPalettes.blue;
    if (chartConfig.color.startsWith('#22')) return colorPalettes.green;
    if (chartConfig.color.startsWith('#ef')) return colorPalettes.red;
    if (chartConfig.color.startsWith('#a8')) return colorPalettes.purple;
    if (chartConfig.color.startsWith('#f9')) return colorPalettes.orange;
    if (chartConfig.color.startsWith('#06')) return colorPalettes.cyan;
    return colorPalettes.blue;
  };

  const getOption = () => {
    const categories = mockChartData.source.map((item) => item['科目']);
    const values = mockChartData.source.map((item) => item['成绩']);

    const baseOption: Record<string, unknown> = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        show: chartConfig.showLegend,
        bottom: 10,
      },
    };

    if (chartType === 'radar') {
      return {
        ...baseOption,
        radar: {
          indicator: categories.map((cat) => ({
            name: cat,
            max: 100,
          })),
          center: ['50%', '48%'],
          radius: '60%',
        },
        series: [
          {
            name: '成绩',
            type: 'radar',
            data: [
              {
                value: values,
                name: '成绩',
                areaStyle: {
                  color: 'rgba(59, 130, 246, 0.2)',
                },
                lineStyle: {
                  color: chartConfig.color,
                },
                itemStyle: {
                  color: chartConfig.color,
                },
              },
            ],
          },
        ],
      };
    }

    if (chartType === 'bar' || chartType === 'line') {
      return {
        ...baseOption,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '20%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: categories,
          axisLabel: {
            interval: 0,
            rotate: 45,
          },
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '成绩',
            type: chartType,
            data: values,
            itemStyle: {
              color: chartConfig.color,
            },
            areaStyle:
              chartType === 'line'
                ? {
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        { offset: 0, color: `${chartConfig.color}4D` },
                        { offset: 1, color: `${chartConfig.color}00` },
                      ],
                    },
                  }
                : undefined,
          },
        ],
      };
    }

    if (chartType === 'pie') {
      const palette = getCurrentPalette();
      return {
        ...baseOption,
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#fff',
          borderWidth: 1,
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
        },
        series: [
          {
            name: '成绩分布',
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)',
              shadowOffsetX: 2,
              shadowOffsetY: 2,
            },
            label: {
              show: chartConfig.showDataLabels,
              position: 'outside',
              formatter: '{b}\n{c}',
              fontSize: 13,
              fontWeight: 500,
              color: '#333',
            },
            emphasis: {
              scale: 1.05,
              scaleSize: 10,
              label: {
                show: true,
                fontSize: 16,
                fontWeight: 'bold',
                formatter: '{b}\n{c}',
              },
              itemStyle: {
                shadowBlur: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            labelLine: {
              show: chartConfig.showDataLabels,
              length: 30,
              length2: 10,
              smooth: true,
              lineStyle: {
                width: 2,
              },
            },
            data: mockChartData.source.map((item, index) => {
              const colorIndex = index % palette.length;
              return {
                value: item['成绩'],
                name: item['科目'],
                itemStyle: {
                  color: palette[colorIndex].color,
                  borderColor: '#fff',
                  borderWidth: 2,
                },
                emphasis: {
                  itemStyle: {
                    color: palette[colorIndex].color,
                    borderColor: '#fff',
                    borderWidth: 3,
                  },
                },
              };
            }),
          },
        ],
      };
    }

    if (chartType === 'scatter') {
      return {
        ...baseOption,
        grid: {
          left: '10%',
          right: '10%',
          bottom: '15%',
        },
        xAxis: {
          type: 'value',
          name: '成绩',
          nameLocation: 'middle',
          nameGap: 30,
        },
        yAxis: {
          type: 'value',
          name: '综合评分',
          nameLocation: 'middle',
          nameGap: 50,
        },
        series: [
          {
            name: '成绩分布',
            type: 'scatter',
            data: scatterData,
            symbolSize: 12,
            itemStyle: {
              color: chartConfig.color,
            },
            label: {
              show: chartConfig.showDataLabels,
              position: 'top',
              formatter: (params: { data: [number, number, string] }) => params.data[2],
            },
          },
        ],
      };
    }

    if (chartType === 'heatmap') {
      const xCategories = ['Q1', 'Q2', 'Q3', 'Q4'];
      const yCategories = ['语文', '数学', '英语'];
      const heatData = [
        [0, 0, 85], [0, 1, 78], [0, 2, 88], [0, 3, 82],
        [1, 0, 92], [1, 1, 85], [1, 2, 88], [1, 3, 88],
        [2, 0, 88], [2, 1, 80], [2, 2, 84], [2, 3, 85],
      ];

      return {
        ...baseOption,
        grid: {
          height: '70%',
          top: '10%',
          left: '10%',
          right: '10%',
        },
        xAxis: {
          type: 'category',
          data: xCategories,
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: 'category',
          data: yCategories,
        },
        visualMap: {
          min: 0,
          max: 100,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          inRange: {
            color: ['#50a3ba', '#eac736', '#d94e5d'],
          },
        },
        series: [
          {
            name: '成绩热力图',
            type: 'heatmap',
            data: heatData,
            label: {
              show: chartConfig.showDataLabels,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],
      };
    }

    return baseOption;
  };

  const handleExportChart = () => {
    const chartElement = document.querySelector('div[role="img"]') as HTMLElement;
    if (chartElement) {
      console.log('Chart export functionality - to be implemented');
      alert('图表导出功能待实现');
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col bg-background p-0 self-start">
      {/* Chart Card */}
      <div className="bg-card border rounded-lg shadow-sm mb-4 mx-4 mt-4">
        {/* Header with chart type selector and config button */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">成绩分布图</h3>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radar">Radar Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Chart</SelectItem>
                <SelectItem value="heatmap">Heatmap</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportChart}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        {showConfig && (
          <div className="border-b bg-muted/30 p-4 space-y-4">
            <h4 className="text-sm font-medium">图表配置</h4>
            <div className="space-y-3">
              {/* Legend Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm">显示图例</label>
                <input
                  type="checkbox"
                  checked={chartConfig.showLegend}
                  onChange={(e) => setChartConfig({ ...chartConfig, showLegend: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              {/* Data Labels Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm">显示数据标签</label>
                <input
                  type="checkbox"
                  checked={chartConfig.showDataLabels}
                  onChange={(e) => setChartConfig({ ...chartConfig, showDataLabels: e.target.checked })}
                  className="w-4 h-4"
                />
              </div>

              {/* Color Presets */}
              <div>
                <label className="text-sm block mb-2">颜色主题</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setChartConfig({ ...chartConfig, color: color.color })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        chartConfig.color === color.color
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart - 高度留足，避免图例被裁切 */}
        <div className="p-4">
          <div className={showConfig ? 'min-h-[20rem]' : 'h-[26rem] min-h-[24rem]'}>
            <ReactECharts
              key={`${chartType}-${chartConfig.color}-${showConfig}`}
              option={getOption()}
              style={{ height: '100%', width: '100%' }}
              notMerge={true}
              lazyUpdate={true}
            />
          </div>
        </div>
      </div>

      {/* Data Details */}
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">Data Details</h4>
          <span className="text-xs text-muted-foreground">Preview (5 rows)</span>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          <DataDetailsTable data={previewData} />
        </div>
      </div>
    </div>
  );
}

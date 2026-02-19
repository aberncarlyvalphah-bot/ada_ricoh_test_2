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

const previewData = [
  { 科目: '语文', 成绩: 85 },
  { 科目: '数学', 成绩: 92 },
  { 科目: '英语', 成绩: 88 },
  { 科目: '物理', 成绩: 78 },
  { 科目: '化学', 成绩: 82 },
];

export default function CanvasPanel() {
  const [chartType, setChartType] = useState<'radar' | 'bar' | 'line'>('radar');

  const getOption = () => {
    const categories = mockChartData.source.map((item) => item['科目']);
    const values = mockChartData.source.map((item) => item['成绩']);

    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: ['成绩'],
        bottom: 40,
      },
      grid:
        chartType === 'bar' || chartType === 'line'
          ? {
              left: '3%',
              right: '4%',
              bottom: '20%',
              containLabel: true,
            }
          : undefined,
      xAxis:
        chartType === 'bar' || chartType === 'line'
          ? {
              type: 'category',
              data: categories,
              axisLabel: {
                interval: 0,
                rotate: 45,
              },
            }
          : undefined,
      yAxis:
        chartType === 'bar' || chartType === 'line'
          ? {
              type: 'value',
            }
          : undefined,
      radar:
        chartType === 'radar'
          ? {
              indicator: categories.map((cat) => ({
                name: cat,
                max: 100,
              })),
              center: ['50%', '48%'],
              radius: '60%',
            }
          : undefined,
      series: [
        {
          name: '成绩',
          type: chartType,
          data:
            chartType === 'radar'
              ? [
                  {
                    value: values,
                    name: '成绩',
                    areaStyle: {
                      color: 'rgba(59, 130, 246, 0.2)',
                    },
                    lineStyle: {
                      color: '#3b82f6',
                    },
                    itemStyle: {
                      color: '#3b82f6',
                    },
                  },
                ]
              : values,
          itemStyle: {
            color: '#3b82f6',
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
                      { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                      { offset: 1, color: 'rgba(59, 130, 246, 0)' },
                    ],
                  }
                }
              : undefined,
        },
      ],
    };
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chart Card */}
      <div className="bg-card border rounded-lg shadow-sm overflow-hidden mb-4 mx-4 mt-4">
        {/* Header with chart type selector */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">成绩分布图</h3>
          <Select value={chartType} onValueChange={(v) => setChartType(v as 'radar' | 'bar' | 'line')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="radar">Radar Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="h-96 p-4">
          <ReactECharts
            key={chartType}
            option={getOption()}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
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

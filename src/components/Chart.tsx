import { onMount } from 'solid-js';
import type { Component } from 'solid-js';
import './Chart.css';

interface ChartProps {
  type: 'line' | 'bar' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  options?: any;
  className?: string;
}

const Chart: Component<ChartProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;

  onMount(() => {
    if (!canvasRef) return;

    const ctx = canvasRef.getContext('2d');
    if (!ctx) return;

    // Simple chart implementation using Canvas API
    const { width, height } = canvasRef;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (props.type === 'line') {
      drawLineChart(ctx, props.data, chartWidth, chartHeight, padding);
    } else if (props.type === 'bar') {
      drawBarChart(ctx, props.data, chartWidth, chartHeight, padding);
    } else if (props.type === 'doughnut') {
      drawDoughnutChart(ctx, props.data, Math.min(chartWidth, chartHeight) / 2, padding);
    }
  });

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: any, chartWidth: number, chartHeight: number, padding: number) => {
    const { labels, datasets } = data;
    const dataset = datasets[0];

    // Find max value for scaling
    const maxValue = Math.max(...dataset.data);
    const scale = chartHeight / maxValue;

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = dataset.borderColor || '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();

    dataset.data.forEach((value: number, index: number) => {
      const x = padding + (chartWidth / (labels.length - 1)) * index;
      const y = padding + chartHeight - (value * scale);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = dataset.borderColor || '#6366f1';
    dataset.data.forEach((value: number, index: number) => {
      const x = padding + (chartWidth / (labels.length - 1)) * index;
      const y = padding + chartHeight - (value * scale);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: any, chartWidth: number, chartHeight: number, padding: number) => {
    const { labels, datasets } = data;
    const dataset = datasets[0];

    const maxValue = Math.max(...dataset.data);
    const scale = chartHeight / maxValue;
    const barWidth = chartWidth / labels.length * 0.8;
    const barSpacing = chartWidth / labels.length * 0.2;

    dataset.data.forEach((value: number, index: number) => {
      const x = padding + (chartWidth / labels.length) * index + barSpacing / 2;
      const barHeight = value * scale;
      const y = padding + chartHeight - barHeight;

      ctx.fillStyle = dataset.backgroundColor || '#6366f1';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Add value label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
    });
  };

  const drawDoughnutChart = (ctx: CanvasRenderingContext2D, data: any, radius: number, padding: number) => {
    const { datasets } = data;
    const dataset = datasets[0];
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
    let startAngle = -Math.PI / 2;

    dataset.data.forEach((value: number, index: number) => {
      const sliceAngle = (value / total) * Math.PI * 2;

      ctx.fillStyle = Array.isArray(dataset.backgroundColor)
        ? dataset.backgroundColor[index]
        : dataset.backgroundColor || '#6366f1';

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Draw inner circle for doughnut effect
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div class={`chart-container ${props.className || ''}`}>
      <canvas
        ref={canvasRef}
        width="400"
        height="200"
        class="w-full h-auto"
      ></canvas>
    </div>
  );
};

export default Chart;
import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import dragDataPlugin from 'chartjs-plugin-dragdata';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend, dragDataPlugin);

const VoiceGraph = ({ data, onUpdate }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Initialize the chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['0s', '1s', '2s', '3s', '4s', '5s', '6s'], // Time labels
        datasets: [
          {
            label: 'Voice Data',
            data: [20, 15, 30, 25, 35, 30, 20], // Initial voice data values
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            pointBackgroundColor: 'rgba(75, 192, 192, 1)',
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Draggable Voice Graph',
          },
          dragData: {
            round: 0, // Round to integer values
            onDragStart: function (e, datasetIndex, index, value) {
              console.log(`Dragging started for point: ${value}`);
            },
            onDrag: function (e, datasetIndex, index, value) {
              console.log(`Dragging point index: ${index}, new value: ${value}`);
              // onUpdate(index, parseFloat(value));
            },
            onDragEnd: function (e, datasetIndex, index, value) {
              console.log(`Dragging ended. New value for point ${index}: ${value}`);
              onUpdate(index, parseFloat(value));
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Time (seconds)',
            },
          },
          y: {
            type: 'linear',
            title: {
              display: true,
              text: 'Amplitude',
            },
            min: 0,
            max: 100,
          },
        },
      },
    });

    // Cleanup the chart on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, onUpdate]);

  return <canvas ref={chartRef} />;
};

export default VoiceGraph;

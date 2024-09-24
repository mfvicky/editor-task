import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';

const LineChart = ({ data, onUpdate }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    useEffect(() => {

        const chartContext = chartRef.current.getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        // Register the necessary components for the chart

        Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

        // Create the line chart
        chartInstance.current = new Chart(chartContext, {
            type: 'line',
            data: {
                labels: data.labels, // x-axis labels
                datasets: [
                    {
                        label: 'Voice Data',
                        data: data.values, // y-axis values
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
                        text: 'Voice modulation',
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
                }
            },
            // onHover: (event, chartElement) => {
            //     if (chartElement.length) {
            //         const { index } = chartElement[0].element;
            //         const newValue = prompt("Enter new value for data point:"); // simple input for demonstration
            //         if (newValue) {
            //             onUpdate(index, parseFloat(newValue)); // trigger the update with new data value
            //         }
            //     }
            // },
            onHover: (event, chartElement) => {
                const point = chartElement[0];
                event.native.target.style.cursor = point ? 'grab' : 'default';
            },
            onClick: (event, chartElement) => {
                if (chartElement.length > 0) {
                    setDraggingIndex(chartElement[0].index); // Start dragging on click
                }
            },
            
        });

        const handleMouseMove = (e) => {
            if (draggingIndex !== null) {
                const chartY = chartRef.current.getBoundingClientRect().top;
                const chartHeight = chartRef.current.height;
                const mouseY = e.clientY - chartY;
                const newValue = ((1 - mouseY / chartHeight) * 100).toFixed(2); // Map mouseY to data range (0-100)

                onUpdate(draggingIndex, parseFloat(newValue));
            }
        };

        const handleMouseUp = () => {
            setDraggingIndex(null); // Stop dragging
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [data, draggingIndex, onUpdate]);

    return <canvas ref={chartRef} />;
};

export default LineChart;

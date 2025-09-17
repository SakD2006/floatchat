"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface DataVisualizationProps {
  data: Record<string, unknown>[];
}

export default function DataVisualization({ data }: DataVisualizationProps) {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");

  if (!data || data.length === 0) {
    return (
      <div className="mt-3 p-3 bg-black/20 rounded-lg">
        <div className="text-xs text-white/70">No data to display</div>
      </div>
    );
  }

  // Get column names from the first row
  const columns = Object.keys(data[0]);

  // Find numeric columns for potential plotting
  const numericColumns = columns.filter((col) => {
    const firstValue = data[0][col];
    return typeof firstValue === "number" || !isNaN(Number(firstValue));
  });

  const renderTable = () => (
    <div className="overflow-x-auto max-h-60">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/20">
            {columns.slice(0, 6).map((col) => (
              <th key={col} className="text-left p-2 text-white/70 font-medium">
                {col}
              </th>
            ))}
            {columns.length > 6 && (
              <th className="text-left p-2 text-white/70 font-medium">...</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row, index) => (
            <tr key={index} className="border-b border-white/10">
              {columns.slice(0, 6).map((col) => (
                <td key={col} className="p-2 text-white/90">
                  {String(row[col]).slice(0, 20)}
                  {String(row[col]).length > 20 && "..."}
                </td>
              ))}
              {columns.length > 6 && <td className="p-2 text-white/50">...</td>}
            </tr>
          ))}
          {data.length > 10 && (
            <tr>
              <td
                colSpan={columns.length}
                className="p-2 text-center text-white/50"
              >
                ... and {data.length - 10} more rows
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderChart = () => {
    if (numericColumns.length < 2) {
      return (
        <div className="text-xs text-white/50 p-4 text-center">
          Not enough numeric columns for chart visualization
        </div>
      );
    }

    // Create a simple scatter plot with first two numeric columns
    const xCol = numericColumns[0];
    const yCol = numericColumns[1];

    const plotData = [
      {
        x: data.map((row) => Number(row[xCol])),
        y: data.map((row) => Number(row[yCol])),
        type: "scatter" as const,
        mode: "markers" as const,
        marker: {
          color: "#00AC31",
          size: 6,
          line: {
            color: "#1FF4FF",
            width: 1,
          },
        },
        name: "Data Points",
      },
    ];

    const layout = {
      width: 400,
      height: 300,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "white", size: 10 },
      xaxis: {
        title: { text: xCol },
        gridcolor: "rgba(255,255,255,0.1)",
        color: "white",
      },
      yaxis: {
        title: { text: yCol },
        gridcolor: "rgba(255,255,255,0.1)",
        color: "white",
      },
      margin: { l: 40, r: 20, t: 20, b: 40 },
    };

    const config = {
      displayModeBar: false,
      responsive: true,
    };

    return (
      <div className="flex justify-center">
        <Plot data={plotData} layout={layout} config={config} />
      </div>
    );
  };

  return (
    <div className="mt-3 p-3 bg-black/20 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-white/70">
          Data ({data.length} records, {columns.length} columns)
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-2 py-1 text-xs rounded ${
              viewMode === "table"
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/50 hover:text-white/70"
            }`}
          >
            Table
          </button>
          {numericColumns.length >= 2 && (
            <button
              onClick={() => setViewMode("chart")}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === "chart"
                  ? "bg-white/20 text-white"
                  : "bg-white/5 text-white/50 hover:text-white/70"
              }`}
            >
              Chart
            </button>
          )}
        </div>
      </div>

      {viewMode === "table" ? renderTable() : renderChart()}
    </div>
  );
}

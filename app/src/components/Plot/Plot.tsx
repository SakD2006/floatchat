//Test file , plots will be added here, as said by Upayan. 
// Code will be added By ashman post receiving the LLM output.
// Might require few minor changes like in trajectory, but is wotking for all the sample responses i tried it for. 

"use client";

import React from "react";
import Plot from "react-plotly.js";

interface AxisMeta {
  label: string;
  units: string;
  data_key: string;
}

interface PlotMetadata {
  title: string;
  x_axis: AxisMeta;
  y_axis: AxisMeta;
  z_axis?: AxisMeta | null;
}

interface PlotData {
  data: Record<string, (string | number)[]>;
  group_by?: string | null;
}

interface APIResponse {
  summary: string;
  plot_type: string;
  plot_data: PlotData;
  plot_metadata: PlotMetadata;
}

interface PlotProps {
  apiResponse: APIResponse;
}

const PlotComponent: React.FC<PlotProps> = ({ apiResponse }) => {
  const { plot_data, plot_metadata } = apiResponse;
  const { data, group_by } = plot_data;

  const groups = group_by ? Array.from(new Set(data[group_by])) : [null];

  const traces = groups.map((group) => {
    const x: (string | number)[] = [];
    const y: (string | number)[] = [];

    data[plot_metadata.x_axis.data_key].forEach((_, idx) => {
      if (!group_by || data[group_by][idx] === group) {
        x.push(data[plot_metadata.x_axis.data_key][idx]);
        y.push(data[plot_metadata.y_axis.data_key][idx]);
      }
    });

    return {
      x,
      y,
      mode: "lines+markers",
      type: "scatter",
      name: group_by ? `${group_by}: ${group}` : plot_metadata.title,
    };
  });

  return (
    <div className="w-full">
      <Plot
        data={traces}
        layout={{
          title: {
            text: plot_metadata.title, // <-- Plot Title
            font: { size: 18 },
          },
          xaxis: {
            title: {
              text: `${plot_metadata.x_axis.label}${
                plot_metadata.x_axis.units ? ` (${plot_metadata.x_axis.units})` : ""
              }`, // <-- X Axis Title
            },
          },
          yaxis: {
            title: {
              text: `${plot_metadata.y_axis.label}${
                plot_metadata.y_axis.units ? ` (${plot_metadata.y_axis.units})` : ""
              }`, // <-- Y Axis Title
            },
            autorange:
              plot_metadata.y_axis.data_key.toLowerCase().includes("pressure") ||
              plot_metadata.y_axis.label.toLowerCase().includes("depth")
                ? "reversed"
                : true,
          },
          height: 500,
        }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default PlotComponent;

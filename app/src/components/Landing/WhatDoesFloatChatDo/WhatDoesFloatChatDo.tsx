import { Card } from "@/components/ui";
import { SubHeading } from "@/components/ui";

export default function WhatDoesFloatChatDo() {
  return (
    <Card className="max-w-7xl mx-auto p-8">
      <SubHeading text="What Does FloatChat Do?" />

      <ul>
        <li className="mb-4">
          Transforming ARGO NetCDF data into structured, queryable format
          (Postgres + PostGIS)
        </li>
        <li className="mb-4">
          Allowing conversational queries → precise SQL + visualization
        </li>
        <li className="mb-4">
           Offering real-time interactive dashboards (trajectories, depth-time
          plots)
        </li>
      </ul>
    </Card>
  );
}

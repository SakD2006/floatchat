import React from "react";
import Image from "next/image";
import { Card } from "@/components/ui";
import { SubHeading } from "@/components/ui";

const ICONS = [
  { src: "/icons/carbon_quadrant-plot.svg", alt: "carbon" },
  { src: "/icons/gravity-ui_thunderbolt.svg", alt: "thunderbolt" },
  { src: "/icons/lucide_brick-wall.svg", alt: "brick wall" },
  { src: "/icons/material-symbols_settings-rounded.svg", alt: "settings" },
];

const TEXTS = [
  "Profiles, trajectories, depth-time plots powered by Leaflet, Plotly, and Cesium",
  "ChromaDB + FAISS-based semantic indexing makes search accurate and context-aware",
  "Easily supports BGC floats, gliders, satellites. Scalable Postgres + vector DB schema",
  "NetCDF → PostgreSQL + PostGIS → Indexed for easy access, fully automated.",
];

const FeatureFrame: React.FC = () => {
  return (
    <Card className="min-w-[70vw] mx-auto p-8">
      <SubHeading text="Key Features" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full mt-6">
        {ICONS.map((icon, i) => (
          <div
            key={i}
            className="relative w-full aspect-square flex items-center justify-center"
          >
            <Image
              src={icon.src}
              alt={icon.alt}
              className="w-2/4 h-2/4 object-contain"
              width={100}
              height={150}
              draggable={false}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6 text-center text-white">
        {TEXTS.map((text, i) => (
          <p key={i} className="text-sm sm:text-base md:text-lg font-medium">
            {text}
          </p>
        ))}
      </div>
    </Card>
  );
};

export default FeatureFrame;

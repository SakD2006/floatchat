import { Card } from "@/components/ui";
import { SubHeading } from "@/components/ui";

export default function WhatsTheProblem() {
  return (
    <Card className="max-w-7xl mx-auto p-8">
      <SubHeading text="What's the Problem?" />

      <ul>
        <li className="mb-4">
          ARGO oceanographic data is stored in complex NetCDF files
        </li>
        <li className="mb-4">
          Researchers spend hours writing SQL or dealing with command-line tools
        </li>
        <li className="mb-4">
          Difficult for non-technical users to access geospatial ocean insights
        </li>
      </ul>
    </Card>
  );
}

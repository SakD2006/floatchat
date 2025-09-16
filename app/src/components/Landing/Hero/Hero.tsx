import GetStarted from "@/components/ui/GetStarted/GetStarted";
import { Heading } from "@/components/ui";

export default function Home() {
  return (
    <div className="select-none min-h-screen flex flex-col justify-center items-center px-4">
      <Heading text="FloatChat" />
      <p className="text-center text-sm sm:text-xl mb-4 text-gray-300">
        AI Powered Conversational Interface for ARGO Data Discovery and
        Visualization
      </p>
      <GetStarted />
    </div>
  );
}

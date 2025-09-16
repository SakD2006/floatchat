import GetStarted from "@/components/ui/GetStarted/GetStarted";
import { Heading } from "@/components/ui";

export default function Home() {
  return (
    <div className="select-none">
      <Heading text="FloatChat" />
      <GetStarted />
    </div>
  );
}

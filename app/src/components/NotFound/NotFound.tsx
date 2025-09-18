import { Heading, SubHeading } from "@/components/ui";
import Image from "next/image";

export default function NotFound() {
  const icon = "/icons/icon.svg";
  return (
    <div className="flex flex-col h-full min-w-full justify-center items-center">
      <Image
        src={icon}
        alt="App Icon"
        width={128}
        height={128}
        className="mb-4 self-start"
        draggable={false}
      />
      <div className="flex-grow flex flex-col justify-center items-center">
        <Heading text="404" />
        <SubHeading text="Page Not Found" />
      </div>
      <Image
        src={icon}
        alt="App Icon"
        width={128}
        height={128}
        className="mt-4 self-end"
        draggable={false}
      />
    </div>
  );
}

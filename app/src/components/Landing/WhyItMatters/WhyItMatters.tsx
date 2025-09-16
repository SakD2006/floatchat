import { Line, SubHeading } from "../../ui";

export default function WhyItMatters() {
  return (
    <div className="h-screen w-full flex flex-col items-center my-16 px-4">
      <SubHeading text="Why It Matters" />
      <Line shadowColor="#00AC31">Faster insights → Saves hours of work</Line>
      <Line shadowColor="#1FF4FF">Democratizes ocean data access</Line>
      <Line shadowColor="#00AC31">
        Enables data-driven decision-making for climate action
      </Line>
      <Line shadowColor="#1FF4FF">
        Enables data-driven decision-making for climate action
      </Line>
    </div>
  );
}

import Hero from "./Hero/Hero";
import WhatsTheProblem from "./WhatsTheProblem/WhatsTheProblem";
import WhatDoesFloatChatDo from "./WhatDoesFloatChatDo/WhatDoesFloatChatDo";
import KeyFeatures from "./KeyFeatures/KeyFeatures";
import WhyItMatters from "./WhyItMatters/WhyItMatters";

export default function Landing() {
  return (
    <div>
      <Hero />
      <WhatsTheProblem />
      <WhatDoesFloatChatDo />
      <KeyFeatures />
      <WhyItMatters />
    </div>
  );
}

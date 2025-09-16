"use client";

import { Input, GetStarted, Heading } from "@/components/ui";

export default function UIShowcase() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white space-y-10 p-5">
      <h1 className="text-4xl font-bold">UI Components Showcase</h1>
      <section>
        <Input
          type="text"
          placeholder="Sample Input"
          className="w-64 h-12 mb-4"
          required
          onChange={(e) => console.log(e.target.value)}
        />
        <p className="text-center">Input Component</p>
      </section>
      <section>
        <GetStarted />
        <p className="text-center">Get Started Button</p>
      </section>
      <section>
        <Heading text="Some Heading" />
        <p className="text-center mt-4">Heading Component</p>
      </section>
    </div>
  );
}

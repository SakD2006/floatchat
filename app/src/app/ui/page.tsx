"use client";
import Link from "next/link";
import { Input, GetStarted, Heading, useNotification } from "@/components/ui";

function Section({ id, children }: { id: string; children?: React.ReactNode }) {
  return (
    <section
      id={id}
      className="mb-8 border-2 w-full p-4 rounded-lg bg-gray-200/5"
      style={{
        backdropFilter: "blur(2px)",
      }}
    >
      <Link
        href={`#${id}`}
        className="justify-center flex align-middle justify-items-center"
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-400 hover:text-gray-300">
          {id}
        </h2>
      </Link>
      {children}
    </section>
  );
}

export default function UIShowcase() {
  const { notify } = useNotification();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white space-y-10 p-5">
      <h1 className="text-4xl font-bold">UI Components Showcase</h1>
      <Section id="Input">
        <Input
          type="text"
          placeholder="Sample Input"
          required
          onChange={(e) => console.log(e.target.value)}
        />
      </Section>
      <Section id="Get Started Button">
        <GetStarted />
      </Section>
      <Section id="Heading">
        <Heading text="Some Heading" />
      </Section>
      <Section id="Notifications">
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              type: "success" as const,
              message: "Operation completed successfully!",
              color: "bg-green-600 hover:bg-green-700",
            },
            {
              type: "error" as const,
              message: "Something went wrong!",
              color: "bg-red-600 hover:bg-red-700",
            },
            {
              type: "info" as const,
              message: "Here's some useful information!",
              color: "bg-blue-600 hover:bg-blue-700",
            },
            {
              type: "warning" as const,
              message: "Please be careful with this action!",
              color: "bg-yellow-600 hover:bg-yellow-700",
            },
          ].map((notification, index) => (
            <button
              key={index}
              onClick={() => notify(notification.message, notification.type)}
              className={`px-6 py-3 ${notification.color} rounded-lg transition capitalize`}
            >
              {notification.type} Notification
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

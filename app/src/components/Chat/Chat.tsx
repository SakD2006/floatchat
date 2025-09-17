"use client";

import { SubHeading } from "@/components/ui";
import ChatInput from "./ChatInput/ChatInput";
import { useAuth } from "@/lib/AuthContext";

export default function Chat() {
  const { user } = useAuth();

  const getGreeting = () => {
    if (user?.name) {
      return `Welcome back, ${user.name}`;
    }
    if (user?.email) {
      const name = user.email.split("@")[0];
      return `Welcome back, ${name}`;
    }
    return "Welcome back!";
  };

  return (
    <div className="">
      <SubHeading text={getGreeting()} />
      <ChatInput />
    </div>
  );
}

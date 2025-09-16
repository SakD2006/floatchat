"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { useNotification, Input } from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();
  const { refreshAuth } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("[REGISTER] Starting registration process...");

      // Direct registration without CSRF in development
      const registerResponse = await api.post(
        "/api/auth/register",
        { name, username, email, password },
        {
          withCredentials: true,
        }
      );

      console.log("[REGISTER] Registration response:", registerResponse.data);

      if (typeof document !== "undefined") {
        console.log("[REGISTER] Cookies after registration:", document.cookie);
      }

      // Give a moment for cookies to be set
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (registerResponse.data.user) {
        try {
          // Verify session after auto-login
          const { data } = await api.get("/api/auth/profile", {
            withCredentials: true,
          });

          console.log("[REGISTER] Profile check response:", data);

          if (data?.user) {
            notify(
              "Registration successful! You are now logged in.",
              "success"
            );

            // Update auth context state
            await refreshAuth();

            setTimeout(() => {
              router.push("/profile");
            }, 1000);
          } else {
            notify("Registration successful! Please log in.", "success");
            setTimeout(() => {
              router.push("/auth/login");
            }, 1000);
          }
        } catch (meError) {
          console.log("[REGISTER] Profile check failed:", meError);
          notify("Registration successful! Please log in.", "success");
          setTimeout(() => {
            router.push("/auth/login");
          }, 1000);
        }
      } else {
        notify("Registration successful! Please log in.", "success");
        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
      }
    } catch (err: unknown) {
      console.error("[REGISTER] Error:", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        notify(
          axiosError.response?.data?.error || "Registration failed",
          "error"
        );
      } else {
        notify("Registration failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          color="#00AC31"
        />
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          color=""
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          color="#00AC31"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          color="#FFFFFF"
        />
        <button className="mx-auto block" type="submit" disabled={loading}>
          <Image
            src="/icons/arrow-right.svg"
            alt="Arrow Right"
            width={40}
            height={40}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link href="/auth/login" className="text-blue-500 underline">
          Login
        </Link>
      </p>
    </div>
  );
}

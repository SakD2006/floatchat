"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { Input } from "../../ui";
import { useNotification } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const csrfRes = await api.get("/api/csrf-token", {
        withCredentials: true,
      });
      const csrfToken = csrfRes.data.csrfToken;
      const loginResponse = await api.post(
        "/api/auth/login",
        { email, password },
        {
          withCredentials: true,
          headers: { "x-csrf-token": csrfToken },
        }
      );

      console.log("[LOGIN] Login response:", loginResponse.data);

      if (typeof document !== "undefined") {
        console.log("[LOGIN] Cookies after login:", document.cookie);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      if (typeof document !== "undefined") {
        console.log("[LOGIN] Cookies before /profile:", document.cookie);
      }

      const { data } = await api.get("/api/auth/profile", {
        withCredentials: true,
      });

      console.log("[LOGIN] /profile response:", data);

      if (data?.user) {
        window.location.href = "/profile";
      } else {
        notify(
          "Login succeeded but session verification failed. Please try again.",
          "error"
        );
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        notify(axiosError.response?.data?.error || "Login failed", "error");
      } else {
        notify("Login failed", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <form onSubmit={handleSubmit}>
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
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-blue-500 underline">
          Register
        </Link>
      </p>
    </div>
  );
}

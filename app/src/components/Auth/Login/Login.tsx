"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { Input } from "../../ui";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Fetch CSRF token
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

      // Log cookies after login
      if (typeof document !== "undefined") {
        console.log("[LOGIN] Cookies after login:", document.cookie);
      }

      // Small delay to ensure cookies are set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Fetch current user to confirm session
      if (typeof document !== "undefined") {
        console.log("[LOGIN] Cookies before /me:", document.cookie);
      }

      const { data } = await api.get("/api/auth/me", {
        withCredentials: true,
      });

      console.log("[LOGIN] /me response:", data);

      if (data?.user) {
        // Use window.location to ensure a full page reload and proper session state
        window.location.href = "/me";
      } else {
        setError(
          "Login succeeded but session verification failed. Please try again."
        );
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        setError(axiosError.response?.data?.error || "Login failed");
      } else {
        setError("Login failed");
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
        {error && <div style={{ color: "red" }}>{error}</div>}
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

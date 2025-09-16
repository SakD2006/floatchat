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
      await api.post("/api/auth/login", { email, password });
      // Fetch current user to confirm session
      const { data } = await api.get("/api/auth/me");
      if (data?.user) {
        window.location.href = "/me";
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

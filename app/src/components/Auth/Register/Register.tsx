"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { Input } from "../../ui";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Fetch CSRF token
      const csrfRes = await api.get("/api/csrf-token", {
        withCredentials: true,
      });
      const csrfToken = csrfRes.data.csrfToken;
      const registerResponse = await api.post(
        "/api/auth/register",
        { name, username, email, password },
        {
          withCredentials: true,
          headers: { "x-csrf-token": csrfToken },
        }
      );

      console.log("[REGISTER] Registration response:", registerResponse.data);

      // Check if user was auto-logged in during registration
      if (registerResponse.data.user) {
        // Verify session with /me endpoint
        try {
          const { data } = await api.get("/api/auth/me", {
            withCredentials: true,
          });
          if (data?.user) {
            setSuccess("Registration successful! You are now logged in.");
            // Use window.location to ensure a full page reload
            setTimeout(() => {
              window.location.href = "/me";
            }, 1000);
          } else {
            setSuccess("Registration successful! Please log in.");
          }
        } catch (meError) {
          console.log("[REGISTER] /me check failed:", meError);
          setSuccess("Registration successful! Please log in.");
        }
      } else {
        setSuccess("Registration successful! Please log in.");
      }
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as AxiosError<{ error?: string }>;
        setError(axiosError.response?.data?.error || "Registration failed");
      } else {
        setError("Registration failed");
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
        />
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        {success && <div style={{ color: "green" }}>{success}</div>}
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

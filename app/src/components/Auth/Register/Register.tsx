"use client";

import { useState } from "react";
import { api } from "@/utils/api";
import { AxiosError } from "axios";
import { Input } from "../../ui";
import { useNotification } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
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
      const registerResponse = await api.post(
        "/api/auth/register",
        { name, username, email, password },
        {
          withCredentials: true,
          headers: { "x-csrf-token": csrfToken },
        }
      );

      console.log("[REGISTER] Registration response:", registerResponse.data);

      if (registerResponse.data.user) {
        try {
          const { data } = await api.get("/api/auth/profile", {
            withCredentials: true,
          });
          if (data?.user) {
            notify(
              "Registration successful! You are now logged in.",
              "success"
            );

            setTimeout(() => {
              window.location.href = "/profile";
            }, 1000);
          } else {
            notify("Registration successful! Please log in.", "success");
          }
        } catch (meError) {
          console.log("[REGISTER] /profile check failed:", meError);
          notify("Registration successful! Please log in.", "success");
        }
      } else {
        notify("Registration successful! Please log in.", "success");
      }
    } catch (err: unknown) {
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

"use client";

import { useEffect, useState } from "react";
import api from "../utils/api";

type User = {
  id?: number;
  email: string;
  name?: string;
  google_id?: string;
};

export default function MePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 32 }}>
      <h2>Welcome, {user.name || user.email}</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <form method="POST" action="/api/auth/logout">
        <button type="submit">Logout</button>
      </form>
    </div>
  );
}

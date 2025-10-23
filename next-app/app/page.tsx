"use client";

import React, { useEffect, useState } from "react";

export type Todo = { id: string; text: string; done: boolean; updatedAt?: number };

const LOCAL_KEY = "todos_v1";
function getId() { return Date.now().toString(); }

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]); // start empty for SSR safety
  const [text, setText] = useState("");

  // On mount, read localStorage — defer the setState to the next tick to avoid
  // the "setState in effect" ESLint complaint and also avoid hydration mismatch.
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(LOCAL_KEY);
      if (!raw) return;
      // defer setState to next tick to avoid "sync setState in effect" warning
      setTimeout(() => {
        try {
          const parsed = JSON.parse(raw) as Todo[];
          setTodos(parsed);
        } catch {
          // ignore parse errors
        }
      }, 0);
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage whenever todos change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(todos));
      }
    } catch {
      // ignore write errors
    }
  }, [todos]);

  function addTodo() {
    if (!text.trim()) return;
    const t: Todo = { id: getId(), text: text.trim(), done: false, updatedAt: Date.now() };
    setTodos(prev => [t, ...prev]);
    setText("");
  }

  function toggleTodo(id: string) {
    setTodos(prev => prev.map(td => (td.id === id ? { ...td, done: !td.done, updatedAt: Date.now() } : td)));
  }

  function deleteTodo(id: string) {
    setTodos(prev => prev.filter(td => td.id !== id));
  }

  return (
    <div style={{ padding: 20, fontFamily: "Inter, Arial, sans-serif" }}>
      <h1>Todo (Next.js + TypeScript)</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add todo..."
          style={{ padding: 8, width: "60%" }}
        />
        <button onClick={addTodo} style={{ marginLeft: 8, padding: "8px 12px" }}>Add</button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => {
          if (window.confirm("Clear all todos from localStorage?")) {
            localStorage.removeItem(LOCAL_KEY);
            setTodos([]);
          }
        }}>
          Clear all todos
        </button>
      </div>

      <ul style={{ paddingLeft: 0 }}>
        {todos.map(t => (
          <li key={t.id} style={{ listStyle: "none", marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={t.done} onChange={() => toggleTodo(t.id)} />
            <span style={{ textDecoration: t.done ? "line-through" : undefined }}>{t.text}</span>
            <button onClick={() => deleteTodo(t.id)} style={{ marginLeft: "auto" }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

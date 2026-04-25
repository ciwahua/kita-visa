import React, { useState } from "react";
import { analyzeTextGapsWithAI } from "../../services/aiService";
import "./visaChat.css";

export default function VisaChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I’m your Visa Assistant. Ask me anything about your application."
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: input,
            history: messages
        })
        });

        const data = await res.json();

      // Assistant response
      const assistantMessage = {
        role: "assistant",
        content:
          res?.answer ||
          "I checked your request. Let me know if you need more clarification."
      };

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer }
        ]);

      // 🔗 COPILOT BRIDGE: update dashboard tasks if AI returns gaps
      if (res?.gaps) {
        window.dispatchEvent(
          new CustomEvent("updateTasks", {
            detail: res.gaps
          })
        );
      }

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn’t process that. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-input-section">
      
      <h3>Visa Assistant</h3>

      {/* CHAT BOX */}
        <div className="chat-box">
        {messages.map((msg, i) => (
            <div
            key={i}
            className={`chat-row ${msg.role}`}
            >
            <div className={`chat-bubble ${msg.role}`}>
                {msg.content}
            </div>
            </div>
        ))}

        {loading && (
            <div className="chat-row assistant">
            <div className="chat-bubble assistant">
                Thinking...
            </div>
            </div>
        )}
        </div>

      {/* INPUT */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your visa application..."
        className="dashboard-input-textarea"
        disabled={loading}
      />

      <button
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        className="ai-input-btn"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </div>
  );
}
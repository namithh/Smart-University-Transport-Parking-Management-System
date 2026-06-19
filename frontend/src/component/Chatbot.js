import React, { useState, useRef, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { MdWavingHand } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [chat, isOpen]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:8000/api/chatbot/chat", {
        message,
      });

      const botMsg = { sender: "bot", text: res.data.reply };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      const botMsg = {
        sender: "bot",
        text: `❌ ${err.response?.data?.message || err.message || "Failed to get response"}`,
      };
      setChat((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .cb-wrapper * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }

        /* Floating Button */
        .cb-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 24px rgba(15,23,42,0.35), 0 0 0 0 rgba(56,189,248,0.4);
          transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s ease;
          z-index: 9999;
        }
        .cb-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 32px rgba(15,23,42,0.45), 0 0 0 8px rgba(56,189,248,0.12);
        }
        .cb-fab:active { transform: scale(0.97); }

        .cb-fab-icon {
          width: 28px;
          height: 28px;
          transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
        }
        .cb-fab.open .cb-fab-icon { transform: rotate(90deg) scale(0.9); }

        /* Pulse ring */
        .cb-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(56,189,248,0.2);
          animation: cb-pulse 2.5s ease-out infinite;
        }
        @keyframes cb-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .cb-fab.open .cb-pulse { animation: none; opacity: 0; }

        /* Unread dot */
        .cb-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 11px;
          height: 11px;
          background: #38bdf8;
          border-radius: 50%;
          border: 2px solid #fff;
          transition: opacity 0.2s;
        }

        .cb-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cb-wave {
  color: #fbbf24;
  font-size: 18px;
  animation: cb-wave 1.5s infinite;
  transform-origin: 70% 70%;
}
  @keyframes cb-wave {
  0% { transform: rotate(0deg); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-8deg); }
  40% { transform: rotate(14deg); }
  50% { transform: rotate(-4deg); }
  60% { transform: rotate(10deg); }
  70% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
}

        /* Chat Window */
        .cb-window {
          position: fixed;
          bottom: 100px;
          right: 28px;
          width: 360px;
          height: 500px;
          background: #f8fafc;
          border-radius: 20px;
          box-shadow: 0 24px 80px rgba(15,23,42,0.2), 0 0 0 1px rgba(15,23,42,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 9998;
          transform-origin: bottom right;
          animation: cb-open 0.3s cubic-bezier(.34,1.56,.64,1) forwards;
        }
        .cb-window.closing {
          animation: cb-close 0.2s ease-in forwards;
        }
        @keyframes cb-open {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cb-close {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to   { opacity: 0; transform: scale(0.7) translateY(20px); }
        }

        /* Header */
        .cb-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .cb-avatar {
          width: 38px;
          height: 38px;
          background: rgba(56,189,248,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(56,189,248,0.3);
        }
        .cb-header-text h4 {
          margin: 0;
          color: #f0f9ff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }
        .cb-header-text span {
          font-size: 11.5px;
          color: #7dd3fc;
          font-weight: 300;
        }
        .cb-header-status {
          width: 7px;
          height: 7px;
          background: #4ade80;
          border-radius: 50%;
          display: inline-block;
          margin-right: 5px;
          box-shadow: 0 0 6px #4ade80;
        }
        .cb-close-btn {
          margin-left: auto;
          background: rgba(255,255,255,0.08);
          border: none;
          cursor: pointer;
          color: #94a3b8;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .cb-close-btn:hover { background: rgba(255,255,255,0.15); color: #f0f9ff; }

        /* Messages */
        .cb-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f1f5f9;
        }
        .cb-messages::-webkit-scrollbar { width: 4px; }
        .cb-messages::-webkit-scrollbar-track { background: transparent; }
        .cb-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

        .cb-msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: cb-msg-in 0.25s ease forwards;
        }
        @keyframes cb-msg-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cb-msg-row.user { flex-direction: row-reverse; }

        .cb-msg-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .cb-msg-avatar.bot { background: #0f172a; }
        .cb-msg-avatar.user { background: #38bdf8; }

        .cb-bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 13.5px;
          line-height: 1.55;
          font-weight: 400;
          word-break: break-word;
        }
        .cb-bubble.bot {
          background: #fff;
          color: #1e293b;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.07);
        }
        .cb-bubble.user {
          background: linear-gradient(135deg, #0ea5e9, #0f172a);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        /* Typing indicator */
        .cb-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 10px 14px;
          background: #fff;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
          box-shadow: 0 1px 4px rgba(15,23,42,0.07);
          width: fit-content;
        }
        .cb-dot {
          width: 7px; height: 7px;
          background: #94a3b8;
          border-radius: 50%;
          animation: cb-bounce 1.2s infinite;
        }
        .cb-dot:nth-child(2) { animation-delay: 0.15s; }
        .cb-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes cb-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }

        /* Welcome */
        .cb-welcome {
          text-align: center;
          padding: 24px 16px;
          color: #64748b;
        }
        .cb-welcome-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #0f172a, #1e3a5f);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }
        .cb-welcome h5 {
          margin: 0 0 6px;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .cb-welcome p { margin: 0; font-size: 12.5px; font-weight: 300; }

        /* Input */
        .cb-input-area {
          padding: 12px 14px;
          background: #fff;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 8px;
          align-items: center;
          flex-shrink: 0;
        }
        .cb-input {
          flex: 1;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 9px 14px;
          font-size: 13.5px;
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          resize: none;
        }
        .cb-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.12);
          background: #fff;
        }
        .cb-input::placeholder { color: #94a3b8; }

        .cb-send {
          width: 38px;
          height: 38px;
          background: linear-gradient(135deg, #0ea5e9, #0f172a);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s, opacity 0.2s;
        }
        .cb-send:hover { transform: scale(1.08); }
        .cb-send:active { transform: scale(0.95); }
        .cb-send:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="cb-wrapper">
        {/* Floating Action Button */}
        <button
          className={`cb-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Open chat"
        >
          {!isOpen && <span className="cb-pulse" />}
          {chat.length === 0 && !isOpen && <span className="cb-badge" />}

          {isOpen ? (
            /* Close X icon */
            <svg
              className="cb-fab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            /* Bot icon */
            <svg
              className="cb-fab-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.8"
            >
              <rect x="3" y="8" width="18" height="12" rx="3" />
              <circle cx="9" cy="14" r="1.5" fill="#38bdf8" stroke="none" />
              <circle cx="15" cy="14" r="1.5" fill="#38bdf8" stroke="none" />
              <path d="M12 3v5M10 3h4" strokeLinecap="round" />
              <circle cx="12" cy="3" r="1" fill="#38bdf8" stroke="none" />
            </svg>
          )}
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="cb-window">
            {/* Header */}
            <div className="cb-header">
              <div className="cb-avatar">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="8" width="18" height="12" rx="3" />
                  <circle cx="9" cy="14" r="1.5" fill="#38bdf8" stroke="none" />
                  <circle
                    cx="15"
                    cy="14"
                    r="1.5"
                    fill="#38bdf8"
                    stroke="none"
                  />
                  <path d="M12 3v5M10 3h4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="cb-header-text">
                <h4>AI Assistant</h4>
                <span>
                  <span className="cb-header-status" />
                  Online
                </span>
              </div>
              <button
                className="cb-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="cb-messages">
              {chat.length === 0 ? (
                <div className="cb-welcome">
                  <div className="cb-welcome-icon">
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="8" width="18" height="12" rx="3" />
                      <circle
                        cx="9"
                        cy="14"
                        r="1.5"
                        fill="#38bdf8"
                        stroke="none"
                      />
                      <circle
                        cx="15"
                        cy="14"
                        r="1.5"
                        fill="#38bdf8"
                        stroke="none"
                      />
                      <path d="M12 3v5M10 3h4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h5 className="cb-title">
                    Hey there! <MdWavingHand className="cb-wave" />
                  </h5>
                  <p>Ask me anything — I'm here to help.</p>
                </div>
              ) : (
                chat.map((msg, i) => (
                  <div key={i} className={`cb-msg-row ${msg.sender}`}>
                    <div className={`cb-msg-avatar ${msg.sender}`}>
                      {msg.sender === "bot" ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                        >
                          <rect x="3" y="8" width="18" height="12" rx="3" />
                          <circle
                            cx="9"
                            cy="14"
                            r="1.5"
                            fill="#38bdf8"
                            stroke="none"
                          />
                          <circle
                            cx="15"
                            cy="14"
                            r="1.5"
                            fill="#38bdf8"
                            stroke="none"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2.2"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path
                            d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div className={`cb-bubble ${msg.sender}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                ))
              )}

              {isTyping && (
                <div className="cb-msg-row bot">
                  <div className="cb-msg-avatar bot">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                    >
                      <rect x="3" y="8" width="18" height="12" rx="3" />
                      <circle
                        cx="9"
                        cy="14"
                        r="1.5"
                        fill="#38bdf8"
                        stroke="none"
                      />
                      <circle
                        cx="15"
                        cy="14"
                        r="1.5"
                        fill="#38bdf8"
                        stroke="none"
                      />
                    </svg>
                  </div>
                  <div className="cb-typing">
                    <div className="cb-dot" />
                    <div className="cb-dot" />
                    <div className="cb-dot" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="cb-input-area">
              <input
                ref={inputRef}
                className="cb-input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask something..."
                disabled={isTyping}
              />
              <button
                className="cb-send"
                onClick={sendMessage}
                disabled={!message.trim() || isTyping}
                aria-label="Send"
              >
                <IoSend size={18} color="#fff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Chatbot;

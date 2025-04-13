import React, { useState, useEffect, useRef } from "react";
import { Bot, Mic, Send, AlertTriangle, LogOut } from "lucide-react";
import ChatSidebar from "./ChatSidebar";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const SerenaChat: React.FC = () => {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [inCall, setInCall] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = "pt-BR";
  recognition.interimResults = false;
  recognition.continuous = false;

  const synth = window.speechSynthesis;

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      simulateBotResponse(text);
    }, 500);
  };

  const simulateBotResponse = (input: string) => {
    const reply = `${t("chat.youSaid")} "${input}".`;
    const botMsg: Message = { sender: "bot", text: reply };
    setMessages((prev) => [...prev, botMsg]);
    speak(reply);
  };

  const speak = (text: string) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.onend = () => {
      if (inCall) recognition.start();
    };
    synth.speak(utterance);
  };

  const handleCallToggle = () => {
    if (!inCall) {
      setInCall(true);
      recognition.start();
    } else {
      setInCall(false);
      recognition.stop();
      synth.cancel();
    }
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    const userMsg: Message = { sender: "user", text: transcript };
    setMessages((prev) => [...prev, userMsg]);

    const reply = `${t("chat.youSaid")} "${transcript}"`;
    const botMsg: Message = { sender: "bot", text: reply };
    setMessages((prev) => [...prev, botMsg]);

    speak(reply);
  };

  recognition.onerror = () => {
    if (inCall) {
      recognition.stop();
      setTimeout(() => recognition.start(), 1000);
    }
  };

  recognition.onend = () => {
    if (inCall && !synth.speaking) {
      setTimeout(() => recognition.start(), 1000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0d0d0d] text-white">
      <ChatSidebar
        currentChatId={chatId}
        onSelectChat={(id) => setChatId(id)}
        onCreateNew={() => setMessages([])}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-700 px-4 py-6">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            title={t("chat.goHome")}
          >
            <Bot size={32} className="text-green-500" />
            <h1 className="text-2xl md:text-3xl font-bold font-sans text-white">
              {t("header.title")}
            </h1>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-transform hover:scale-110"
            title={t("chat.goHome")}
          >
            <LogOut size={28} />
          </button>
        </div>

        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${
                  msg.sender === "user"
                    ? "bg-green-700 text-white"
                    : "bg-gray-800 text-gray-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 p-4 bg-[#1a1a1a]">
          <div className="w-full flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend(input)
              }
              placeholder={t("chat.placeholder")}
              rows={2}
              className="flex-1 bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-400 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
            />
            <button
              onClick={() => handleSend(input)}
              className="bg-green-600 hover:bg-green-500 p-3 rounded-xl text-white transition-colors"
              title={t("chat.send")}
            >
              <Send size={20} />
            </button>
            <button
              onClick={handleCallToggle}
              className={`${
                inCall ? "bg-red-600" : "bg-gray-700"
              } hover:bg-opacity-80 p-3 rounded-xl text-white transition-colors`}
              title={inCall ? t("chat.endCall") : t("chat.startCall")}
            >
              {inCall ? "⛔" : <Mic size={20} />}
            </button>
          </div>
        </div>

        <div className="bg-[#111] text-xs text-gray-400 text-center px-4 py-3 border-t border-gray-800 flex items-center justify-center gap-2">
          <AlertTriangle size={16} className="text-yellow-400" />
          <span>{t("chat.warning")}</span>
        </div>
      </div>
    </div>
  );
};

export default SerenaChat;

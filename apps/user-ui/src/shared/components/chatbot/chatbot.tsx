"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectLanguage = (text: string): "ar" | "en" => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text) ? "ar" : "en";
  };
  const speak = (text: string) => {
    stopSpeaking();
    const lang = detectLanguage(text) === "ar" ? "ar-EG" : "en-US";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
  };

  const startListening = () => {
    stopSpeaking();

    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("🎤 Speech Recognition is not supported in this browser.");
      return;
    }

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new Recognition();
    recognitionRef.current.lang = "ar-EG";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      handleSendMessage(transcript);
    };

    recognitionRef.current.onerror = (e: any) => {
      console.error("Speech error:", e);
    };

    recognitionRef.current.start();
  };

  const handleSendMessage = async (messageOverride: string | null = null) => {
    const messageToSend = messageOverride || inputValue;
    if (!messageToSend.trim()) return;

    stopSpeaking();

    setMessages((prev) => [...prev, { sender: "user", text: messageToSend }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8081/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      speak(data.reply);
    } catch (err) {
      console.error(err);
      const errorText = "⚠️ Error: Could not reach the chatbot.";
      setMessages((prev) => [...prev, { sender: "bot", text: errorText }]);
      speak(errorText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 h-[450px] bg-white rounded-xl shadow-lg flex flex-col z-50">
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-xl">
            <h3 className="font-bold">🎨 Bingo Craft Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white text-xl"
            >
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-xs whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-sm text-gray-500">Bot is typing...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2 border-t flex gap-2 items-center"
          >
            <button
              type="button"
              onClick={startListening}
              className="text-blue-600 hover:text-blue-800 text-xl"
              title="Voice input"
            >
              🎤
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              className="text-red-600 hover:text-red-800 text-xl"
              title="Stop speaking"
            >
              🔇
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type or speak..."
              className="flex-1 p-2 border rounded-md text-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
              disabled={isLoading}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 bg-blue-600 p-4 rounded-full text-white shadow-lg hover:bg-blue-700 z-50"
        aria-label="Open Chat"
      >
        💬
      </button>
    </>
  );
};

export default Chatbot;

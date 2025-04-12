import React, { useEffect, useRef, useState } from "react";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useI18n } from "../i18n/I18nContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      setMouse({ x: offsetX, y: offsetY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (blurRef.current) {
      blurRef.current.style.transform = `translate(${mouse.x - 128}px, ${mouse.y - 128}px)`;
    }
  }, [mouse]);

  const handleTestClick = () => {
    const button = document.getElementById("test-button");
    if (button) {
      button.classList.add("scale-110");
      setTimeout(() => {
        button.classList.remove("scale-110");
        navigate("/chat");
      }, 200);
    } else {
      navigate("/chat");
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-[#0d0d0d] text-white"
    >
      <div
        ref={blurRef}
        className="pointer-events-none absolute w-64 h-64 bg-green-500 
                   opacity-20 blur-2xl rounded-full z-0"
      />

      <div className="absolute top-0 right-0 p-4 z-20">
        <Header />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
        <div className="flex items-center gap-3 mb-8">
          <Bot size={40} className="text-green-500" />
          <h1 className="text-4xl font-bold font-sans">{t("header.title")}</h1>
        </div>

        <p className="text-center text-lg md:text-xl text-gray-300 max-w-xl mb-10">
          {t("header.subtitle")}
        </p>

        <div className="flex gap-4">
          <button
            id="test-button"
            onClick={handleTestClick}
            className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 
                       rounded-2xl text-lg font-semibold transition-all 
                       transform duration-200"
          >
            {t("home.testNow")}
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white 
                       px-6 py-3 rounded-2xl text-lg font-semibold 
                       transition-all"
          >
            {t("home.register")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

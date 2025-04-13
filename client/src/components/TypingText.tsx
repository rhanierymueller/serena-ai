import { useEffect, useState } from "react";

export const TypingText: React.FC<{ text: string }> = ({ text }) => {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (index < text.length) {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setDisplayed("");
          setIndex(0);
        }, 2000);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [index, text]);

  return (
    <span>
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
};

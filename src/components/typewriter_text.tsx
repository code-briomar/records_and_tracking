import { useEffect, useRef, useState } from "react";

export default function TypewriterText({
  text = "",
  speed = 50,
  className = "",
}) {
  const [displayedText, setDisplayedText] = useState("");
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index.current));
      index.current += 1;
      if (index.current >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <p
      className={`whitespace-pre-wrap text-gray-800 dark:text-gray-200 ${className}`}
    >
      {displayedText}
      <span className="inline-block w-1 h-5 bg-gray-800 dark:bg-gray-200 animate-pulse ml-1" />
    </p>
  );
}

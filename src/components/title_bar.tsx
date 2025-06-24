import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize, Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import "../App.css";

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [time, setTime] = useState(new Date());
  const [path, setPath] = useState("/");

  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    checkMaximized();

    const timer = setInterval(() => {
      setTime(new Date());
      setPath(window.location.pathname);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minimize = () => appWindow.minimize();
  const toggleMaximize = async () => {
    await appWindow.toggleMaximize();
    setIsMaximized(await appWindow.isMaximized());
  };
  const close = () => appWindow.close();

  const formatTime = (date: Date) =>
    // UTC + 3 hours Nairobi time
    date.toLocaleTimeString("en-US", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <div
      className="title-bar"
      data-tauri-drag-region
      style={{
        height: "38px",
        backgroundColor: "#1e1e1e",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 12px",
        fontFamily: "Inter, sans-serif",
        userSelect: "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {/* Left: App title */}
      <div
        style={{
          fontFamily: "'mononoki', monospace",
          fontSize: "13px",
          color: "#dddddd",
          fontWeight: 600,
        }}
      >
        Records & Tracking
      </div>

      {/* Center: Info */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'mononoki', monospace",
          fontSize: "12px",
          color: "#999999",
          textAlign: "center",
        }}
      >
        {formatTime(time)} | <span style={{ opacity: 0.7 }}>{path}</span>
      </div>

      {/* Right: Controls */}
      <div style={{ display: "flex", gap: "6px" }}>
        <ControlButton
          Icon={Minus}
          onClick={minimize}
          isDestructive={undefined}
        />
        <ControlButton
          Icon={isMaximized ? Square : Maximize}
          onClick={toggleMaximize}
          isDestructive={undefined}
        />
        <ControlButton Icon={X} onClick={close} isDestructive />
      </div>
    </div>
  );
};

type ControlButtonProps = {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  isDestructive?: boolean;
};

const ControlButton = ({
  Icon,
  onClick,
  isDestructive,
}: ControlButtonProps) => (
  <button
    onClick={onClick}
    style={{
      width: "28px",
      height: "28px",
      border: "none",
      backgroundColor: "transparent",
      color: isDestructive ? "#ff5f56" : "#cccccc",
      cursor: "pointer",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2a2a2a")}
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    <Icon width={16} height={16} />
  </button>
);

export default TitleBar;


  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";
  import { initializeLocale } from "./app/utils/localeDetection";

  // Initialize international locale detection
  initializeLocale();

  createRoot(document.getElementById("root")!).render(<App />);
  
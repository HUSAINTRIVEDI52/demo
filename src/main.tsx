import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Remove initial loader once React takes over
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.3s ease-out';
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
};

// Start React app
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Remove initial loader after a short delay to ensure React has rendered
setTimeout(removeInitialLoader, 100);

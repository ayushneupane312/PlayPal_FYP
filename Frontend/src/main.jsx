import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./utils/setupAxios.js";
import { loadAuthToken } from "./utils/setupAxios.js";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

loadAuthToken();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
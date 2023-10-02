import React from "react";

import App from "./App";
import "./index.css";
import { createRoot } from "react-dom/client";

const container = document.getElementById("root");
const root = createRoot(container!);
// @ts-ignore
root.render(<App />);

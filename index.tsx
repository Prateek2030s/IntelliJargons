import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Page/ActualApp";  //as for the demo only

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    window.location.replace(`https:${window.location.href.substring(window.location.protocol.length)}`);
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

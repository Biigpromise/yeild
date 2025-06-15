
import { useEffect } from "react";

// Declare window.$crisp and window.CRISP_WEBSITE_ID for TypeScript type safety
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

// Replace this with your real Crisp website ID if you have one!
const CRISP_WEBSITE_ID = "509c9eaa-bb98-408f-9d91-2dabcb03e8df"; // demo ID

const CrispChatWidget = () => {
  useEffect(() => {
    // Only add once
    if (window.$crisp) return;
    window.$crisp = [];
    (function () {
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    })();
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
  }, []);

  return null;
};

export default CrispChatWidget;

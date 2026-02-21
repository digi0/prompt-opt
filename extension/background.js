chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== "OPTIMIZE") return;

  (async () => {
    try {
      const res = await fetch("http://localhost:8000/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: msg.prompt })
      });

      const data = await res.json();
      sendResponse({ ok: true, data });
    } catch (err) {
      sendResponse({ ok: false, error: String(err) });
    }
  })();

  // IMPORTANT: keep the message channel open for async response
  return true;
});
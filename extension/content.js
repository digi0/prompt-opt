function callOptimize(prompt) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "OPTIMIZE", prompt }, (resp) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!resp || !resp.ok) {
        reject(new Error(resp?.error || "Unknown error"));
        return;
      }
      resolve(resp.data);
    });
  });
}

function findTextArea() {
  // ChatGPT main composer (textarea) — most common
  const ta = document.querySelector('textarea[data-id="root"]') || document.querySelector("textarea");
  if (ta) return ta;

  // Fallback: contenteditable composer (some variants)
  const ce = document.querySelector('[contenteditable="true"][role="textbox"]')
    || document.querySelector('[contenteditable="true"]');
  return ce;
}

function getBoxText(box) {
  return box.value !== undefined ? box.value : (box.innerText || "");
}

function setBoxText(box, text) {
  if (box.value !== undefined) {
    box.focus();
    box.value = text;

    // Fire multiple events that React-based apps listen to
    box.dispatchEvent(new Event("input", { bubbles: true }));
    box.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "a" }));
    box.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    box.focus();
    box.innerText = text;
    box.dispatchEvent(new InputEvent("input", { bubbles: true }));
  }
}

function injectButton() {
  if (document.getElementById("prompt-opt-btn")) return;

  const btn = document.createElement("button");
  btn.id = "prompt-opt-btn";
  btn.type = "button";
  btn.textContent = "Optimize";

  // Move it UP so ChatGPT overlays don't steal clicks
  btn.style.cssText = `
    position: fixed;
    right: 18px;
    bottom: 90px;
    z-index: 2147483647;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.25);
    background: #ffffff;
    color: #111;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    pointer-events: auto;
    box-shadow: 0 10px 24px rgba(0,0,0,0.20);
    user-select: none;
  `;

  // DEBUG: immediate visual response on click-down (proves events are firing)
  btn.addEventListener("pointerdown", () => {
    btn.textContent = "Clicked ✅";
    setTimeout(() => (btn.textContent = "Optimize"), 600);
  });

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const box = findTextArea();
    if (!box) return alert("No prompt box found.");

    const text = getBoxText(box).trim();
    if (!text) return;

    btn.textContent = "Optimizing…";
    btn.disabled = true;

    try {
      const data = await callOptimize(text);
      setBoxText(box, data.optimized);

      const pct = data?.est?.savings_pct;
      btn.textContent = (typeof pct === "number")
        ? `Optimized (${pct}% saved)`
        : "Optimized";

      setTimeout(() => (btn.textContent = "Optimize"), 1500);
    } catch (err) {
      console.error(err);
      alert("Optimizer call failed. Is uvicorn running on :8000?");
      btn.textContent = "Optimize";
    } finally {
      btn.disabled = false;
    }
  });

  document.body.appendChild(btn);
}

injectButton();
setInterval(injectButton, 2000);
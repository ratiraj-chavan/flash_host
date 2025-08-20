const htmlInput = document.getElementById("htmlInput") || document.getElementById("code");
const result = document.getElementById("result");
//admin link
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");
  if (adminBtn) {
    adminBtn.addEventListener("click", () => {
      window.open("http://127.0.0.1:5500/user_dashboard/login.html", "_blank");
    });
  }
});
// HTML Deployment (from textarea)
document.getElementById("deployHtmlBtn")?.addEventListener("click", async () => {
  const html = htmlInput?.value?.trim();
  if (!html) {
    result.textContent = "Please enter Code‼️";
    return;
  }

  result.textContent = "🚀 Deploying ...";
  document.getElementById("deployHtmlBtn").disabled = true;

  try {
    const res = await fetch("http://localhost:3000/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html })
    });

    const data = await res.json();
    if (data.url) {
      result.innerHTML = `<a href="${data.url}" target="_blank">🌐 View Live</a>`;
    } else {
      result.textContent = `❌ ${data.error || "Deployment failed."}`;
    }
  } catch (err) {
    console.error(err);
    result.textContent = "❌ Server error.";
  }

  setTimeout(() => {
    document.getElementById("deployHtmlBtn").disabled = false;
  }, 5000);
});

// Optional: Compatibility with deployBtn from old UI (for backup/testing)
document.getElementById("deployBtn")?.addEventListener("click", async () => {
  const code = htmlInput?.value?.trim();
  if (!code) return alert("❌ Please paste some HTML code.");

  result.textContent = "🚀 Deploying...";
  document.getElementById("deployBtn").disabled = true;

  try {
    const res = await fetch("http://localhost:3000/deploy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: code })
    });

    const data = await res.json();
    if (data.url) {
      result.innerHTML = `<a href="${data.url}" target="_blank">🌐 View Live</a>`;
    } else {
      result.textContent = "❌ Deployment failed.";
    }
  } catch (err) {
    console.error(err);
    result.textContent = "❌ Deployment failed.";
  }

  setTimeout(() => {
    document.getElementById("deployBtn").disabled = false;
  }, 5000);
});
const SUPABASE_EDGE_FUNCTION_URL =
"https://yusznijfwkdcvrrqqapz.supabase.co/functions/v1/telegram-access"

(async function accessGuard() {
  const deviceID = localStorage.getItem("pulseAutoImportdeviceId");

  function redirectToAccessPage() {
    window.location.replace("./access.html");
  }

  if (!deviceID) {
    redirectToAccessPage();
    return;
  }

  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "check",
        device_id: deviceID
      })
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.status}`);
    }

    const result = await response.json();

    if (String(result.status).trim().toLowerCase() !== "approved") {
      redirectToAccessPage();
      return;
    }

    const app = document.getElementById("transportation-app");

    if (app) {
      app.style.display = "block";
    }

  } catch (error) {
    console.error("Access verification failed:", error);
    redirectToAccessPage();
  }
})();
const SUPABASE_EDGE_FUNCTION_URL =
"https://yusznijfwkdcvrrqqapz.supabase.co/functions/v1/telegram-access"

(async function () {
    const app = document.getElementById("transportation-app");

    try {
        const deviceID = localStorage.getItem("pulseAutoImportdeviceId");

        if (!deviceID) {
            window.location.replace("./access.html");
            return;
        }

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
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (String(data.status).toLowerCase() === "approved") {
            app.style.display = "block";
        } else {
            window.location.replace("./access.html");
        }

    } catch (error) {
        console.error("Access check error:", error);
        window.location.replace("./access.html");
    }
})();})();
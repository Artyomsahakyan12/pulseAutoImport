// ==UserScript==
// @name         Copart Buy Now Test
// @namespace    copart-buy-now-filter
// @version      3.0
// @description  Detect Buy It Now prices on Copart
// @match        https://www.copart.com/*
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    let box = null;

    function createBox() {
        if (box && document.body.contains(box)) return;

        box = document.createElement("div");
        box.id = "copart-buy-now-test";

        Object.assign(box.style, {
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: "2147483647",
            background: "#ffffff",
            color: "#111111",
            padding: "12px",
            border: "3px solid #1769ff",
            borderRadius: "12px",
            fontFamily: "-apple-system, BlinkMacSystemFont, Arial, sans-serif",
            fontSize: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,.35)"
        });

        box.innerHTML = `
            <b>Copart Buy Now Test v3</b>
            <br><br>
            Waiting for Copart vehicles...
        `;

        document.body.appendChild(box);
    }

    function scan() {

        if (!document.body) return;

        createBox();

        const text = document.body.innerText || "";

        /*
         * Copart may put the price on a separate line,
         * so allow whitespace/newlines between everything.
         */
        const regex =
            /buy\s*it\s*now\s*price\s*:\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/gi;

        const prices = [];
        let match;

        while ((match = regex.exec(text)) !== null) {

            const price = Number(
                match[1].replace(/,/g, "")
            );

            if (
                Number.isFinite(price) &&
                !prices.includes(price)
            ) {
                prices.push(price);
            }
        }

        if (prices.length === 0) {

            box.innerHTML = `
                <b>Copart Buy Now Test v3</b>
                <br><br>
                Waiting for vehicle prices...
            `;

            return;
        }

        box.innerHTML = `
            <b>Copart Buy Now Test v3</b>
            <br><br>
            Detected: <b>${prices.length}</b>
            <br><br>
            ${prices.map((price, i) =>
                `${i + 1}. <b>$${price.toLocaleString()}</b>`
            ).join("<br>")}
        `;
    }

    function start() {

        // Check immediately
        scan();

        // Then keep checking because Copart loads results dynamically
        setInterval(scan, 1000);
    }

    function waitForBody() {

        if (document.body) {
            start();
        } else {
            setTimeout(waitForBody, 100);
        }
    }

    waitForBody();

})();
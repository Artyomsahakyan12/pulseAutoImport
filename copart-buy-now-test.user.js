// ==UserScript==
// @name         Copart Buy Now Test
// @namespace    copart-buy-now-filter
// @version      1.0
// @description  Test detection of Buy It Now prices on Copart
// @match        https://www.copart.com/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    const PRICE_RE =
        /buy\s*it\s*now\s*price\s*:\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i;

    function scan() {
        const prices = [];

        document.querySelectorAll("body *").forEach(function (el) {

            if (el.children.length > 8) return;

            const text = (el.innerText || "")
                .replace(/\s+/g, " ")
                .trim();

            const match = text.match(PRICE_RE);

            if (!match) return;

            if (
                el.parentElement &&
                PRICE_RE.test(el.parentElement.innerText || "")
            ) return;

            const price = Number(
                match[1].replace(/,/g, "")
            );

            if (
                Number.isFinite(price) &&
                !prices.includes(price)
            ) {
                prices.push(price);
            }
        });

        let box =
            document.getElementById(
                "copart-buy-now-test"
            );

        if (!box) {

            box = document.createElement("div");

            box.id =
                "copart-buy-now-test";

            Object.assign(box.style, {

                position: "fixed",
                top: "10px",
                right: "10px",

                zIndex: "2147483647",

                background: "#ffffff",
                color: "#111111",

                padding: "12px",

                border: "2px solid #1769ff",
                borderRadius: "12px",

                fontFamily:
                    "-apple-system, BlinkMacSystemFont, Arial, sans-serif",

                fontSize: "15px",

                boxShadow:
                    "0 4px 18px rgba(0,0,0,.3)"
            });

            document.body.appendChild(box);
        }

        box.innerHTML =
            "<b>Copart Buy Now Test</b><br>" +
            "Detected: <b>" +
            prices.length +
            "</b><br><br>" +

            (
                prices.length
                    ? prices.map(function (p, i) {

                        return (
                            (i + 1) +
                            ". <b>$" +
                            p.toLocaleString() +
                            "</b>"
                        );

                    }).join("<br>")

                    : "No Buy It Now prices detected yet."
            );
    }

    function start() {

        scan();

        let timer;

        new MutationObserver(function () {

            clearTimeout(timer);

            timer = setTimeout(
                scan,
                500
            );

        }).observe(document.body, {

            childList: true,
            subtree: true

        });
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();
    }

})();
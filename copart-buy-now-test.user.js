// ==UserScript==
// @name         Copart Buy Now Test
// @namespace    copart-buy-now-filter
// @version      2.0
// @description  Detect Buy It Now prices on Copart
// @match        https://www.copart.com/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    "use strict";

    function scan() {

        const pageText = document.body.innerText || "";

        const regex =
            /buy\s*it\s*now\s*price\s*:\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/gi;

        const prices = [];
        let match;

        while ((match = regex.exec(pageText)) !== null) {

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

        let box =
            document.getElementById("copart-buy-now-test");

        if (!box) {

            box = document.createElement("div");

            box.id = "copart-buy-now-test";

            Object.assign(box.style, {

                position: "fixed",
                top: "10px",
                right: "10px",

                zIndex: "2147483647",

                background: "white",
                color: "black",

                padding: "12px",

                border: "3px solid #1769ff",
                borderRadius: "12px",

                fontFamily:
                    "-apple-system, BlinkMacSystemFont, Arial",

                fontSize: "16px",

                boxShadow:
                    "0 4px 20px rgba(0,0,0,.35)"
            });

            document.body.appendChild(box);
        }

        box.innerHTML =
            "<b>Copart Buy Now Test v2</b>" +
            "<br><br>" +

            "Detected: <b>" +
            prices.length +
            "</b>" +

            "<br><br>" +

            (
                prices.length
                    ? prices.map(function (price, index) {

                        return (
                            (index + 1) +
                            ". <b>$" +
                            price.toLocaleString() +
                            "</b>"
                        );

                    }).join("<br>")

                    : "No Buy It Now prices detected."
            );
    }

    function start() {

        scan();

        let timer;

        new MutationObserver(function () {

            clearTimeout(timer);

            timer = setTimeout(
                scan,
                700
            );

        }).observe(document.body, {

            childList: true,
            subtree: true

        });
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();
    }

})();
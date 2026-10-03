// ==UserScript==
// @name         Copart Buy Now Price Filter
// @namespace    copart-buy-now-filter
// @version      4.0
// @description  Filter Copart Buy It Now vehicles by price
// @match        https://www.copart.com/*
// @run-at       document-start
// ==/UserScript==

(function () {
    "use strict";

    let panel;
    let minPrice = null;
    let maxPrice = null;
    let filterActive = false;

    function createPanel() {

        if (panel && document.body.contains(panel)) return;

        panel = document.createElement("div");

        panel.id = "copart-price-filter";

        Object.assign(panel.style, {
            position: "fixed",
            top: "10px",
            right: "10px",
            width: "260px",
            zIndex: "2147483647",
            background: "#ffffff",
            color: "#111111",
            padding: "12px",
            border: "3px solid #1769ff",
            borderRadius: "14px",
            fontFamily:
                "-apple-system, BlinkMacSystemFont, Arial, sans-serif",
            fontSize: "15px",
            boxShadow: "0 4px 20px rgba(0,0,0,.35)"
        });

        panel.innerHTML = `

            <div style="
                font-size:18px;
                font-weight:700;
                margin-bottom:10px;
            ">
                Copart Buy Now Filter
            </div>

            <div style="margin-bottom:8px;">
                From:
                <input
                    id="copart-min"
                    type="number"
                    inputmode="decimal"
                    placeholder="Min"
                    style="
                        width:150px;
                        margin-left:6px;
                        padding:7px;
                        border:1px solid #aaa;
                        border-radius:7px;
                        font-size:15px;
                    "
                >
            </div>

            <div style="margin-bottom:10px;">
                To:
                <input
                    id="copart-max"
                    type="number"
                    inputmode="decimal"
                    placeholder="Max"
                    style="
                        width:150px;
                        margin-left:13px;
                        padding:7px;
                        border:1px solid #aaa;
                        border-radius:7px;
                        font-size:15px;
                    "
                >
            </div>

            <button id="copart-apply"
                style="
                    width:48%;
                    padding:9px;
                    border:0;
                    border-radius:8px;
                    background:#1769ff;
                    color:white;
                    font-size:15px;
                    font-weight:600;
                ">
                APPLY
            </button>

            <button id="copart-clear"
                style="
                    width:48%;
                    padding:9px;
                    border:0;
                    border-radius:8px;
                    background:#ddd;
                    color:#111;
                    font-size:15px;
                    font-weight:600;
                ">
                SHOW ALL
            </button>

            <div
                id="copart-status"
                style="
                    margin-top:10px;
                    padding-top:8px;
                    border-top:1px solid #ddd;
                    line-height:1.4;
                "
            >
                Waiting for vehicles...
            </div>
        `;

        document.body.appendChild(panel);

        document
            .getElementById("copart-apply")
            .addEventListener("click", function () {

                const min =
                    document.getElementById("copart-min").value;

                const max =
                    document.getElementById("copart-max").value;

                minPrice =
                    min === ""
                        ? null
                        : Number(min);

                maxPrice =
                    max === ""
                        ? null
                        : Number(max);

                filterActive = true;

                applyFilter();
            });

        document
            .getElementById("copart-clear")
            .addEventListener("click", function () {

                minPrice = null;
                maxPrice = null;
                filterActive = false;

                document.getElementById("copart-min").value = "";
                document.getElementById("copart-max").value = "";

                showAll();
                updateStatus();
            });
    }

    function getRows() {

        return Array.from(
            document.querySelectorAll("tr")
        );
    }

    function getBuyNowPrice(row) {

        const text =
            (row.innerText || "")
                .replace(/\s+/g, " ");

        const regex =
            /buy\s*it\s*now\s*price\s*:\s*\$?\s*([\d,]+(?:\.\d{1,2})?)/i;

        const match = text.match(regex);

        if (!match) return null;

        const price =
            Number(
                match[1].replace(/,/g, "")
            );

        return Number.isFinite(price)
            ? price
            : null;
    }

    function applyFilter() {

        const rows = getRows();

        let total = 0;
        let visible = 0;

        rows.forEach(function (row) {

            const price =
                getBuyNowPrice(row);

            if (price === null) return;

            total++;

            const minimumOK =
                minPrice === null ||
                price >= minPrice;

            const maximumOK =
                maxPrice === null ||
                price <= maxPrice;

            const match =
                minimumOK && maximumOK;

            row.style.display =
                match ? "" : "none";

            if (match) {
                visible++;
            }
        });

        updateStatus(total, visible);
    }

    function showAll() {

        getRows().forEach(function (row) {
            row.style.display = "";
        });
    }

    function updateStatus(total, visible) {

        if (!panel) return;

        const status =
            document.getElementById("copart-status");

        if (!status) return;

        if (total === undefined) {

            status.innerHTML =
                "Waiting for vehicle prices...";

            return;
        }

        if (!filterActive) {

            status.innerHTML =
                `<b>${total}</b> Buy Now vehicles detected`;

            return;
        }

        status.innerHTML =
            `<b>${visible}</b> matching / ${total} detected`;
    }

    function scan() {

        if (!document.body) return;

        createPanel();

        const rows =
            getRows();

        let count = 0;

        rows.forEach(function (row) {

            if (getBuyNowPrice(row) !== null) {
                count++;
            }
        });

        if (!filterActive) {
            showAll();
        } else {
            applyFilter();
            return;
        }

        updateStatus(count, count);
    }

    function start() {

        scan();

        setInterval(function () {

            scan();

        }, 1000);
    }

    function waitForBody() {

        if (document.body) {
            start();
        } else {
            setTimeout(
                waitForBody,
                100
            );
        }
    }

    waitForBody();

})();
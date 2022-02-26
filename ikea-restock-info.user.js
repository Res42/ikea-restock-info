// ==UserScript==
// @name         IKEA Restock Info
// @namespace    https://github.com/Res42/ikea-restock-info
// @version      1.2
// @description  Lists restock information on IKEA product pages.
// @author       Adam Reisinger
// @match        http*://ikea.com/*/*/p/*
// @match        http*://*.ikea.com/*/*/p/*
// @updateURL    https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.user.js
// @downloadURL  https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.user.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAGpSURBVGhD7ZcxTgNBDEVTU3MBjsINEBUlouAcHCAXgJaCc6QOHSUFR+AIw/4oRp6fP7sTtMIayZaetPnxePw9mUVsyuCRBqIjDURHGoiONBAdaSA60kB0jG9gc/dahkaKIyHFGR63D+Xp5bY8v12X993Vga/9Zfn+uCjlc/pFdoBcrLH1qIWaN9t7uecsUnSgqDV7bqPn4o1hzy5DSuSm1Wb/QZcZFnCUkU23wOmgN+63MgCntsDrYElXE1L5jK0H2J+/52Ge5PgPPtnrYE5XG7fyGcsDagh+qAA9Vjn2gN+aT6ySJlo61rHWU4dRdQzurcq1B367/CYcaenM0iA8Ps+fImr408Czz0Wv9t3qBngzlWNYDk9faX4w0sDS5Fo6bwTwtliq41F3iPE1qz190pqX2C4f60xPDrCTbV5i4G+818GSrt4g6nQYrmn1WAeodzKs6sPE0H/IDEwTTuE40gz2tqmrEz4gRQeb4bfVmqB2V9MeKc6AojhKM/UXY75RaxY1uxpmpDgSUhyJ4//Gw0YaiI40EB1pIDrSQHSkgehIA9ExuIFSfgDhFZ69tkIangAAAABJRU5ErkJggg==
// ==/UserScript==

(function() {
    'use strict';

    const stores = getStores();
    const restocks = unsafeWindow.RangeProductStatus.stockInfo.stores.flatMap(store => store.restocks.flatMap(restock => mapRestock(restock, stores[store.storeId])));

    renderRestocks(restocks);

    function getStores() {
        return Object.keys(sessionStorage)
            .filter(key => key.startsWith("nav-stores"))
            .map(key => JSON.parse(sessionStorage.getItem(key)))
            .flatMap(stores => stores.data)
            .reduce((dict, store) => {
                dict[store.id] = store.name;
                return dict;
            }, {});
    }

    function mapRestock(restock, store) {
        return { ...restock, store };
    }

    function renderRestocks(restocks) {
        if (restocks.length === 0) {
            return;
        }

        const containerEl = document.querySelector('.range-revamp-product__buy-module-container');
        renderHeader(containerEl);
        restocks.forEach(r => renderRestock(r, containerEl));
    }

    function renderRestock(restock, containerEl) {
        const el = document.createElement("p");

        const storeEl = document.createElement("div");
        storeEl.append(`Store: ${restock.store}`);

        const timeEl = document.createElement("div");
        timeEl.append(`Between: ${restock.earliestDate} - ${restock.latestDate}`);

        const reliabilityEl = document.createElement("div");
        reliabilityEl.append(`Reliability: ${restock.reliability}`);

        const quantityEl = document.createElement("div");
        quantityEl.append(`Quantity: ${restock.quantity}`);

        const updatedEl = document.createElement("div");
        updatedEl.append(`Updated: ${restock.updateDateTime}`);

        el.append(storeEl);
        el.append(timeEl);
        el.append(reliabilityEl);
        el.append(quantityEl);
        el.append(updatedEl);
        containerEl.append(el);
    }

    function renderHeader(containerEl) {
        const el = document.createElement("h3");
        el.append("Restocks");

        containerEl.append(el);
    }
})();

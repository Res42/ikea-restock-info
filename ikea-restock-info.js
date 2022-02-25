// ==UserScript==
// @name         IKEA Restock Info
// @namespace    https://github.com/Res42/ikea-restock-info/
// @version      1.0
// @description  Lists restock information on IKEA product pages.
// @author       Adam Reisinger
// @match        http*://ikea.com/*/*/p/*
// @match        http*://*.ikea.com/*/*/p/*
// @connect      api.ingka.ikea.com
// @updateURL    https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.js
// @downloadURL  https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.js
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAGpSURBVGhD7ZcxTgNBDEVTU3MBjsINEBUlouAcHCAXgJaCc6QOHSUFR+AIw/4oRp6fP7sTtMIayZaetPnxePw9mUVsyuCRBqIjDURHGoiONBAdaSA60kB0jG9gc/dahkaKIyHFGR63D+Xp5bY8v12X993Vga/9Zfn+uCjlc/pFdoBcrLH1qIWaN9t7uecsUnSgqDV7bqPn4o1hzy5DSuSm1Wb/QZcZFnCUkU23wOmgN+63MgCntsDrYElXE1L5jK0H2J+/52Ge5PgPPtnrYE5XG7fyGcsDagh+qAA9Vjn2gN+aT6ySJlo61rHWU4dRdQzurcq1B367/CYcaenM0iA8Ps+fImr408Czz0Wv9t3qBngzlWNYDk9faX4w0sDS5Fo6bwTwtliq41F3iPE1qz190pqX2C4f60xPDrCTbV5i4G+818GSrt4g6nQYrmn1WAeodzKs6sPE0H/IDEwTTuE40gz2tqmrEz4gRQeb4bfVmqB2V9MeKc6AojhKM/UXY75RaxY1uxpmpDgSUhyJ4//Gw0YaiI40EB1pIDrSQHSkgehIA9ExuIFSfgDhFZ69tkIangAAAABJRU5ErkJggg==
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // eg: https://www.ikea.com/hu/hu/p/omtaenksam-cipokanal-antracit-70378070/
    const [_, lang, item] = document.URL.match(/ikea.com\/([a-z]+)\/.*-([0-9]+)/);
    // eg: https://api.ingka.ikea.com/cia/availabilities/ru/hu?itemNos=70378070&expand=StoresList,Restocks,SalesLocations
    const url = `https://api.ingka.ikea.com/cia/availabilities/ru/${lang}?itemNos=${item}&expand=StoresList,Restocks,SalesLocations`;
    const stores = getStores();

    GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (response) => onItemResponse(JSON.parse(response.responseText)),
        headers: { 'x-client-id': 'b6c117e5-ae61-4ef5-b4cc-e0b1e37f0631' },
    });

    function onItemResponse(item) {
        const restocks = item.data.flatMap(d => d.availableStocks?.flatMap(s => s.restocks?.map(r => mapRestock(r, d.classUnitKey)) ?? []) ?? []);

        if (restocks.length === 0) {
            return;
        }

        const containerEl = document.querySelector('.range-revamp-product__buy-module-container');
        addHeader(containerEl);
        restocks.forEach(r => addRestockInfo(r, containerEl));
    }

    function mapRestock(restock, classUnitKey) {
        return {
            ...restock,
            classUnitKey,
        };
    }

    function addRestockInfo(restock, containerEl) {
        const el = document.createElement("p");

        const storeEl = document.createElement("div");
        storeEl.append(`Store: ${stores[restock.classUnitKey.classUnitCode]}`);

        const timeEl = document.createElement("div");
        timeEl.append(`Between: ${restock.earliestDate} - ${restock.latestDate}`);

        const reliabilityEl = document.createElement("div");
        reliabilityEl.append(`Reliability: ${restock.reliability}`);

        el.append(storeEl);
        el.append(timeEl);
        el.append(reliabilityEl);
        containerEl.append(el);
    }

    function addHeader(containerEl) {
        const el = document.createElement("h3");
        el.append("Restocks");

        containerEl.append(el);
    }

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
})();

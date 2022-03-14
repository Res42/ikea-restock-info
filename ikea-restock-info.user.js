// ==UserScript==
// @name         IKEA Restock Info
// @namespace    https://github.com/Res42/ikea-restock-info
// @version      1.8
// @description  Lists restock information on IKEA product pages.
// @author       Adam Reisinger
// @match        http*://ikea.com/*/*/p/*
// @match        http*://*.ikea.com/*/*/p/*
// @updateURL    https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.user.js
// @downloadURL  https://raw.githubusercontent.com/Res42/ikea-restock-info/master/ikea-restock-info.user.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
        .restock-container {
            width: max-content;
        }

        .restock-table th:not(:first-of-type),
        .restock-table td:not(:first-of-type) {
            padding-left: 0.25rem;
        }

        .restock-table th:not(:last-of-type),
        .restock-table td:not(:last-of-type) {
            padding-right: 0.25rem;
        }
    `);

    waitFor(() => unsafeWindow.RangeProductStatus, (RangeProductStatus) => {
        waitFor(() => storeSelector().length, () => {
            const stores = getStores();
            const restocks = RangeProductStatus.stockInfo.stores.flatMap(store => (store.restocks ?? []).flatMap(restock => mapRestock(restock, stores[store.storeId])));

            renderRestockBlock(restocks);
        });
    });

    function waitFor(selector, callback) {
        const check = () => {
            const waitingForThis = selector();
            if (waitingForThis) {
                callback(waitingForThis);
            } else {
                requestAnimationFrame(check);
            }
        };
        requestAnimationFrame(check);
    }

    function storeSelector() {
        return Object.keys(sessionStorage)
            .filter(key => key.startsWith('nav-stores'));
    }

    function getStores() {
        return storeSelector()
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

    function renderRestockBlock(restocks) {
        const containerEl = document.querySelector('.pip-product__buy-module-container');

        const template = `
            <section class="restock-container">
                <h3>Restocks</h3>
                ${restocks.length ? renderRestocks(restocks) : renderNoInfo()}
            </section>
        `;

        containerEl.insertAdjacentHTML('beforeend', template);
    }

    function renderRestocks(restocks) {
        return `
            <table class="restock-table">
                <thead>
                    <tr>
                        <th>Store</th>
                        <th>Between</th>
                        <th>Reliability</th>
                        <th>Quantity</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    ${restocks.map(restock => renderRestock(restock)).join('')}
                </tbody>
            </table>
        `;
    }

    function renderRestock(restock) {
        return `
            <tr>
                <td>${restock.store}</td>
                <td>${new Date(restock.earliestDate).toLocaleDateString()} - ${new Date(restock.latestDate).toLocaleDateString()}</td>
                <td>${restock.reliability}</td>
                <td>${restock.quantity}</td>
                <td>${new Date(restock.updateDateTime).toLocaleString()}</td>
            </tr>
        `;
    }

    function renderNoInfo() {
        return `<p>No restock information found.</p>`;
    }
})();

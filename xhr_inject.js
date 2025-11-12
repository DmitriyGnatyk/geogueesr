(function (xhr) {
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            try {
                window.postMessage({
                    type: 'xhr',
                    url: this._url, // ✅ додаємо URL
                    method: this._method,
                    data: this.response
                }, '*');
            } catch (e) {
                console.error('XHR postMessage error:', e);
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);


const { fetch: origFetch } = window;
window.fetch = async (...args) => {
    const url = args[0];
    const response = await origFetch(...args);
    try {
        const clonedResponse = await response.clone().text();
        window.postMessage({
            type: 'fetch',
            url, // ✅ додаємо URL
            data: clonedResponse
        }, '*');
    } catch (e) {
        console.error('Fetch postMessage error:', e);
    }
    return response;
};


// ✅ ловимо запит на профіль
window.addEventListener('message', (e) => {
    const msg = e.data;
    if (!msg || !msg.url) return;

    if (msg.url.includes("/api/v3/profiles/")) {
        console.log("✅ Отримано профіль користувача!", msg.url);

        const mapContainer = document.querySelector("#map") || document.querySelector("#mapContainer");
        if (mapContainer && !document.querySelector("#mapInfo")) {
            const info = document.createElement("div");
            info.id = "mapInfo";
            info.innerHTML = '<div class="spinner"></div>';
            mapContainer.appendChild(info);
        }
    }
});

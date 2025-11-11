(function (xhr) {

    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            try {
                window.postMessage({ type: 'xhr', data: this.response }, '*');
            } catch {
                return;
            }
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest);



const { fetch: origFetch } = window;
window.fetch = async (...args) => {
    const response = await origFetch(...args);
    const clonedResponse = await response.clone().blob();
    window.postMessage({ type: 'fetch', data: clonedResponse }, '*');
    return response;
};

window.addEventListener('message', (e) => {
    const msg = e.data;
    if (!msg || !msg.url) return;

    if (msg.url.includes("https://www.geoguessr.com/api/v3/profiles/")) {
        console.log("✅ Отримано профіль користувача!");
        const mapContainer = document.querySelector("#mapContainer");
        if (mapContainer && !document.querySelector("#mapInfo")) {
            const info = document.createElement("div");
            info.id = "mapInfo";
            info.innerHTML = '<div class="spinner"></div>';
            mapContainer.appendChild(info);
        }
    }
});

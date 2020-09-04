function loadJS(url) {
    document.writeln(`<script src="${url}"></script>`);
}
function loadAllJS() {
    loadJS("bin/skin/ButtonSkin.js");
    loadJS("bin/UIApp.js");
}
function loadJSAsync(src, callback) {
    let s = document.createElement("script");
    s.async = false;
    s.src = src;
    s.addEventListener("load", function () {
        s.parentNode.removeChild(s);
        s.removeEventListener("load", arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
}
let js_urlParams;
class Main {
    constructor(urlParams) {
        js_urlParams = urlParams;
        new Dou.Engine(examples.UIApp, null, {
            contentWidth: 640,
            contentHeight: 1136,
            scaleMode: "fixedNarrow" /* fixedNarrow */,
            orientation: "auto" /* auto */,
            canvasScaleFactor: function (context) {
                let backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
                return (window.devicePixelRatio || 1) / backingStore;
            }
        });
    }
}

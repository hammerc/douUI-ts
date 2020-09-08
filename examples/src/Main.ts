function loadJS(url: string): void {
    document.writeln(`<script src="${url}"></script>`);
}

function loadAllJS(): void {
    loadJS("bin/utils/FilterUtil.js");
    loadJS("bin/skin/ButtonSkin.js");
    loadJS("bin/skin/CheckBoxSkin.js");
    loadJS("bin/skin/RadioButtonSkin.js");
    loadJS("bin/skin/ToggleButtonSkin.js");
    loadJS("bin/skin/ProgressBarSkin.js");
    loadJS("bin/skin/HSliderSkin.js");
    loadJS("bin/skin/VSliderSkin.js");
    loadJS("bin/skin/HScrollBarSkin.js");
    loadJS("bin/skin/VScrollBarSkin.js");
    loadJS("bin/skin/ScrollerSkin.js");

    loadJS("bin/item/SimpleItem.js");
    loadJS("bin/skin/ItemRendererSkin.js");

    loadJS("bin/UIApp.js");
}

function loadJSAsync(src: string, callback: () => void): void {
    let s = document.createElement("script");
    s.async = false;
    s.src = src;
    s.addEventListener("load", function () {
        s.parentNode.removeChild(s);
        s.removeEventListener("load", <any>arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
}

let js_urlParams: { [key: string]: string };

class Main {
    public constructor(urlParams: { [key: string]: string }) {
        js_urlParams = urlParams;

        new Dou.Engine(examples.UIApp, null, {
            contentWidth: 640,
            contentHeight: 1136,
            scaleMode: Dou.StageScaleMode.fixedNarrow,
            orientation: Dou.OrientationMode.auto,
            canvasScaleFactor: function (context: any) {
                let backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
                return (window.devicePixelRatio || 1) / backingStore;
            }
        });

        new Dou.StatPanel();
    }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var examples;
(function (examples) {
    class UIApp extends Dou.DisplayObjectContainer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            return __awaiter(this, void 0, void 0, function* () {
                yield Dou.asset.loadConfigAsync("resource/res.json", "resource/");
                Dou.Theme.registerDefaultSkin(Dou.Button, skin.ButtonSkin);
                let demo = js_urlParams.demo;
                loadJSAsync("bin/examples/" + demo + ".js", () => {
                    this.addChild(new examples[demo]());
                });
            });
        }
    }
    examples.UIApp = UIApp;
})(examples || (examples = {}));

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
                Dou.Theme.registerDefaultSkin(Dou.CheckBox, skin.CheckBoxSkin);
                Dou.Theme.registerDefaultSkin(Dou.RadioButton, skin.RadioButtonSkin);
                Dou.Theme.registerDefaultSkin(Dou.ToggleButton, skin.ToggleButtonSkin);
                Dou.Theme.registerDefaultSkin(Dou.ProgressBar, skin.ProgressBarSkin);
                Dou.Theme.registerDefaultSkin(Dou.HSlider, skin.HSliderSkin);
                Dou.Theme.registerDefaultSkin(Dou.VSlider, skin.VSliderSkin);
                Dou.Theme.registerDefaultSkin(Dou.HScrollBar, skin.HScrollBarSkin);
                Dou.Theme.registerDefaultSkin(Dou.VScrollBar, skin.VScrollBarSkin);
                Dou.Theme.registerDefaultSkin(Dou.Scroller, skin.ScrollerSkin);
                Dou.Theme.registerDefaultSkin(item.SimpleItem, skin.ItemRendererSkin);
                let demo = js_urlParams.demo;
                loadJSAsync("bin/examples/" + demo + ".js", () => {
                    this.addChild(new examples[demo]());
                });
            });
        }
    }
    examples.UIApp = UIApp;
})(examples || (examples = {}));

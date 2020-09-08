namespace examples {
    export class UIApp extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: Dou.Event2D): Promise<void> {
            await Dou.asset.loadConfigAsync("resource/res.json", "resource/");

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
        }
    }
}

namespace examples {
    export class UIApp extends Dou.DisplayObjectContainer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private async onAdded(event: Dou.Event2D): Promise<void> {
            await Dou.asset.loadConfigAsync("resource/res.json", "resource/");

            Dou.Theme.registerDefaultSkin(Dou.Button, skin.ButtonSkin);

            let demo = js_urlParams.demo;
            loadJSAsync("bin/examples/" + demo + ".js", () => {
                this.addChild(new examples[demo]());
            });
        }
    }
}

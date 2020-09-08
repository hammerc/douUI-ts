namespace skin {
    /**
     * 通用的垂直滚动条皮肤
     * @author wizardc
     */
    export class VScrollBarSkin extends Dou.SkinBase {
        private _thumb: Dou.Image;

        public constructor(target: Dou.Component) {
            super(target);
        }

        protected createSkin(): void {
            let thumb = this._thumb = new Dou.Image();
            thumb.width = 8;
            thumb.height = 30;
            thumb.horizontalCenter = 0;
            thumb.source = "roundthumb_png";
            thumb.scale9Grid = new Dou.Rectangle(3, 3, 2, 2);
            this.bindToTarget("thumb", thumb);
        }

        protected apply(): void {
            let target = this._target;
            target.addChild(this._thumb);
        }

        protected unload(): void {
            let target = this._target;
            target.removeChild(this._thumb);
        }
    }
}

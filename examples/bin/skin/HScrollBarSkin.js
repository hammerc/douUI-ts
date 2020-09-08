var skin;
(function (skin) {
    /**
     * 通用的水平滚动条皮肤
     * @author wizardc
     */
    class HScrollBarSkin extends Dou.SkinBase {
        constructor(target) {
            super(target);
        }
        createSkin() {
            let thumb = this._thumb = new Dou.Image();
            thumb.width = 30;
            thumb.height = 8;
            thumb.verticalCenter = 0;
            thumb.source = "roundthumb_png";
            thumb.scale9Grid = new Dou.Rectangle(3, 3, 2, 2);
            this.bindToTarget("thumb", thumb);
        }
        apply() {
            let target = this._target;
            target.addChild(this._thumb);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._thumb);
        }
    }
    skin.HScrollBarSkin = HScrollBarSkin;
})(skin || (skin = {}));

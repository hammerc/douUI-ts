var skin;
(function (skin) {
    /**
     * 通用的垂直滚动条皮肤
     * @author wizardc
     */
    class VScrollBarSkin extends Dou.SkinBase {
        constructor(target) {
            super(target);
        }
        createSkin() {
            let thumb = this._thumb = new Dou.Image();
            thumb.width = 8;
            thumb.height = 30;
            thumb.horizontalCenter = 0;
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
    skin.VScrollBarSkin = VScrollBarSkin;
})(skin || (skin = {}));

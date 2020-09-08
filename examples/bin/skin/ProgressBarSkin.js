var skin;
(function (skin) {
    /**
     * 通用复选框皮肤
     * @author wizardc
     */
    class ProgressBarSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { minWidth: 60, minHeight: 20 });
        }
        createSkin() {
            let bg = this._bg = new Dou.Image();
            bg.percentWidth = bg.percentHeight = 100;
            bg.source = "track_pb_png";
            bg.scale9Grid = new Dou.Rectangle(1, 1, 4, 4);
            let thumb = this._thumb = new Dou.Image();
            thumb.percentWidth = thumb.percentHeight = 100;
            thumb.source = "thumb_pb_png";
            this.bindToTarget("thumb", thumb);
            let label = this._label = new Dou.Label();
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            label.stroke = 1;
            this.bindToTarget("labelDisplay", label);
        }
        apply() {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._thumb);
            target.addChild(this._label);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._bg);
            target.removeChild(this._thumb);
            target.removeChild(this._label);
        }
    }
    skin.ProgressBarSkin = ProgressBarSkin;
})(skin || (skin = {}));

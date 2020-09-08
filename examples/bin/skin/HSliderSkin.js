var skin;
(function (skin) {
    /**
     * 通用复选框皮肤
     * @author wizardc
     */
    class HSliderSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { minWidth: 60, minHeight: 20 });
        }
        createSkin() {
            let track = this._track = new Dou.Image();
            track.verticalCenter = 0;
            track.percentWidth = 100;
            track.height = 6;
            track.source = "track_sb_png";
            track.scale9Grid = new Dou.Rectangle(1, 1, 4, 4);
            this.bindToTarget("track", track);
            let thumb = this._thumb = new Dou.Image();
            thumb.verticalCenter = 0;
            thumb.source = "thumb_png";
            this.bindToTarget("thumb", thumb);
        }
        apply() {
            let target = this._target;
            target.addChild(this._track);
            target.addChild(this._thumb);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._track);
            target.removeChild(this._thumb);
        }
    }
    skin.HSliderSkin = HSliderSkin;
})(skin || (skin = {}));

namespace skin {
    /**
     * 通用复选框皮肤
     * @author wizardc
     */
    export class HSliderSkin extends Dou.SkinBase {
        private _track: Dou.Image;
        private _thumb: Dou.Image;

        public constructor(target: Dou.Component) {
            super(target, { minWidth: 60, minHeight: 20 });
        }

        protected createSkin(): void {
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

        protected apply(): void {
            let target = this._target;
            target.addChild(this._track);
            target.addChild(this._thumb);
        }

        protected unload(): void {
            let target = this._target;
            target.removeChild(this._track);
            target.removeChild(this._thumb);
        }
    }
}

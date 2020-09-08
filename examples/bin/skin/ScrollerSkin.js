var skin;
(function (skin) {
    /**
     * 通用的可滚动区域皮肤
     * @author wizardc
     */
    class ScrollerSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { minWidth: 60, minHeight: 20 });
        }
        createSkin() {
            let horizontalScrollBar = this._horizontalScrollBar = new Dou.HScrollBar();
            horizontalScrollBar.bottom = 0;
            horizontalScrollBar.percentWidth = 100;
            this.bindToTarget("horizontalScrollBar", horizontalScrollBar);
            let verticalScrollBar = this._verticalScrollBar = new Dou.VScrollBar();
            verticalScrollBar.right = 0;
            verticalScrollBar.percentHeight = 100;
            this.bindToTarget("verticalScrollBar", verticalScrollBar);
        }
        apply() {
            let target = this._target;
            target.addChild(this._horizontalScrollBar);
            target.addChild(this._verticalScrollBar);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._horizontalScrollBar);
            target.removeChild(this._verticalScrollBar);
        }
    }
    skin.ScrollerSkin = ScrollerSkin;
})(skin || (skin = {}));

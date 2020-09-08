namespace skin {
    /**
     * 通用的可滚动区域皮肤
     * @author wizardc
     */
    export class ScrollerSkin extends Dou.SkinBase {
        private _horizontalScrollBar: Dou.HScrollBar;
        private _verticalScrollBar: Dou.VScrollBar;

        public constructor(target: Dou.Component) {
            super(target, { minWidth: 60, minHeight: 20 });
        }

        protected createSkin(): void {
            let horizontalScrollBar = this._horizontalScrollBar = new Dou.HScrollBar();
            horizontalScrollBar.bottom = 0;
            horizontalScrollBar.percentWidth = 100;
            this.bindToTarget("horizontalScrollBar", horizontalScrollBar);
            let verticalScrollBar = this._verticalScrollBar = new Dou.VScrollBar();
            verticalScrollBar.right = 0;
            verticalScrollBar.percentHeight = 100;
            this.bindToTarget("verticalScrollBar", verticalScrollBar);
        }

        protected apply(): void {
            let target = this._target;
            target.addChild(this._horizontalScrollBar);
            target.addChild(this._verticalScrollBar);
        }

        protected unload(): void {
            let target = this._target;
            target.removeChild(this._horizontalScrollBar);
            target.removeChild(this._verticalScrollBar);
        }
    }
}

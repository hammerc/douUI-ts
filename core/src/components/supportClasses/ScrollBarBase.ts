namespace douUI {
    /**
     * 滚动条基类
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    export class ScrollBarBase extends Component {
        /**
         * 滑块显示对象
         */
        public thumb: Component;

        /**
         * 是否自动显示隐藏
         */
        public autoVisibility: boolean = true;

        protected _viewport: IViewport;

        public set viewport(value: IViewport) {
            if (value == this._viewport) {
                return;
            }
            let viewport = this._viewport;
            if (viewport) {
                viewport.off(dou.Event.PROPERTY_CHANGE, this.onPropertyChanged, this);
                viewport.off(dou2d.Event2D.RESIZE, this.onViewportResize, this);
            }
            this._viewport = value;
            if (value) {
                value.on(dou.Event.PROPERTY_CHANGE, this.onPropertyChanged, this);
                value.on(dou2d.Event2D.RESIZE, this.onViewportResize, this);
            }
            this.invalidateDisplayList();
        }
        public get viewport(): IViewport {
            return this._viewport;
        }

        private onViewportResize(event?: dou2d.Event2D): void {
            this.invalidateDisplayList();
        }

        protected onPropertyChanged(event: dou.Event): void {
        }
    }
}

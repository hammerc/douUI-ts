namespace douUI {
    /**
     * 基础布局类, 子项可以任意布局
     * @author wizardc
     */
    export class BasicLayout extends LayoutBase {
        /**
         * 不支持虚拟布局, 设置这个属性无效
         */
        public useVirtualLayout: boolean;

        public measure(): void {
            super.measure();
            sys.measure(this._target);
        }

        public updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let target = this._target;
            let pos = sys.updateDisplayList(target, unscaledWidth, unscaledHeight);
            target.setContentSize(Math.ceil(pos.x), Math.ceil(pos.y));
        }
    }
}

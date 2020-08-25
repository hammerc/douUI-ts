namespace douUI {
    /**
     * 布局基类
     * @author wizardc
     */
    export abstract class LayoutBase extends dou.EventDispatcher {
        protected _target: Group;

        protected _useVirtualLayout: boolean = false;

        protected _typicalWidth: number = 20;
        protected _typicalHeight: number = 20;

        /**
         * 此布局将测量其元素, 调整其元素的大小并定位其元素的 Group 容器
         */
        public set target(value: Group) {
            if (this._target === value) {
                return;
            }
            this._target = value;
            this.clearVirtualLayoutCache();
        }
        public get target(): Group {
            return this._target;
        }

        /**
         * 是否使用虚拟布局
         */
        public set useVirtualLayout(value: boolean) {
            value = !!value;
            if (this._useVirtualLayout == value) {
                return;
            }
            this._useVirtualLayout = value;
            this.dispatchEvent("useVirtualLayoutChanged");
            if (this._useVirtualLayout && !value) {
                this.clearVirtualLayoutCache();
            }
            if (this.target) {
                this.target.invalidateDisplayList();
            }
        }
        public get useVirtualLayout(): boolean {
            return this._useVirtualLayout;
        }

        /**
         * 设置一个典型元素的大小
         */
        public setTypicalSize(width: number, height: number): void {
            width = +width || 20;
            height = +height || 20;
            if (width !== this._typicalWidth || height !== this._typicalHeight) {
                this._typicalWidth = width;
                this._typicalHeight = height;
                if (this._target) {
                    this._target.invalidateSize();
                }
            }
        }

        public scrollPositionChanged(): void {
        }

        public clearVirtualLayoutCache(): void {
        }

        public elementAdded(index: number): void {
        }

        public elementRemoved(index: number): void {
        }

        public getElementIndicesInView(): number[] {
            return null;
        }

        /**
         * 基于目标的内容测量其默认大小
         */
        public measure(): void {
        }

        /**
         * 调整目标的元素的大小并定位这些元素
         */
        public updateDisplayList(width: number, height: number): void {
        }
    }
}

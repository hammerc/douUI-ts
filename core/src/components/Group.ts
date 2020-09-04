namespace douUI {
    /**
     * 自动布局的容器基类
     * @author wizardc
     */
    export class Group extends dou2d.DisplayObjectContainer implements IViewport {
        public $Group: Object;

        protected _layout: LayoutBase;

        public constructor() {
            super();
            this.initializeUIValues();
            this.$Group = {
                0: 0,        // contentWidth
                1: 0,        // contentHeight
                2: 0,        // scrollH
                3: 0,        // scrollV
                4: false,    // scrollEnabled
                5: false,    // touchThrough
            };
        }

        /**
         * 触摸组件的背景透明区域是否可以穿透
         */
        public set touchThrough(value: boolean) {
            this.$Group[sys.GroupKeys.touchThrough] = !!value;
        }
        public get touchThrough(): boolean {
            return this.$Group[sys.GroupKeys.touchThrough];
        }

        /**
         * 布局元素子项的数量
         */
        public get numElements(): number {
            return this.$children.length;
        }

        /**
         * 此容器的布局对象
         */
        public set layout(value: LayoutBase) {
            if (this._layout == value) {
                return;
            }
            if (this._layout) {
                this._layout.target = null;
            }
            this._layout = value;
            if (value) {
                value.target = this;
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        public get layout(): LayoutBase {
            return this._layout;
        }

        /**
         * 是否启用滚动条
         */
        public set scrollEnabled(value: boolean) {
            value = !!value;
            let values = this.$Group;
            if (value === values[sys.GroupKeys.scrollEnabled]) {
                return;
            }
            values[sys.GroupKeys.scrollEnabled] = value;
            this.updateScrollRect();
        }
        public get scrollEnabled(): boolean {
            return this.$Group[sys.GroupKeys.scrollEnabled];
        }

        /**
         * 水平方向的滚动数值
         */
        public set scrollH(value: number) {
            value = +value || 0;
            let values = this.$Group;
            if (value === values[sys.GroupKeys.scrollH]) {
                return;
            }
            values[sys.GroupKeys.scrollH] = value;
            if (this.updateScrollRect() && this._layout) {
                this._layout.scrollPositionChanged();
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "scrollH");
        }
        public get scrollH(): number {
            return this.$Group[sys.GroupKeys.scrollH];
        }

        /**
         * 垂直方向的滚动数值
         */
        public set scrollV(value: number) {
            value = +value || 0;
            let values = this.$Group;
            if (value == values[sys.GroupKeys.scrollV]) {
                return;
            }
            values[sys.GroupKeys.scrollV] = value;
            if (this.updateScrollRect() && this._layout) {
                this._layout.scrollPositionChanged();
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "scrollV");
        }
        public get scrollV(): number {
            return this.$Group[sys.GroupKeys.scrollV];
        }

        /**
         * 获取内容宽度
         */
        public get contentWidth(): number {
            return this.$Group[sys.GroupKeys.contentWidth];
        }

        /**
         * 获取内容高度
         */
        public get contentHeight(): number {
            return this.$Group[sys.GroupKeys.contentHeight];
        }

        private updateScrollRect(): boolean {
            let values = this.$Group;
            let hasClip = values[sys.GroupKeys.scrollEnabled];
            if (hasClip) {
                let uiValues = this.$UIComponent;
                let rect = dou.recyclable(dou2d.Rectangle);
                this.scrollRect = rect.set(values[sys.GroupKeys.scrollH], values[sys.GroupKeys.scrollV], uiValues[sys.UIKeys.width], uiValues[sys.UIKeys.height]);
                rect.recycle();
            }
            else if (this._scrollRect) {
                this.scrollRect = null;
            }
            return hasClip;
        }

        /**
         * 设置内容尺寸, 由引擎内部调用
         */
        public setContentSize(width: number, height: number): void {
            width = Math.ceil(+width || 0);
            height = Math.ceil(+height || 0);
            let values = this.$Group;
            let wChange = (values[sys.GroupKeys.contentWidth] !== width);
            let hChange = (values[sys.GroupKeys.contentHeight] !== height);
            if (!wChange && !hChange) {
                return;
            }
            values[sys.GroupKeys.contentWidth] = width;
            values[sys.GroupKeys.contentHeight] = height;
            if (wChange) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "contentWidth");
            }
            if (hChange) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "contentHeight");
            }
        }

        /**
         * 获取一个布局元素子项
         */
        public getElementAt(index: number): dou2d.DisplayObject {
            return this.$children[index];
        }

        /**
         * 获取一个虚拟布局元素子项
         */
        public getVirtualElementAt(index: number): dou2d.DisplayObject {
            return this.getElementAt(index);
        }

        /**
         * 在支持虚拟布局的容器中, 设置容器内可见的子元素索引范围
         */
        public setVirtualElementIndicesInView(startIndex: number, endIndex: number): void {
        }

        public $hitTest(stageX: number, stageY: number): dou2d.DisplayObject {
            let target = super.$hitTest(stageX, stageY);
            if (target || this.$Group[sys.GroupKeys.touchThrough]) {
                return target;
            }
            if (!this._visible || !this.touchEnabled || this.scaleX === 0 || this.scaleY === 0 || this.width === 0 || this.height === 0) {
                return null;
            }
            let point = dou.recyclable(dou2d.Point);
            this.globalToLocal(stageX, stageY, point);
            let values = this.$UIComponent;
            let rect = dou.recyclable(dou2d.Rectangle);
            let bounds = rect.set(0, 0, values[sys.UIKeys.width], values[sys.UIKeys.height]);
            let scrollRect = this._scrollRect;
            if (scrollRect) {
                bounds.x = scrollRect.x;
                bounds.y = scrollRect.y;
            }
            if (bounds.contains(point.x, point.y)) {
                point.recycle();
                rect.recycle();
                return this;
            }
            point.recycle();
            rect.recycle();
            return null;
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues(): void {
        }

        protected createChildren(): void {
            if (!this._layout) {
                this.layout = new BasicLayout();
            }
        }

        protected childrenCreated(): void {
        }

        protected commitProperties(): void {
        }

        protected measure(): void {
            if (!this._layout) {
                this.setMeasuredSize(0, 0);
                return;
            }
            this._layout.measure();
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            if (this._layout) {
                this._layout.updateDisplayList(unscaledWidth, unscaledHeight);
            }
            this.updateScrollRect();
        }

        protected invalidateParentLayout(): void {
        }

        public includeInLayout: boolean;

        public left: any;

        public right: any;

        public top: any;

        public bottom: any;

        public horizontalCenter: any;

        public verticalCenter: any;

        public percentWidth: number;

        public percentHeight: number;

        public explicitWidth: number;

        public explicitHeight: number;

        public minWidth: number;

        public maxWidth: number;

        public minHeight: number;

        public maxHeight: number;

        public setMeasuredSize(width: number, height: number): void {
        }

        public invalidateProperties(): void {
        }

        public validateProperties(): void {
        }

        public invalidateSize(): void {
        }

        public validateSize(recursive?: boolean): void {
        }

        public invalidateDisplayList(): void {
        }

        public validateDisplayList(): void {
        }

        public validateNow(): void {
        }

        public setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void {
        }

        public setLayoutBoundsPosition(x: number, y: number): void {
        }

        public getLayoutBounds(bounds: dou2d.Rectangle): void {
        }

        public getPreferredBounds(bounds: dou2d.Rectangle): void {
        }
    }

    sys.implementUIComponent(Group, dou2d.DisplayObjectContainer, true);
}

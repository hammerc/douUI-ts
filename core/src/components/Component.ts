namespace douUI {
    /**
     * 可设置外观的 UI 组件基类
     * @author wizardc
     */
    export abstract class Component extends dou2d.DisplayObjectContainer implements sys.IUIComponent {
        __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public constructor() {
            super();
            this.initializeUIValues();
            this.$Component = {
                0: null,         //hostComponentKey,
                1: null,         //skinName,
                2: "",           //explicitState,
                3: true,         //enabled,
                4: false,        //stateIsDirty,
                5: false,        //skinNameExplicitlySet,
                6: true,        //explicitTouchChildren,
                7: true,        //explicitTouchEnabled
                8: null          //skin
            };
            this._touchEnabled = true;
        }

        $Component: Object;

        $setTouchChildren(value: boolean): boolean {
            value = !!value;
            let values = this.$Component;
            values[sys.ComponentKeys.explicitTouchChildren] = value;
            if (values[sys.ComponentKeys.enabled]) {
                values[sys.ComponentKeys.explicitTouchChildren] = value;
                return super.$setTouchChildren(value);
            }
            return true;
        }

        $setTouchEnabled(value: boolean): void {
            value = !!value;
            let values = this.$Component;
            values[sys.ComponentKeys.explicitTouchEnabled] = value;
            if (values[sys.ComponentKeys.enabled]) {
                super.$setTouchEnabled(value);
            }
        }

        /**
         * 组件是否可以接受用户交互。
         * 将 enabled 属性设置为 false 后，
         * 组件会自动禁用触摸事件(将 touchEnabled 和 touchChildren 同时设置为 false)，
         * 部分组件可能还会将皮肤的视图状态设置为"disabled",使其所有子项的颜色变暗。
         */
        public set enabled(value: boolean) {
            value = !!value;
            this.$setEnabled(value);
        }
        public get enabled(): boolean {
            return this.$Component[sys.ComponentKeys.enabled];
        }

        $setEnabled(value: boolean): boolean {
            let values = this.$Component;
            if (value === values[sys.ComponentKeys.enabled]) {
                return false;
            }
            values[sys.ComponentKeys.enabled] = value;
            if (value) {
                this._touchEnabled = values[sys.ComponentKeys.explicitTouchEnabled];
                this._touchChildren = values[sys.ComponentKeys.explicitTouchChildren];
            }
            else {
                this._touchEnabled = false;
                this._touchChildren = false;
            }
            return true;
        }

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值，必须统一在此处初始化。
         */
        private initializeUIValues: () => void;

        /**
         * 子类覆盖此方法可以执行一些初始化子项操作。此方法仅在组件第一次添加到舞台时回调一次。
         * 请务必调用super.createChildren()以完成父类组件的初始化
         */
        protected createChildren(): void {
        }

        /**
         * 创建子对象后执行任何最终处理。此方法在创建 Component 的子类时覆盖。
         */
        protected childrenCreated(): void {
        }

        /**
         * 提交属性，子类在调用完invalidateProperties()方法后，应覆盖此方法以应用属性
         */
        protected commitProperties(): void {
        }

        /**
         * 测量组件尺寸
         */
        protected measure(): void {
            sys.measure(this);
            let skin = this.$Component[sys.ComponentKeys.skin];
            if (!skin) {
                return;
            }
            let values = this.$UIComponent;
            if (!isNaN(skin.width)) {
                values[sys.UIKeys.measuredWidth] = skin.width;
            }
            else {
                if (values[sys.UIKeys.measuredWidth] < skin.minWidth) {
                    values[sys.UIKeys.measuredWidth] = skin.minWidth;
                }
                if (values[sys.UIKeys.measuredWidth] > skin.maxWidth) {
                    values[sys.UIKeys.measuredWidth] = skin.maxWidth;
                }
            }
            if (!isNaN(skin.height)) {
                values[sys.UIKeys.measuredHeight] = skin.height;
            }
            else {
                if (values[sys.UIKeys.measuredHeight] < skin.minHeight) {
                    values[sys.UIKeys.measuredHeight] = skin.minHeight;
                }
                if (values[sys.UIKeys.measuredHeight] > skin.maxHeight) {
                    values[sys.UIKeys.measuredHeight] = skin.maxHeight;
                }
            }
        }

        /**
         * 更新显示列表
         */
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            sys.updateDisplayList(this, unscaledWidth, unscaledHeight);
        }

        /**
         * 此对象影响其布局时（includeInLayout 为 true），使父代大小和显示列表失效的方法。
         */
        protected invalidateParentLayout(): void {
        }

        $UIComponent: Object;

        $includeInLayout: boolean;

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

    sys.implementUIComponent(Component, dou2d.DisplayObjectContainer, true);
}

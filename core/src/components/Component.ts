namespace douUI {
    /**
     * 可设置外观的 UI 组件基类
     * @author wizardc
     */
    export abstract class Component extends dou2d.DisplayObjectContainer implements sys.IUIComponent {
        public $Component: Object;

        public constructor() {
            super();
            this.initializeUIValues();
            this.$Component = {
                0: true,        // enabled
                1: true,        // explicitTouchChildren
                2: true,        // explicitTouchEnabled
                3: null,        // skin
                4: null,        // skinName
                5: false,       // skinIsDirty
                6: null,        // explicitState
                7: false,       // stateIsDirty
                8: []           // skinStyle
            };
            this._touchEnabled = true;
        }

        /**
         * 组件是否可以接受用户交互
         */
        public set enabled(value: boolean) {
            value = !!value;
            let values = this.$Component;
            if (value === values[sys.ComponentKeys.enabled]) {
                return;
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
            this.invalidateState();
        }
        public get enabled(): boolean {
            return this.$Component[sys.ComponentKeys.enabled];
        }

        public $setTouchChildren(value: boolean): boolean {
            value = !!value;
            let values = this.$Component;
            values[sys.ComponentKeys.explicitTouchChildren] = value;
            if (values[sys.ComponentKeys.enabled]) {
                values[sys.ComponentKeys.explicitTouchChildren] = value;
                return super.$setTouchChildren(value);
            }
            return true;
        }

        public $setTouchEnabled(value: boolean): void {
            value = !!value;
            let values = this.$Component;
            values[sys.ComponentKeys.explicitTouchEnabled] = value;
            if (values[sys.ComponentKeys.enabled]) {
                super.$setTouchEnabled(value);
            }
        }

        /**
         * 当前使用的皮肤
         */
        public set skin(value: ISkin) {
            let values = this.$Component;
            if (values[sys.ComponentKeys.skin] == value) {
                return;
            }
            let oldSkin = values[sys.ComponentKeys.skin] as ISkin;
            if (oldSkin) {
                oldSkin.onUnload();
                this.onSkinRemoved();
            }
            values[sys.ComponentKeys.skin] = value;
            if (value) {
                if (this._stage) {
                    value.onCreateSkin();
                    value.onApply();
                    this.onSkinAdded();
                }
                else {
                    values[sys.ComponentKeys.skinIsDirty] = true;
                }
                values[sys.ComponentKeys.stateIsDirty] = true;
                this.invalidateProperties();
            }
        }
        public get skin(): ISkin {
            return this.$Component[sys.ComponentKeys.skin];
        }

        /**
         * 当前使用的皮肤名称
         */
        public set skinName(value: string) {
            let values = this.$Component;
            if (values[sys.ComponentKeys.skinName] == value) {
                return;
            }
            if (!value) {
                return;
            }
            values[sys.ComponentKeys.skinName] = value;
            let skinClass = Theme.getSkin(value);
            if (!skinClass) {
                throw new Error(`没有注册对应的皮肤类: ${value}`);
            }
            this.skin = new skinClass();
        }
        public get skinName(): string {
            return this.$Component[sys.ComponentKeys.skinName];
        }

        /**
         * 当前的状态
         */
        public set currentState(value: string) {
            let values = this.$Component;
            if (values[sys.ComponentKeys.explicitState] == value) {
                return;
            }
            values[sys.ComponentKeys.explicitState] = value;
            this.invalidateState();
        }
        public get currentState(): string {
            let values = this.$Component;
            return values[sys.ComponentKeys.explicitState] ? values[sys.ComponentKeys.explicitState] : this.getCurrentState();
        }

        /**
         * 标记状态失效
         */
        public invalidateState(): void {
            let values = this.$Component;
            if (values[sys.ComponentKeys.stateIsDirty]) {
                return;
            }
            values[sys.ComponentKeys.stateIsDirty] = true;
            this.invalidateProperties();
        }

        protected getCurrentState(): string {
            return "";
        }

        /**
         * 设置皮肤风格
         * * 仅对当前使用的皮肤有效, 皮肤更换后需要重新调用
         */
        public setStyle(name: string, ...args: any[]): void {
            if (!this.$UIComponent[sys.UIKeys.initialized]) {
                let values = this.$Component;
                let styleList = values[sys.ComponentKeys.skinStyle] as Array<any>;
                styleList.push([name, args]);
            }
            else {
                if (this.skin && typeof this.skin[name] == "function") {
                    this.skin[name].call(this.skin, ...args);
                }
            }
        }

        /**
         * 皮肤添加成功后调用
         */
        protected onSkinAdded(): void {
        }

        /**
         * 皮肤移除成功后调用
         */
        protected onSkinRemoved(): void {
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues(): void {
        }

        protected createChildren(): void {
            let values = this.$Component;
            if (!values[sys.ComponentKeys.skin]) {
                let skinClass = Theme.getDefaultSkin(<any>this.constructor);
                if (!skinClass) {
                    throw new Error(`没有注册默认的皮肤类: ${this.constructor}`);
                }
                this.skin = new skinClass(this);
            }
            if (values[sys.ComponentKeys.skinIsDirty]) {
                values[sys.ComponentKeys.skinIsDirty] = false;
                let skin = this.skin;
                skin.onCreateSkin();
                skin.onApply();
                this.onSkinAdded();
            }
            let styleList = values[sys.ComponentKeys.skinStyle] as Array<any>;
            if (styleList.length > 0) {
                for (let style of styleList) {
                    this.skin[style[0]].call(this.skin, ...style[1]);
                }
                styleList.length = 0;
            }
        }

        protected childrenCreated(): void {
        }

        protected commitProperties(): void {
            sys.UIComponentImpl.prototype["commitProperties"].call(this);
            let values = this.$Component;
            if (values[sys.ComponentKeys.skinIsDirty]) {
                values[sys.ComponentKeys.skinIsDirty] = false;
                let skin = this.skin;
                skin.onCreateSkin();
                skin.onApply();
                this.onSkinAdded();
            }
            if (values[sys.ComponentKeys.stateIsDirty]) {
                values[sys.ComponentKeys.stateIsDirty] = false;
                if (values[sys.ComponentKeys.skin]) {
                    (values[sys.ComponentKeys.skin] as ISkin).setState(this.currentState);
                }
            }
        }

        protected measure(): void {
            sys.measure(this);
            let skin = this.$Component[sys.ComponentKeys.skin] as ISkin;
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

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            sys.updateDisplayList(this, unscaledWidth, unscaledHeight);
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

    sys.implementUIComponent(Component, dou2d.DisplayObjectContainer, true);
}

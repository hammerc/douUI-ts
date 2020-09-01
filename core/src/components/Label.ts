namespace douUI {
    /**
     * 文本
     * @author wizardc
     */
    export class Label extends dou2d.TextField implements sys.IUIComponent {
        private _widthConstraint: number = NaN;

        public constructor(text?: string) {
            super();
            this.initializeUIValues();
            this.text = text;
        }

        public $invalidateTextField(): void {
            super.$invalidateTextField();
            this.invalidateSize();
        }

        public $setWidth(value: number): boolean {
            let result1 = super.$setWidth(value);
            let result2 = sys.UIComponentImpl.prototype.$setWidth.call(this, value);
            return result1 && result2;
        }

        public $setHeight(value: number): boolean {
            let result1 = super.$setHeight(value);
            let result2 = sys.UIComponentImpl.prototype.$setHeight.call(this, value);
            return result1 && result2;
        }

        public $setText(value: string): boolean {
            let result = super.$setText(value);
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "text");
            return result;
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues: () => void;

        protected createChildren(): void {
        }

        protected childrenCreated(): void {
        }

        protected commitProperties(): void {
        }

        protected measure(): void {
            let values = this.$UIComponent;
            let textValues = this.$propertyMap;
            let oldWidth = textValues[dou2d.sys.TextKeys.textFieldWidth];
            let availableWidth = NaN;
            if (!isNaN(this._widthConstraint)) {
                availableWidth = this._widthConstraint;
                this._widthConstraint = NaN;
            }
            else if (!isNaN(values[sys.UIKeys.explicitWidth])) {
                availableWidth = values[sys.UIKeys.explicitWidth];
            }
            else if (values[sys.UIKeys.maxWidth] != 100000) {
                availableWidth = values[sys.UIKeys.maxWidth];
            }
            super.$setWidth(availableWidth);
            this.setMeasuredSize(this.textWidth, this.textHeight);
            super.$setWidth(oldWidth);
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.$setWidth(unscaledWidth);
            super.$setHeight(unscaledHeight);
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
            sys.UIComponentImpl.prototype.setLayoutBoundsSize.call(this, layoutWidth, layoutHeight);
            if (isNaN(layoutWidth) || layoutWidth === this._widthConstraint || layoutWidth == 0) {
                this._widthConstraint = layoutWidth;
                return;
            }
            this._widthConstraint = layoutWidth;
            let values = this.$UIComponent;
            if (!isNaN(values[sys.UIKeys.explicitHeight])) {
                return;
            }
            if (layoutWidth == values[sys.UIKeys.measuredWidth]) {
                return;
            }
            this.invalidateSize();
        }

        public setLayoutBoundsPosition(x: number, y: number): void {
        }

        public getLayoutBounds(bounds: dou2d.Rectangle): void {
        }

        public getPreferredBounds(bounds: dou2d.Rectangle): void {
        }
    }

    sys.implementUIComponent(Label, dou2d.TextField);
}

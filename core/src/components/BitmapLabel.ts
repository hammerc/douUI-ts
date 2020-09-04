namespace douUI {
    /**
     * 位图文本
     * @author wizardc
     */
    export class BitmapLabel extends dou2d.BitmapText implements sys.IUIComponent {
        private _widthConstraint: number = NaN;
        private _heightConstraint: number = NaN;

        private _source: string;
        private _sourceChanged: boolean = false;

        public constructor(text?: string) {
            super();
            this.initializeUIValues();
            this.text = text;
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

        public set source(value: string) {
            if (this._source == value) {
                return;
            }
            this._source = value;
            if (this._stage) {
                this.parseFont();
            }
            else {
                this._sourceChanged = true;
                this.invalidateProperties();
            }
        }
        public get source(): string {
            return this._source;
        }

        public $invalidateContentBounds(): void {
            super.$invalidateContentBounds();
            this.invalidateSize();
        }

        private parseFont(): void {
            getAsset(this._source, (content: dou2d.BitmapFont, sourece) => {
                if (content && this._source == sourece) {
                    this.$setFont(content);
                    this._sourceChanged = false;
                }
            }, this);
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues(): void {
        }

        protected createChildren(): void {
            if (this._sourceChanged) {
                this.parseFont();
            }
        }

        protected childrenCreated(): void {
        }

        protected commitProperties(): void {
            sys.UIComponentImpl.prototype["commitProperties"].call(this);
            if (this._sourceChanged) {
                this.parseFont();
            }
        }

        protected measure(): void {
            let values = this.$UIComponent;
            let oldWidth = this._textFieldWidth;
            let oldHeight = this._textFieldHeight;
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
            let availableHeight = NaN;
            if (!isNaN(this._heightConstraint)) {
                availableHeight = this._heightConstraint;
                this._heightConstraint = NaN;
            }
            else if (!isNaN(values[sys.UIKeys.explicitHeight])) {
                availableHeight = values[sys.UIKeys.explicitHeight];
            }
            else if (values[sys.UIKeys.maxHeight] != 100000) {
                availableHeight = values[sys.UIKeys.maxHeight];
            }
            super.$setHeight(availableHeight);
            this.setMeasuredSize(this.textWidth, this.textHeight);
            super.$setWidth(oldWidth);
            super.$setHeight(oldHeight);
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
                return;
            }
            let values = this.$UIComponent;
            if (!isNaN(values[sys.UIKeys.explicitHeight])) {
                return;
            }
            if (layoutWidth == values[sys.UIKeys.measuredWidth]) {
                return;
            }
            this._widthConstraint = layoutWidth;
            this._heightConstraint = layoutHeight;
            this.invalidateSize();
        }

        public setLayoutBoundsPosition(x: number, y: number): void {
        }

        public getLayoutBounds(bounds: dou2d.Rectangle): void {
        }

        public getPreferredBounds(bounds: dou2d.Rectangle): void {
        }
    }

    sys.implementUIComponent(BitmapLabel, dou2d.BitmapText);
}

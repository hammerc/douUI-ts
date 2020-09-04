namespace douUI {
    /**
     * 可编辑文本
     * @author wizardc
     */
    export class EditableText extends dou2d.TextField implements sys.IUIComponent {
        public $EditableText: Object;

        private _widthConstraint: number = NaN;

        private _isShowPrompt: boolean = false;
        private _promptColor: number = 0x666666;

        private _isFocusIn: boolean = false;
        private _isTouchCancle: boolean = false;

        public constructor() {
            super();
            this.initializeUIValues();
            this.type = dou2d.TextFieldType.input;
            this.$EditableText = {
                0: null,         // promptText
                1: 0xffffff,     // textColorUser
                2: false         // asPassword
            }
        }

        /**
         * 空字符串时要显示的文本内容
         */
        public set prompt(value: string) {
            let values = this.$EditableText;
            let promptText = values[sys.EditableTextKeys.promptText];
            if (promptText == value) {
                return;
            }
            values[sys.EditableTextKeys.promptText] = value;
            let text = this.text;
            if (!text || text == promptText) {
                this.showPromptText();
            }
        }
        public get prompt(): string {
            return this.$EditableText[sys.EditableTextKeys.promptText];
        }

        /**
         * 空字符串时要显示的文本内容的颜色
         */
        public set promptColor(value: number) {
            value = +value | 0;
            if (this._promptColor != value) {
                this._promptColor = value;
                let text = this.text;
                if (!text || text == this.$EditableText[sys.EditableTextKeys.promptText]) {
                    this.showPromptText();
                }
            }
        }
        public get promptColor(): number {
            return this._promptColor;
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
            let promptText = this.$EditableText[sys.EditableTextKeys.promptText];
            if (promptText != value || promptText == null) {
                this._isShowPrompt = false;
                this.textColor = this.$EditableText[sys.EditableTextKeys.textColorUser];
                this.displayAsPassword = this.$EditableText[sys.EditableTextKeys.asPassword];
            }
            if (!this._isFocusIn) {
                if (value == "" || value == null) {
                    value = promptText;
                    this._isShowPrompt = true;
                    super.$setTextColor(this._promptColor);
                    super.$setDisplayAsPassword(false);
                }
            }
            let result = super.$setText(value);
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "text");
            return result;
        }

        public $getText(): string {
            let value = super.$getText();
            if (value == this.$EditableText[sys.EditableTextKeys.promptText]) {
                value = "";
            }
            return value;
        }

        public $onAddToStage(stage: dou2d.Stage, nestLevel: number): void {
            super.$onAddToStage(stage, nestLevel);
            this.on(dou2d.Event2D.FOCUS_IN, this.onfocusIn, this);
            this.on(dou2d.Event2D.FOCUS_OUT, this.onfocusOut, this);
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            this.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            this.off(dou2d.Event2D.FOCUS_IN, this.onfocusIn, this);
            this.off(dou2d.Event2D.FOCUS_OUT, this.onfocusOut, this);
            this.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            this.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
        }

        private onfocusOut(): void {
            this._isFocusIn = false;
            if (!this.text) {
                this.showPromptText();
            }
        }

        private onTouchBegin(): void {
            this._isTouchCancle = false;
        }

        private onTouchCancle(): void {
            this._isTouchCancle = true;
        }

        private onfocusIn(): void {
            if (!dou2d.Capabilities.isMobile && this._isTouchCancle) {
                this._inputController.hideInput();
                return;
            }
            this._isFocusIn = true;
            this._isShowPrompt = false;
            this.displayAsPassword = this.$EditableText[sys.EditableTextKeys.asPassword];
            let values = this.$EditableText;
            let text = this.text;
            if (!text || text == values[sys.EditableTextKeys.promptText]) {
                this.textColor = values[sys.EditableTextKeys.textColorUser];
                this.text = "";
            }
        }

        private showPromptText(): void {
            let values = this.$EditableText;
            this._isShowPrompt = true;
            super.$setTextColor(this._promptColor);
            super.$setDisplayAsPassword(false);
            this.text = values[sys.EditableTextKeys.promptText];
        }

        public $setTextColor(value: number): boolean {
            value = +value | 0;
            this.$EditableText[sys.EditableTextKeys.textColorUser] = value;
            if (!this._isShowPrompt) {
                super.$setTextColor(value);
            }
            return true;
        }

        public $setDisplayAsPassword(value: boolean): boolean {
            this.$EditableText[sys.EditableTextKeys.asPassword] = value;
            if (!this._isShowPrompt) {
                super.$setDisplayAsPassword(value);
            }
            return true;
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues(): void {
        }

        protected createChildren(): void {
            this.onfocusOut();
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
            this.invalidateSize();
        }

        public setLayoutBoundsPosition(x: number, y: number): void {
        }

        public getLayoutBounds(bounds: dou2d.Rectangle): void {
        }

        public getPreferredBounds(bounds: dou2d.Rectangle): void {
        }
    }

    sys.implementUIComponent(EditableText, dou2d.TextField);
}

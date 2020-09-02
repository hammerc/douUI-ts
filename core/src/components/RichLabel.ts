namespace douUI {
    /**
     * 富文本
     * @author wizardc
     */
    export class RichLabel extends Group {
        protected _label: Label;

        protected _text: string = "";
        protected _pickup: RegExp;
        protected _sourceFunc: (result: RegExpExecArray) => string;
        protected _scaleFunc: (result: RegExpExecArray) => number;

        protected _textInvalid: boolean = false;
        protected _styleInvalid: boolean = false;

        protected _lastWidth: number = 0;
        protected _lastHeight: number = 0;

        protected _imageList: IImageInfo[];

        public constructor() {
            super();
            this._label = new Label();
            this._label.multiline = true;
            this._label.wordWrap = true;
            this._label.percentWidth = 100;
            this._imageList = [];
        }

        public get label(): Label {
            return this._label;
        }

        public set fontFamily(value: string) {
            if (this._label.fontFamily == value) {
                return;
            }
            this._label.fontFamily = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get fontFamily(): string {
            return this._label.fontFamily;
        }

        public set size(value: number) {
            if (this._label.size == value) {
                return;
            }
            this._label.size = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get size(): number {
            return this._label.size;
        }

        public set bold(value: boolean) {
            if (this._label.bold == value) {
                return;
            }
            this._label.bold = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get bold(): boolean {
            return this._label.bold;
        }

        public set italic(value: boolean) {
            if (this._label.italic == value) {
                return;
            }
            this._label.italic = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get italic(): boolean {
            return this._label.italic;
        }

        public set textAlign(value: dou2d.HorizontalAlign) {
            if (this._label.textAlign == value) {
                return;
            }
            this._label.textAlign = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get textAlign(): dou2d.HorizontalAlign {
            return this._label.textAlign;
        }

        public set verticalAlign(value: dou2d.VerticalAlign) {
            if (this._label.verticalAlign == value) {
                return;
            }
            this._label.verticalAlign = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get verticalAlign(): dou2d.VerticalAlign {
            return this._label.verticalAlign;
        }

        public set lineSpacing(value: number) {
            if (this._label.lineSpacing == value) {
                return;
            }
            this._label.lineSpacing = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get lineSpacing(): number {
            return this._label.lineSpacing;
        }

        public set textColor(value: number) {
            this._label.textColor = value;
        }
        public get textColor(): number {
            return this._label.textColor;
        }

        public set text(value: string) {
            if (this._text == value) {
                return;
            }
            this._text = value;
            this._textInvalid = true;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        public get text() {
            return this._text;
        }

        public set strokeColor(value: number) {
            this._label.strokeColor = value;
        }
        public get strokeColor(): number {
            return this._label.strokeColor;
        }

        public set stroke(value: number) {
            this._label.stroke = value;
        }
        public get stroke(): number {
            return this._label.stroke;
        }

        public get numLines(): number {
            return this._label.numLines;
        }

        public get textWidth(): number {
            return this._label.textWidth;
        }

        public get textHeight(): number {
            return this._label.textHeight;
        }

        /**
         * 需要添加 g 标签
         * 表情获取如下：label.pickup = /#\d{2}#/g;
         */
        public set pickup(value: RegExp) {
            this._pickup = value;
        }
        public get pickup(): RegExp {
            return this._pickup;
        }

        /**
         * @param result 为获取的匹配结果
         * @returns 对应的图片路径
         */
        public set sourceFunc(value: (result: RegExpExecArray) => string) {
            this._sourceFunc = value;
        }
        public get sourceFunc(): (result: RegExpExecArray) => string {
            return this._sourceFunc;
        }

        /**
         * @param result 为获取的匹配结果, 设置为空表示缩放为 1
         * @returns 对应的图片缩放值
         */
        public set scaleFunc(value: (result: RegExpExecArray) => number) {
            this._scaleFunc = value;
        }
        public get scaleFunc(): (result: RegExpExecArray) => number {
            return this._scaleFunc;
        }

        public set linkPreventTap(value: boolean) {
            this._label.linkPreventTap = value;
        }
        public get linkPreventTap(): boolean {
            return this._label.linkPreventTap;
        }

        protected createChildren(): void {
            super.createChildren();
            this.on(dou2d.Event2D.RESIZE, this.onResize, this);
            this.addChild(this._label);
        }

        private onResize(event: dou2d.Event2D): void {
            dou2d.callLaterUnique(this.$onResize, this);
        }

        private $onResize(): void {
            let width = this.width;
            let height = this.height;
            if (this._lastWidth != width || this._lastHeight != height) {
                this._lastWidth = width;
                this._lastHeight = height;
                this._styleInvalid = true;
                this.onRender();
            }
        }

        protected onRender(): void {
            if (this._textInvalid) {
                this._textInvalid = false;
                for (let image of this._imageList) {
                    image.icon.off(dou.Event.COMPLETE, this.onImageLoad, this);
                    image.icon.recycle();
                }
                this._imageList.length = 0;
                let regExp = new RegExp(this._pickup);
                let result: RegExpExecArray;
                while (result = regExp.exec(this._text)) {
                    let source = this._sourceFunc(result);
                    let icon = dou.recyclable(Image);
                    let scale = 1;
                    if (this._scaleFunc) {
                        scale = this._scaleFunc(result);
                    }
                    let sign = result[0];
                    icon.on(dou.Event.COMPLETE, this.onImageLoad, this);
                    icon.source = source;
                    icon.scaleX = icon.scaleY = scale;
                    icon.smoothing = true;
                    this._imageList.push({ sign, icon, x: 0, y: 0, scale });
                }
            }
            if (this._styleInvalid) {
                this._styleInvalid = false;
                let text = this._text;
                for (let image of this._imageList) {
                    let size = Math.max(image.icon.width, image.icon.height, 5);
                    text = text.replace(image.sign, `<font size = "${~~(size * image.scale)}">　</font>`);
                }
                this._label.textFlow = dou2d.HtmlTextParser.parse(text);
                let textWidth = this._label.textWidth;
                // 修复宽高为 0 的 bug
                if (textWidth == 0) {
                    this._label.$propertyMap[dou2d.sys.TextKeys.textLinesChanged] = true;
                    this._label.$propertyMap[dou2d.sys.TextKeys.textFieldWidth] = this._label.$propertyMap[dou2d.sys.TextKeys.textFieldHeight] = NaN;
                    textWidth = this._label.textWidth;
                }
                textWidth = Math.max(this._label.width, textWidth);
                this._label.$propertyMap[dou2d.sys.TextKeys.textFieldWidth] = textWidth > this.maxWidth ? this.maxWidth : textWidth;
                // 使用下面的代码避免抖动
                this._label.height = this._label.textHeight;
                dou2d.callLaterUnique(this.onTextRender, this);
            }
        }

        protected onImageLoad(event: dou.Event): void {
            let image = event.target as dou.Recyclable<Image>;
            image.width = image.texture.textureWidth;
            image.height = image.texture.textureHeight;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }

        protected onTextRender(): void {
            let lines = this._label.$getLinesArr();
            let index = 0, offsetX = 0, offsetY = 0;
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                let line = lines[lineIndex];
                if (this._label.textAlign == dou2d.HorizontalAlign.left) {
                    offsetX = 0;
                }
                else if (this._label.textAlign == dou2d.HorizontalAlign.right) {
                    offsetX = this._label.width - line.width;
                }
                else if (this._label.textAlign == dou2d.HorizontalAlign.center) {
                    offsetX = this._label.width - line.width >> 1;
                }
                for (let element of line.elements) {
                    if (element.text == "　") {
                        let image = this._imageList[index++];
                        if (image) {
                            image.x = offsetX;
                            image.y = offsetY;
                        }
                    }
                    offsetX += element.width;
                }
                offsetY += line.height;
            }
            for (let image of this._imageList) {
                let icon = image.icon;
                icon.x = this._label.x + image.x;
                icon.y = this._label.y + image.y;
                this.addChild(icon);
            }
            this.dispatchEvent2D(dou2d.Event2D.RICH_TEXT_CHANGE, null, true);
        }

        public clear(): void {
            for (let image of this._imageList) {
                image.icon.off(dou.Event.COMPLETE, this.onImageLoad, this);
                image.icon.recycle();
            }
            this._imageList.length = 0;
        }
    }

    interface IImageInfo {
        sign: string;
        icon: dou.Recyclable<Image>;
        x: number;
        y: number;
        scale: number;
    }
}

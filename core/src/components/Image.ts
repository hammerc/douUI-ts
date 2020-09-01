namespace douUI {
    /**
     * 图片
     * @author wizardc
     */
    export class Image extends dou2d.Bitmap implements sys.IUIComponent {
        private _source: string | dou2d.Texture;
        private _sourceChanged: boolean = false;

        public constructor(source?: string | dou2d.Texture) {
            super();
            this.initializeUIValues();
            if (source) {
                this.source = source;
            }
        }

        public set source(value: string | dou2d.Texture) {
            if (this._source == value) {
                return;
            }
            this._source = value;
            if (this._stage) {
                this.parseSource();
            }
            else {
                this._sourceChanged = true;
                this.invalidateProperties();
            }
        }
        public get source(): string | dou2d.Texture {
            return this._source;
        }

        public $setScale9Grid(value: dou2d.Rectangle): void {
            let result = super.$setScale9Grid(value);
            this.invalidateDisplayList();
            return result;
        }

        public $setFillMode(value: dou2d.BitmapFillMode): boolean {
            let result = super.$setFillMode(value);
            this.invalidateDisplayList();
            return result;
        }

        public $setTexture(value: dou2d.Texture): boolean {
            if (this._texture == value) {
                return false;
            }
            let result = super.$setTexture(value);
            this._sourceChanged = false;
            this.invalidateSize();
            this.invalidateDisplayList();
            return result;
        }

        private parseSource(): void {
            if (this._source && typeof this._source == "string") {
                getAsset(<string>this._source, (content: dou2d.Texture, source: string) => {
                    if (this._source != source) {
                        return;
                    }
                    if (!content || !(content instanceof dou2d.Texture)) {
                        return;
                    }
                    this.$setTexture(content);
                    this.dispatchEvent(dou.Event.COMPLETE);
                }, this);
            }
            else {
                this.$setTexture(<dou2d.Texture>this._source);
            }
        }

        public $measureContentBounds(bounds: dou2d.Rectangle): void {
            let image = this._texture;
            if (image) {
                let values = this.$UIComponent;
                let width = values[sys.UIKeys.width];
                let height = values[sys.UIKeys.height];
                if (isNaN(width) || isNaN(height)) {
                    bounds.clear();
                    return;
                }
                if (this._fillMode == dou2d.BitmapFillMode.clip) {
                    if (width > image.$getTextureWidth()) {
                        width = image.$getTextureWidth();
                    }
                    if (height > image.$getTextureHeight()) {
                        height = image.$getTextureHeight();
                    }
                }
                bounds.set(0, 0, width, height);
            }
            else {
                bounds.clear();
            }
        }

        public __interface_type__: "douUI.sys.IUIComponent" = "douUI.sys.IUIComponent";

        public $UIComponent: Object;

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues: () => void;

        protected createChildren(): void {
            if (this._sourceChanged) {
                this.parseSource();
            }
        }

        protected setActualSize(w: number, h: number): void {
            sys.UIComponentImpl.prototype["setActualSize"].call(this, w, h);
            super.$setWidth(w);
            super.$setHeight(h);
        }

        protected childrenCreated(): void {
        }

        protected commitProperties(): void {
            sys.UIComponentImpl.prototype["commitProperties"].call(this);
            if (this._sourceChanged) {
                this.parseSource();
            }
        }

        protected measure(): void {
            let texture = this._texture;
            if (texture) {
                this.setMeasuredSize(texture.$getTextureWidth(), texture.$getTextureHeight());
            }
            else {
                this.setMeasuredSize(0, 0);
            }
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            this.$renderDirty = true;
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

    sys.implementUIComponent(Image, dou2d.Bitmap);
}

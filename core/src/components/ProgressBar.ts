namespace douUI {
    /**
     * 进度条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: "labelDisplay"
     * @author wizardc
     */
    export class ProgressBar extends Range {
        /**
         * 进度高亮显示对象
         */
        public thumb: Component;

        /**
         * 进度条文本
         */
        public labelDisplay: Label;

        private _labelFunction: (value: number, maximum: number) => string;

        private _direction: Direction = Direction.ltr;

        private _thumbInitX = 0;
        private _thumbInitY = 0;

        /**
         * 进度条文本格式化回调函数
         */
        public set labelFunction(value: (value: number, maximum: number) => string) {
            if (this._labelFunction == value) {
                return;
            }
            this._labelFunction = value;
            this.invalidateDisplayList();
        }
        public get labelFunction(): (value: number, maximum: number) => string {
            return this._labelFunction;
        }

        /**
         * 进度条增长方向
         */
        public set direction(value: Direction) {
            if (this._direction == value) {
                return;
            }
            if (this.thumb) {
                this.thumb.x = this._thumbInitX;
            }
            if (this.thumb) {
                this.thumb.y = this._thumbInitY;
            }
            this._direction = value;
            this.invalidateDisplayList();
        }
        public get direction(): Direction {
            return this._direction;
        }

        protected updateSkinDisplayList(): void {
            let currentValue = this.value;
            let maxValue = this.maximum;
            let thumb = this.thumb;
            if (thumb) {
                let thumbWidth = thumb.width;
                let thumbHeight = thumb.height;
                let clipWidth = Math.round((currentValue / maxValue) * thumbWidth);
                if (clipWidth < 0 || clipWidth === Infinity) {
                    clipWidth = 0;
                }
                let clipHeight = Math.round((currentValue / maxValue) * thumbHeight);
                if (clipHeight < 0 || clipHeight === Infinity) {
                    clipHeight = 0;
                }
                let rect = thumb.scrollRect;
                if (!rect) {
                    rect = new dou2d.Rectangle();
                }
                rect.set(0, 0, thumbWidth, thumbHeight);
                let thumbPosX = thumb.x - rect.x;
                let thumbPosY = thumb.y - rect.y;
                switch (this._direction) {
                    case Direction.ltr:
                        rect.width = clipWidth;
                        thumb.x = thumbPosX;
                        break;
                    case Direction.rtl:
                        rect.width = clipWidth;
                        rect.x = thumbWidth - clipWidth;
                        thumb.x = rect.x;
                        break;
                    case Direction.ttb:
                        rect.height = clipHeight;
                        thumb.y = thumbPosY;
                        break;
                    case Direction.btt:
                        rect.height = clipHeight;
                        rect.y = thumbHeight - clipHeight;
                        thumb.y = rect.y;
                        break;
                }
                thumb.scrollRect = rect;
            }
            if (this.labelDisplay) {
                this.labelDisplay.text = this.valueToLabel(currentValue, maxValue);
            }
        }

        protected valueToLabel(value: number, maximum: number): string {
            if (this.labelFunction != null) {
                return this._labelFunction(value, maximum);
            }
            return value + "/" + maximum;
        }
    }
}

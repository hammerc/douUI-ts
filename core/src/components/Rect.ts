namespace douUI {
    /**
     * 矩形绘图组件
     * @author wizardc
     */
    export class Rect extends Component {
        private _graphics: dou2d.Graphics;

        private _fillColor: number = 0x000000;
        private _fillAlpha: number = 1;

        private _strokeColor: number = 0x444444;
        private _strokeAlpha: number = 1;
        private _strokeWeight: number = 0;

        private _ellipseWidth: number = 0;
        private _ellipseHeight: number = 0;

        public constructor(width?: number, height?: number, fillColor?: number) {
            super();
            this.touchChildren = false;
            this._graphics = new dou2d.Graphics();
            this._graphics.$setTarget(this);
            this.width = width;
            this.height = height;
            this.fillColor = fillColor;
        }

        public get graphics(): dou2d.Graphics {
            return this._graphics;
        }

        /**
         * 填充颜色
         */
        public set fillColor(value: number) {
            if (value == undefined || this._fillColor == value) {
                return;
            }
            this._fillColor = value;
            this.invalidateDisplayList();
        }
        public get fillColor(): number {
            return this._fillColor;
        }

        /**
         * 填充透明度
         */
        public set fillAlpha(value: number) {
            if (this._fillAlpha == value) {
                return;
            }
            this._fillAlpha = value;
            this.invalidateDisplayList();
        }
        public get fillAlpha(): number {
            return this._fillAlpha;
        }

        /**
         * 边框颜色
         */
        public set strokeColor(value: number) {
            if (this._strokeColor == value) {
                return;
            }
            this._strokeColor = value;
            this.invalidateDisplayList();
        }
        public get strokeColor(): number {
            return this._strokeColor;
        }

        /**
         * 边框透明度
         */
        public set strokeAlpha(value: number) {
            if (this._strokeAlpha == value) {
                return;
            }
            this._strokeAlpha = value;
            this.invalidateDisplayList();
        }
        public get strokeAlpha(): number {
            return this._strokeAlpha;
        }

        /**
         * 边框粗细, 为 0 时不显示边框
         */
        public set strokeWeight(value: number) {
            if (this._strokeWeight == value) {
                return;
            }
            this._strokeWeight = value;
            this.invalidateDisplayList();
        }
        public get strokeWeight(): number {
            return this._strokeWeight;
        }

        /**
         * 用于绘制圆角的椭圆的宽度
         */
        public set ellipseWidth(value: number) {
            if (this._ellipseWidth == value) {
                return;
            }
            this._ellipseWidth = value;
            this.invalidateDisplayList();
        }
        public get ellipseWidth(): number {
            return this._ellipseWidth;
        }

        /**
         * 用于绘制圆角的椭圆的高度
         */
        public set ellipseHeight(value: number) {
            if (this._ellipseHeight == value) {
                return;
            }
            this._ellipseHeight = value;
            this.invalidateDisplayList();
        }
        public get ellipseHeight(): number {
            return this._ellipseHeight;
        }

        public $measureContentBounds(bounds: dou2d.Rectangle): void {
            if (this._graphics) {
                bounds.set(0, 0, this.width, this.height);
            }
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            let g = this.graphics;
            g.clear();
            if (this._strokeWeight > 0) {
                g.beginFill(this._fillColor, 0);
                g.lineStyle(this._strokeWeight, this._strokeColor, this._strokeAlpha, dou2d.CapsStyle.square, dou2d.JointStyle.miter);
                if (this._ellipseWidth == 0 && this._ellipseHeight == 0) {
                    g.drawRect(this._strokeWeight / 2, this._strokeWeight / 2, unscaledWidth - this._strokeWeight, unscaledHeight - this._strokeWeight);
                }
                else {
                    g.drawRoundRect(this._strokeWeight / 2, this._strokeWeight / 2, unscaledWidth - this._strokeWeight, unscaledHeight - this._strokeWeight, this._ellipseWidth, this._ellipseHeight);
                }
                g.endFill();
            }
            g.beginFill(this._fillColor, this._fillAlpha);
            g.lineStyle(this._strokeWeight, this._strokeColor, 0, dou2d.CapsStyle.square, dou2d.JointStyle.miter);
            if (this._ellipseWidth == 0 && this._ellipseHeight == 0) {
                g.drawRect(this._strokeWeight, this._strokeWeight, unscaledWidth - this._strokeWeight * 2, unscaledHeight - this._strokeWeight * 2);
            }
            else {
                g.drawRoundRect(this._strokeWeight, this._strokeWeight, unscaledWidth - this._strokeWeight * 2, unscaledHeight - this._strokeWeight * 2, this._ellipseWidth, this._ellipseHeight);
            }
            g.endFill();
        }

        public $onRemoveFromStage(): void {
            super.$onRemoveFromStage();
            if (this._graphics) {
                this._graphics.$onRemoveFromStage();
            }
        }
    }
}

namespace douUI {
    /**
     * 皮肤基类
     * @author wizardc
     */
    export abstract class SkinBase implements ISkin {
        protected _target: sys.IUIComponent;

        protected _width: number;
        protected _minWidth: number;
        protected _maxWidth: number;
        protected _height: number;
        protected _minHeight: number;
        protected _maxHeight: number;

        public constructor(target: sys.IUIComponent, size?: { width?: number, minWidth?: number, maxWidth?: number, height?: number, minHeight?: number, maxHeight?: number }) {
            this._target = target;
            if (size) {
                this._width = size.width;
                this._minWidth = size.minWidth;
                this._maxWidth = size.maxWidth;
                this._height = size.height;
                this._minHeight = size.minHeight;
                this._maxHeight = size.maxHeight;
            }
        }

        public get width(): number {
            return this._width;
        }

        public get minWidth(): number {
            return this._minWidth;
        }

        public get maxWidth(): number {
            return this._maxWidth;
        }

        public get height(): number {
            return this._height;
        }

        public get minHeight(): number {
            return this._minHeight;
        }

        public get maxHeight(): number {
            return this._maxHeight;
        }

        /**
         * 将特定的实例绑定到目标对象的指定属性上
         */
        protected bindToTarget(attributeName: string, instance: dou2d.DisplayObject): void {
            this._target[attributeName] = instance;
        }

        public abstract onApply(): void;

        public abstract onUnload(): void;

        public setState(state: string): void {
        }
    }
}

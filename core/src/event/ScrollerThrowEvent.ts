declare module dou {
    interface EventDispatcher {
        /**
         * 抛出滚动事件
         */
        dispatchScrollerThrowEvent(type: string, currentPos?: number, toPos?: number): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchScrollerThrowEvent: {
            value: function (type: string, currentPos?: number, toPos?: number): boolean {
                let event = dou.recyclable(douUI.ScrollerThrowEvent);
                event.$initScrollerThrowEvent(type, currentPos, toPos);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();

namespace douUI {
    /**
     * 滚动事件
     * @author wizardc
     */
    export class ScrollerThrowEvent extends dou2d.Event2D {
        /**
         * 滚动
         */
        public static THROW: string = "throw";

        private _currentPos: number;
        private _toPos: number;

        /**
         * 滚动区域当前滚动位置
         */
        public get currentPos(): number {
            return this._currentPos;
        }

        /**
         * 要滚动到的位置
         * * 修改当前值会修改要滚动到得位置, 但是当 moveFlag 为 false 时修改此值依然不会滚动, 若此时依然要调整滚动区域的位置可以自己设置
         */
        public get toPos(): number {
            return this._toPos;
        }

        public $initScrollerThrowEvent(type: string, currentPos?: number, toPos?: number): void {
            this.$initEvent2D(type);
            this._currentPos = currentPos;
            this._toPos = toPos;
        }

        public onRecycle(): void {
            super.onRecycle();
            this._currentPos = NaN;
            this._toPos = NaN;
        }
    }
}

declare module dou {
    interface EventDispatcher {
        /**
         * 抛出 UI 事件
         */
        dispatchUIEvent(type: string, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchUIEvent: {
            value: function (type: string, bubbles?: boolean, cancelable?: boolean): boolean {
                let event = dou.recyclable(douUI.UIEvent);
                event.$initUIEvent(type, bubbles, cancelable);
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
     * UI 事件
     * @author wizardc
     */
    export class UIEvent extends dou2d.Event2D {
        /**
         * 组件创建完成
         */
        public static CREATION_COMPLETE: string = "creationComplete";

        /**
         * UI组件在父级容器中的坐标发生改变事件
         */
        public static MOVE: string = "move";

        /**
         * 改变开始
         */
        public static CHANGE_START: string = "changeStart";

        /**
         * 改变结束
         */
        public static CHANGE_END: string = "changeEnd";

        /**
         * 即将关闭面板事件
         */
        public static CLOSING: string = "closing";

        public $initUIEvent(type: string, bubbles?: boolean, cancelable?: boolean): void {
            this.$initEvent2D(type, null, bubbles, cancelable);
        }
    }
}

declare module dou {
    module Event {
        const CHANGING: string;
        const PROPERTY_CHANGE: string;
    }
}

declare module dou2d {
    module Event2D {
        const ITEM_TAP: string;
    }

    module TouchEvent {
        /**
         * 触发取消操作时, Scroller 组件滚动时按下的组件会派发该事件, 注意后续的 TOUCH_END 等事件已经不会继续派发了
         */
        const TOUCH_CANCEL: string;
    }
}

(function () {
    let f, p;

    f = dou.Event;
    f.CHANGING = "changing";
    f.PROPERTY_CHANGE = "propertyChange";

    f = dou2d.Event2D;
    f.ITEM_TAP = "itemTap";

    f = dou2d.TouchEvent;
    f.TOUCH_CANCEL = "touchCancel";

})();

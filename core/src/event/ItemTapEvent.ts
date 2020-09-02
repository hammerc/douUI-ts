declare module dou {
    interface EventDispatcher {
        /**
         * 抛出列表项触碰事件
         */
        dispatchItemTapEvent(type: string, itemRenderer?: douUI.IItemRenderer): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchItemTapEvent: {
            value: function (type: string, itemRenderer?: douUI.IItemRenderer): boolean {
                let event = dou.recyclable(douUI.ItemTapEvent);
                event.$initItemTapEvent(type, itemRenderer);
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
     * 列表项触碰事件
     * @author wizardc
     */
    export class ItemTapEvent extends dou2d.Event2D {
        /**
         * 列表项触碰
         */
        public static ITEM_TAP: string = "itemTap";

        private _item: any;
        private _itemRenderer: IItemRenderer;
        private _itemIndex: number;

        /**
         * 触发触摸事件的项呈示器数据源项
         */
        public get item(): any {
            return this._item;
        }

        /**
         * 触发触摸事件的项呈示器
         */
        public get itemRenderer(): IItemRenderer {
            return this._itemRenderer;
        }

        /**
         * 触发触摸事件的项索引
         */
        public get itemIndex(): number {
            return this._itemIndex;
        }

        public $initItemTapEvent(type: string, itemRenderer?: IItemRenderer): void {
            super.$initEvent2D(type);
            this._item = itemRenderer.data;
            this._itemRenderer = itemRenderer;
            this._itemIndex = itemRenderer.itemIndex;
        }

        public onRecycle(): void {
            super.onRecycle();
            this._item = null;
            this._itemRenderer = null;
            this._itemIndex = NaN;
        }
    }
}

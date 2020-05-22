declare module dou {
    interface EventDispatcher {
        /**
         * 抛出集合数据改变事件
         */
        dispatchCollectionEvent(type: string, kind?: douUI.CollectionEventKind, location?: number, oldLocation?: number, items?: any[], oldItems?: any[], cancelable?: boolean): boolean;
    }
}

(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchCollectionEvent: {
            value: function (type: string, kind?: douUI.CollectionEventKind, location?: number, oldLocation?: number, items?: any[], oldItems?: any[], cancelable?: boolean): boolean {
                let event = dou.recyclable(douUI.CollectionEvent);
                event.$initCollectionEvent(type, cancelable, kind, location, oldLocation, items, oldItems);
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
     * 集合数据改变事件
     * @author wizardc
     */
    export class CollectionEvent extends dou.Event {
        public static COLLECTION_CHANGE: string = "collectionChange";

        private _kind: CollectionEventKind;
        private _location: number;
        private _oldLocation: number;
        private _items: any[];
        private _oldItems: any[];

        /**
         * 发生的事件类型
         */
        public get kind(): CollectionEventKind {
            return this._kind;
        }

        /**
         * 如果 kind 值为 CollectionEventKind.ADD, CollectionEventKind.REMOVE, CollectionEventKind.REPLACE, CollectionEventKind.UPDATE,
         * 则此属性为 items 属性中指定的项目集合中零号元素的的索引
         */
        public get location(): number {
            return this._location;
        }

        /**
         * 此属性为 items 属性中指定的项目在目标集合中原来位置的从零开始的索引
         */
        public get oldLocation(): number {
            return this._oldLocation;
        }

        /**
         * 受事件影响的项目的列表
         */
        public get items(): any[] {
            return this._items;
        }

        /**
         * 仅当 kind 的值为 CollectionEventKind.REPLACE 时, 表示替换前的项目列表
         */
        public get oldItems(): any[] {
            return this._oldItems;
        }

        public $initCollectionEvent(type: string, cancelable?: boolean, kind?: CollectionEventKind, location?: number, oldLocation?: number, items?: any[], oldItems?: any[]): void {
            this.$initEvent(type, null, cancelable);
            this._kind = kind;
            this._location = +location | 0;
            this._oldLocation = +oldLocation | 0;
            this._items = items || [];
            this._oldItems = oldItems || [];
        }

        public onRecycle(): void {
            super.onRecycle();
            this._kind = null;
            this._location = NaN;
            this._oldLocation = NaN;
            this._items = null;
            this._oldItems = null;
        }
    }
}

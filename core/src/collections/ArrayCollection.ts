namespace douUI {
    /**
     * 集合类数据源接
     * @author wizardc
     */
    export class ArrayCollection extends dou.EventDispatcher implements ICollection {
        private _source: any[];

        public constructor(source?: any[]) {
            super();
            if (source) {
                this._source = source;
            }
            else {
                this._source = [];
            }
        }

        /**
         * 数据源
         * * 通常情况下请不要直接调用 Array 的方法操作数据源, 否则对应的视图无法收到数据改变的通知, 若对数据源进行了修改, 请手动调用 refresh 方法刷新数据
         */
        public set source(value: any[]) {
            if (!value) {
                value = [];
            }
            this._source = value;
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.RESET);
        }
        public get source(): any[] {
            return this._source;
        }

        /**
         * 此集合中的项目数
         */
        public get length(): number {
            return this._source.length;
        }

        /**
         * 向列表末尾添加指定项目
         * @param item 要被添加的项
         */
        public addItem(item: any): void {
            this._source.push(item);
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.ADD, this._source.length - 1, -1, [item]);
        }

        /**
         * 在指定的索引处添加项目
         * @param item 要添加的项
         * @param index 要添加的指定索引位置
         */
        public addItemAt(item: any, index: number): void {
            if (index < 0 || index > this._source.length) {
                console.error("An index specified for a parameter was out of range.");
            }
            this._source.splice(index, 0, item);
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.ADD, index, -1, [item]);
        }

        /**
         * 获取指定索引处的项目
         */
        public getItemAt(index: number): any {
            return this._source[index];
        }

        /**
         * 如果项目位于列表中, 返回该项目的索引, 否则返回 -1
         */
        public getItemIndex(item: any): number {
            let length = this._source.length;
            for (let i = 0; i < length; i++) {
                if (this._source[i] === item) {
                    return i;
                }
            }
            return -1;
        }

        /**
         * 通知视图某个项目的属性已更新
         * @param item 视图中需要被更新的项
         */
        public itemUpdated(item: any): void {
            let index = this.getItemIndex(item);
            if (index != -1) {
                this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.UPDATE, index, -1, [item]);
            }
        }

        /**
         * 替换在指定索引处的项目, 并返回该项目
         * @param item 要在指定索引放置的新的项
         * @param index 要被替换的项的索引位置
         * @return 被替换的项目
         */
        public replaceItemAt(item: any, index: number): any {
            if (index < 0 || index >= this._source.length) {
                console.error("An index specified for a parameter was out of range.");
                return;
            }
            let oldItem = this._source.splice(index, 1, item)[0];
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.REPLACE, index, -1, [item], [oldItem]);
            return oldItem;
        }

        /**
         * 用新数据源替换原始数据源, 此方法与直接设置 source 不同, 它不会导致目标视图重置滚动位置
         */
        public replaceAll(newSource: any[]): void {
            if (!newSource) {
                newSource = [];
            }
            let newLength = newSource.length;
            let oldLength = this._source.length;
            for (let i = newLength; i < oldLength; i++) {
                this.removeItemAt(newLength);
            }
            for (let i = 0; i < newLength; i++) {
                if (i >= oldLength) {
                    this.addItemAt(newSource[i], i);
                }
                else {
                    this.replaceItemAt(newSource[i], i);
                }
            }
            this._source = newSource;
        }

        /**
         * 删除指定索引处的项目并返回该项目, 原先位于此索引之后的所有项目的索引现在都向前移动一个位置
         * @param index 要被移除的项的索引
         * @return 被移除的项
         */
        public removeItemAt(index: number): any {
            if (index < 0 || index >= this._source.length) {
                console.error("An index specified for a parameter was out of range.");
                return;
            }
            let item = this._source.splice(index, 1)[0];
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.REMOVE, index, -1, [item]);
            return item;
        }

        /**
         * 删除列表中的所有项目
         */
        public removeAll(): void {
            let items = this._source.concat();
            this._source = [];
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.REMOVE, 0, -1, items);
        }

        /**
         * 在对数据源进行排序或过滤操作后可以手动调用此方法刷新所有数据, 以更新视图
         * * ArrayCollection 不会自动检原始数据进行了改变, 所以你必须调用该方法去更新显示
         */
        public refresh(): void {
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.REFRESH);
        }
    }
}

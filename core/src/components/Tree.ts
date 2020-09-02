namespace douUI {
    /**
     * 树形组件
     * @author wizardc
     */
    export class Tree extends Group {
        protected _itemRenderers: any[];
        protected _showRoot: boolean = false;
        protected _keepStatus: boolean = true;
        protected _justOpenOne: boolean = false;
        protected _allowClose: boolean = true;
        protected _dataProvider: any;
        protected _selectedItem: any;

        protected _itemChangedFlag: boolean = false;
        protected _sizeChangedFlag: boolean = false;
        protected _itemPool: IItemRenderer[][];
        protected _treeDataProvider: ITreeDataCollection;
        protected _selectedRenderer: IItemRenderer;

        public constructor() {
            super();
            this._itemPool = [];
        }

        /**
         * 项目渲染列表
         * * 分别对应各深度项目的渲染器类
         * * 如果不需要显示顶级深度项目则数组第一个元素为空即可
         */
        public set itemRenderers(value: any[]) {
            this._itemRenderers = value;
        }
        public get itemRenderers(): any[] {
            return this._itemRenderers;
        }

        /**
         * 是否显示顶级深度项目
         */
        public set showRoot(value: boolean) {
            this._showRoot = value;
        }
        public get showRoot(): boolean {
            return this._showRoot;
        }

        /**
         * 数据源发生变化后, 是否保持之前打开状态
         * * 要求新数据源的父级节点对象仍然是之前的对象
         */
        public set keepStatus(value: boolean) {
            this._keepStatus = value;
        }
        public get keepStatus(): boolean {
            return this._keepStatus;
        }

        /**
         * 是否只能展开一个项目
         * * 如果为 true, 展开一个项目之后会关闭其它已经展开的项目
         */
        public set justOpenOne(value: boolean) {
            this._justOpenOne = value;
        }
        public get justOpenOne(): boolean {
            return this._justOpenOne;
        }

        /**
         * 展开的项目点击其父级项目是否会收起展开
         */
        public set allowClose(value: boolean) {
            this._allowClose = value;
        }
        public get allowClose(): boolean {
            return this._allowClose;
        }

        /**
         * 设置数据源, 子项的字段名为 children 且必须是数组
         * * 无论源数据是否改变, 重新设置都会触发刷新
         */
        public set dataProvider(value: any) {
            let oldDataProvider = this._treeDataProvider;
            this._dataProvider = value;
            let treeDataProvider = TreeUtil.getTree(this._dataProvider);
            if (this._keepStatus && oldDataProvider) {
                let expandList = [];
                TreeUtil.forEach(oldDataProvider, false, (data) => {
                    if (data.expand) {
                        expandList.push(data.data);
                    }
                });
                TreeUtil.forEach(treeDataProvider, false, (data) => {
                    if (expandList.indexOf(data.data) != -1) {
                        data.expand = true;
                    }
                });
            }
            this._treeDataProvider = treeDataProvider;
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        public get dataProvider(): any {
            return this._dataProvider;
        }

        /**
         * 当前选择的项目
         * * 设定之后会展开到当前选择的项目
         */
        public set selectedItem(value: any) {
            if (this._selectedItem == value) {
                return;
            }
            this._selectedItem = value;
            if (this._justOpenOne) {
                TreeUtil.forEach(this._treeDataProvider, false, (data) => {
                    data.expand = false;
                });
            }
            let treeData = TreeUtil.getTreeData(this._treeDataProvider, this._selectedItem);
            TreeUtil.expand(treeData);
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        public get selectedItem(): any {
            return this._selectedItem;
        }

        protected commitProperties(): void {
            super.commitProperties();
            if (this._itemChangedFlag) {
                this._itemChangedFlag = false;
                if (this._selectedRenderer) {
                    this._selectedRenderer.selected = false;
                    this._selectedRenderer = undefined;
                }
                let dataList: ITreeDataCollection[] = [];
                // 如果不显示顶级节点, 需要把顶级节点设置为开启状态
                if (!this._showRoot) {
                    this._treeDataProvider.expand = true;
                }
                TreeUtil.forEach(this._treeDataProvider, true, (data) => {
                    dataList.push(data);
                });
                if (!this._showRoot) {
                    dataList.shift();
                }
                let indexList: number[] = [];
                for (let i = 0; i < this._itemRenderers.length; i++) {
                    indexList.push(0);
                }
                let pool = this._itemPool;
                for (let item of dataList) {
                    let depth = item.depth;
                    if (!pool[depth]) {
                        pool[depth] = [];
                    }
                    let list = pool[depth];
                    let index = indexList[depth];
                    let renderer: IItemRenderer;
                    if (list[index]) {
                        renderer = list[index];
                        if (renderer.parent) {
                            this.setChildIndex(renderer, this.numChildren - 1);
                        }
                        else {
                            this.addChild(renderer);
                        }
                    }
                    else {
                        let itemClass = this._itemRenderers[depth];
                        renderer = new itemClass();
                        renderer.on(dou2d.TouchEvent.TOUCH_TAP, this.onTap, this);
                        list.push(renderer);
                        this.addChild(renderer);
                    }
                    renderer.data = item;
                    indexList[depth]++;
                    if (item.children) {
                        renderer.selected = item.expand;
                    }
                    else if (this._selectedItem === item.data) {
                        renderer.selected = true;
                        this._selectedRenderer = renderer;
                    }
                }
                for (let i = 0; i < pool.length; i++) {
                    let poolList = pool[i];
                    let poolIndex = indexList[i];
                    if (poolList && poolIndex < poolList.length) {
                        for (let j = poolIndex; j < poolList.length; j++) {
                            let item = poolList[j];
                            item.removeSelf();
                        }
                    }
                }
                this._sizeChangedFlag = true;
            }
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            if (this._sizeChangedFlag) {
                this._sizeChangedFlag = false;
                dou2d.callLater(() => {
                    if (this.scrollH + this.scrollRect.width > this.contentWidth) {
                        this.scrollH = Math.max(0, this.contentWidth - this.scrollRect.width);
                    }
                    if (this.scrollV + this.scrollRect.height > this.contentHeight) {
                        this.scrollV = Math.max(0, this.contentHeight - this.scrollRect.height);
                    }
                }, this);
            }
        }

        private onTap(event: dou2d.TouchEvent): void {
            let data = (<IItemRenderer>event.currentTarget).data as ITreeDataCollection;
            if (this.dispatchEvent(dou.Event.CHANGING, data, true)) {
                if (data.children) {
                    if (!data.expand) {
                        if (this._justOpenOne) {
                            TreeUtil.forEach(this._treeDataProvider, false, (data) => {
                                data.expand = false;
                            });
                            TreeUtil.expand(data);
                        }
                        else {
                            data.expand = true;
                        }
                    }
                    else if (this._allowClose) {
                        data.expand = false;
                    }
                    this._itemChangedFlag = true;
                    this.invalidateProperties();
                    // 没有选择项或者选中项不是当前项目的子项时, 需要重新设定选中项
                    if (!this._selectedItem || !this.checkIsSelected(data)) {
                        this.selectedItem = data.data;
                        this.dispatchEvent(dou.Event.CHANGE, data, true);
                    }
                }
                else {
                    if (this._selectedItem !== data.data) {
                        this.selectedItem = data.data;
                        this.dispatchEvent(dou.Event.CHANGE, data, true);
                    }
                }
            }
        }

        private checkIsSelected(data: ITreeDataCollection): boolean {
            let selectedItem = this._selectedItem;
            if (!selectedItem) {
                return false;
            }
            if (selectedItem === data.data) {
                return true;
            }
            let selected = TreeUtil.getTreeData(this._treeDataProvider, selectedItem);
            while (selected.parent) {
                selected = selected.parent;
                if (selected === data) {
                    return true;
                }
            }
            return false;
        }

        public getVirtualElementAt(index: number): dou2d.DisplayObject {
            let child = this.getElementAt(index);
            if (child) {
                child.visible = true;
                return child;
            }
            return undefined;
        }

        public setVirtualElementIndicesInView(startIndex: number, endIndex: number): void {
            for (let i = 0, len = this.numElements; i < len; i++) {
                let child = this.getElementAt(i);
                if (i < startIndex || i > endIndex) {
                    child.visible = false;
                }
            }
        }

        /**
         * 展开指定项目但并不选中该项目
         */
        public expandItem(item: any): void {
            let treeData = TreeUtil.getTreeData(this._treeDataProvider, item);
            TreeUtil.expand(treeData);
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }

        /**
         * 关闭指定项目如果该项目已经展开
         */
        public closeItem(item: any, closeChildren?: boolean): void {
            let treeData = TreeUtil.getTreeData(this._treeDataProvider, item);
            if (closeChildren) {
                TreeUtil.forEach(treeData, false, (data) => {
                    data.expand = false;
                });
            }
            else {
                treeData.expand = false;
            }
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }

        public updateRenderListByDepth(depth: number): void {
            let list = this._itemPool[depth];
            if (list) {
                for (let render of list) {
                    render.data = render.data;
                }
            }
        }
    }
}

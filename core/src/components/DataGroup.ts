namespace douUI {
    /**
     * 按渲染项排列显示多个数据的容器
     * @author wizardc
     */
    export class DataGroup extends Group {
        public $DataGroup: Object;

        protected _dataProviderChanged: boolean = false;
        protected _dataProvider: ICollection;

        protected _indexToRenderer: IItemRenderer[] = [];

        public constructor() {
            super();
            this.$DataGroup = {
                0: true,        // useVirtualLayout
                1: false,       // useVirtualLayoutChanged
                2: new Map(),   // rendererToClassMap
                3: new Map(),   // freeRenderers
                4: false,       // createNewRendererFlag
                5: false,       // itemRendererChanged
                6: null,        // itemRenderer
                7: false,       // typicalItemChanged
                8: null,        // typicalLayoutRect
                9: false,       // cleanFreeRenderer
                10: false,      // renderersBeingUpdated
                11: null        // typicalItem
            };
        }

        public set layout(value: LayoutBase) {
            if (value == this._layout) {
                return;
            }
            if (this._layout) {
                this._layout.setTypicalSize(0, 0);
                this._layout.off("useVirtualLayoutChanged", this.onUseVirtualLayoutChanged, this);
            }
            if (this._layout && value && (this._layout.useVirtualLayout != value.useVirtualLayout)) {
                this.onUseVirtualLayoutChanged();
            }
            dou.superSetter(DataGroup, this, "layout", value);
            if (value) {
                let rect = this.$DataGroup[sys.DataGroupKeys.typicalLayoutRect];
                if (rect) {
                    value.setTypicalSize(rect.width, rect.height);
                }
                value.useVirtualLayout = this.$DataGroup[sys.DataGroupKeys.useVirtualLayout];
                value.on("useVirtualLayoutChanged", this.onUseVirtualLayoutChanged, this);
            }
        }
        public get layout(): LayoutBase {
            return dou.superGetter(DataGroup, this, "layout");
        }

        private onUseVirtualLayoutChanged(event?: dou.Event): void {
            let values = this.$DataGroup;
            values[sys.DataGroupKeys.useVirtualLayoutChanged] = true;
            values[sys.DataGroupKeys.cleanFreeRenderer] = true;
            this.removeDataProviderListener();
            this.invalidateProperties();
        }

        public set useVirtualLayout(value: boolean) {
            value = !!value;
            let values = this.$DataGroup;
            if (value === values[sys.DataGroupKeys.useVirtualLayout]) {
                return;
            }
            values[sys.DataGroupKeys.useVirtualLayout] = value;
            if (this._layout) {
                this._layout.useVirtualLayout = value;
            }
        }
        public get useVirtualLayout(): boolean {
            return this._layout ? this._layout.useVirtualLayout : this.$DataGroup[sys.DataGroupKeys.useVirtualLayout];
        }

        /**
         * 项呈示器类
         */
        public set itemRenderer(value: any) {
            let values = this.$DataGroup;
            if (values[sys.DataGroupKeys.itemRenderer] == value) {
                return;
            }
            values[sys.DataGroupKeys.itemRenderer] = value;
            values[sys.DataGroupKeys.itemRendererChanged] = true;
            values[sys.DataGroupKeys.typicalItemChanged] = true;
            values[sys.DataGroupKeys.cleanFreeRenderer] = true;
            this.removeDataProviderListener();
            this.invalidateProperties();
        }
        public get itemRenderer(): any {
            return this.$DataGroup[sys.DataGroupKeys.itemRenderer];
        }

        /**
         * 数据源
         */
        public set dataProvider(value: ICollection) {
            if (this._dataProvider == value || (value && !value.getItemAt)) {
                return;
            }
            this.removeDataProviderListener();
            this._dataProvider = value;
            this._dataProviderChanged = true;
            this.$DataGroup[sys.DataGroupKeys.cleanFreeRenderer] = true;
            this.invalidateProperties();
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        public get dataProvider(): ICollection {
            return this._dataProvider;
        }

        public get numElements(): number {
            if (!this._dataProvider) {
                return 0;
            }
            return this._dataProvider.length;
        }

        public getElementAt(index: number): dou2d.DisplayObject {
            return this._indexToRenderer[index];
        }

        public getVirtualElementAt(index: number): dou2d.DisplayObject {
            index = +index | 0;
            if (index < 0 || index >= this._dataProvider.length) {
                return null;
            }
            let renderer = this._indexToRenderer[index];
            if (!renderer) {
                let item: any = this._dataProvider.getItemAt(index);
                renderer = this.createVirtualRenderer(item);
                this._indexToRenderer[index] = renderer;
                this.updateRenderer(renderer, index, item);
                let values = this.$DataGroup;
                if (values[sys.DataGroupKeys.createNewRendererFlag]) {
                    renderer.validateNow();
                    values[sys.DataGroupKeys.createNewRendererFlag] = false;
                    this.rendererAdded(renderer, index, item);
                }
            }
            return renderer;
        }

        public setVirtualElementIndicesInView(startIndex: number, endIndex: number): void {
            if (!this._layout || !this._layout.useVirtualLayout) {
                return;
            }
            let indexToRenderer = this._indexToRenderer;
            let keys = Object.keys(indexToRenderer);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let index = +keys[i];
                if (index < startIndex || index > endIndex) {
                    this.freeRendererByIndex(index);
                }
            }
        }

        private freeRendererByIndex(index: number): void {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                delete this._indexToRenderer[index];
                this.doFreeRenderer(renderer);
            }
        }

        private doFreeRenderer(renderer: IItemRenderer): void {
            let values = this.$DataGroup;
            let rendererClass = values[sys.DataGroupKeys.rendererToClassMap].get(renderer);
            if (!values[sys.DataGroupKeys.freeRenderers].has(rendererClass)) {
                values[sys.DataGroupKeys.freeRenderers].set(rendererClass, []);
            }
            values[sys.DataGroupKeys.freeRenderers].get(rendererClass).push(renderer);
            renderer.visible = false;
        }

        public invalidateSize(): void {
            if (!this.$DataGroup[sys.DataGroupKeys.createNewRendererFlag]) {
                super.invalidateSize();
            }
        }

        private createVirtualRenderer(item: any): IItemRenderer {
            let renderer: IItemRenderer;
            let rendererClass = this.itemToRendererClass(item);
            let values = this.$DataGroup;
            let freeRenderers = values[sys.DataGroupKeys.freeRenderers];
            if (freeRenderers.has(rendererClass) && freeRenderers.get(rendererClass).length > 0) {
                renderer = freeRenderers.get(rendererClass).pop();
                renderer.visible = true;
                this.invalidateDisplayList();
                return renderer;
            }
            values[sys.DataGroupKeys.createNewRendererFlag] = true;
            return this.createOneRenderer(rendererClass);
        }

        private createOneRenderer(rendererClass: any): IItemRenderer {
            let renderer = <IItemRenderer>(new rendererClass());
            let values = this.$DataGroup;
            values[sys.DataGroupKeys.rendererToClassMap].set(renderer, rendererClass);
            this.addChild(renderer);
            return renderer;
        }

        private removeDataProviderListener(): void {
            if (this._dataProvider) {
                this._dataProvider.off(CollectionEvent.COLLECTION_CHANGE, this.onCollectionChange, this);
            }
        }

        protected onCollectionChange(event: CollectionEvent): void {
            switch (event.kind) {
                case CollectionEventKind.add:
                    this.itemAddedHandler(event.items, event.location);
                    break;
                case CollectionEventKind.remove:
                    this.itemRemovedHandler(event.items, event.location);
                    break;
                case CollectionEventKind.update:
                case CollectionEventKind.replace:
                    this.itemUpdatedHandler(event.items[0], event.location);
                    break;
                case CollectionEventKind.reset:
                case CollectionEventKind.refresh: {
                    if (this._layout && this._layout.useVirtualLayout) {
                        let indexToRenderer = this._indexToRenderer;
                        let keys = Object.keys(indexToRenderer);
                        let length = keys.length;
                        for (let i = length - 1; i >= 0; i--) {
                            let index = +keys[i];
                            this.freeRendererByIndex(index);
                        }
                    }
                    this._dataProviderChanged = true;
                    this.invalidateProperties();
                    break;
                }
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }

        private itemAddedHandler(items: any[], index: number): void {
            let length = items.length;
            for (let i = 0; i < length; i++) {
                this.itemAdded(items[i], index + i);
            }
            this.resetRenderersIndices();
        }

        private itemRemovedHandler(items: any[], location: number): void {
            let length = items.length;
            for (let i = length - 1; i >= 0; i--) {
                this.itemRemoved(items[i], location + i);
            }
            this.resetRenderersIndices();
        }

        protected itemAdded(item: any, index: number): void {
            if (this._layout) {
                this._layout.elementAdded(index);
            }
            if (this._layout && this._layout.useVirtualLayout) {
                this._indexToRenderer.splice(index, 0, null);
                return;
            }
            let renderer = this.createVirtualRenderer(item);
            this._indexToRenderer.splice(index, 0, renderer);
            if (renderer) {
                this.updateRenderer(renderer, index, item);
                let values = this.$DataGroup;
                if (values[sys.DataGroupKeys.createNewRendererFlag]) {
                    values[sys.DataGroupKeys.createNewRendererFlag] = false;
                    this.rendererAdded(renderer, index, item);
                }
            }
        }

        protected itemRemoved(item: any, index: number): void {
            if (this._layout) {
                this._layout.elementRemoved(index);
            }
            let oldRenderer = this._indexToRenderer[index];
            if (this._indexToRenderer.length > index) {
                this._indexToRenderer.splice(index, 1);
            }
            if (oldRenderer) {
                if (this._layout && this._layout.useVirtualLayout) {
                    this.doFreeRenderer(oldRenderer);
                }
                else {
                    this.rendererRemoved(oldRenderer, index, item);
                    this.removeChild(oldRenderer);
                }
            }
        }

        private resetRenderersIndices(): void {
            let indexToRenderer = this._indexToRenderer;
            if (indexToRenderer.length == 0) {
                return;
            }
            if (this._layout && this._layout.useVirtualLayout) {
                let keys = Object.keys(indexToRenderer);
                let length = keys.length;
                for (let i = 0; i < length; i++) {
                    let index = +keys[i];
                    this.resetRendererItemIndex(index);
                }
            }
            else {
                let indexToRendererLength = indexToRenderer.length;
                for (let index = 0; index < indexToRendererLength; index++) {
                    this.resetRendererItemIndex(index);
                }
            }
        }

        private itemUpdatedHandler(item: any, location: number): void {
            // 防止无限循环
            if (this.$DataGroup[sys.DataGroupKeys.renderersBeingUpdated]) {
                return;
            }
            let renderer = this._indexToRenderer[location];
            if (renderer) {
                this.updateRenderer(renderer, location, item);
            }
        }

        private resetRendererItemIndex(index: number): void {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                renderer.itemIndex = index;
            }
        }

        private itemToRendererClass(item: any): any {
            let rendererClass: any;
            let values = this.$DataGroup;
            if (!rendererClass) {
                rendererClass = values[sys.DataGroupKeys.itemRenderer];
            }
            if (!rendererClass) {
                rendererClass = ItemRenderer;
            }
            return rendererClass;
        }

        protected createChildren(): void {
            if (!this._layout) {
                let layout = new VerticalLayout();
                layout.gap = 0;
                layout.horizontalAlign = JustifyAlign.contentJustify;
                this.layout = layout;
            }
            super.createChildren();
        }

        protected commitProperties(): void {
            let values = this.$DataGroup;
            if (values[sys.DataGroupKeys.itemRendererChanged] || this._dataProviderChanged || values[sys.DataGroupKeys.useVirtualLayoutChanged]) {
                this.removeAllRenderers();
                if (this._layout) {
                    this._layout.clearVirtualLayoutCache();
                }
                this.setTypicalLayoutRect(null);
                values[sys.DataGroupKeys.useVirtualLayoutChanged] = false;
                values[sys.DataGroupKeys.itemRendererChanged] = false;
                if (this._dataProvider) {
                    this._dataProvider.on(CollectionEvent.COLLECTION_CHANGE, this.onCollectionChange, this);
                }
                if (this._layout && this._layout.useVirtualLayout) {
                    this.invalidateSize();
                    this.invalidateDisplayList();
                }
                else {
                    this.createRenderers();
                }
                if (this._dataProviderChanged) {
                    this._dataProviderChanged = false;
                    this.scrollV = this.scrollH = 0;
                }
            }
            super.commitProperties();
            if (values[sys.DataGroupKeys.typicalItemChanged]) {
                values[sys.DataGroupKeys.typicalItemChanged] = false;
                if (this._dataProvider && this._dataProvider.length > 0) {
                    values[sys.DataGroupKeys.typicalItem] = this._dataProvider.getItemAt(0);
                    this.measureRendererSize();
                }
            }
        }

        protected measure(): void {
            if (this._layout && this._layout.useVirtualLayout) {
                this.ensureTypicalLayoutElement();
            }
            super.measure();
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            let useVirtualLayout = (this._layout && this._layout.useVirtualLayout);
            if (useVirtualLayout) {
                this.ensureTypicalLayoutElement();
            }
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let values = this.$DataGroup;
            if (useVirtualLayout) {
                // 检查索引 0 处的项测量大小是否发生改变, 若改变就重新计算 typicalLayoutRect
                let rect = values[sys.DataGroupKeys.typicalLayoutRect];
                if (rect) {
                    let renderer = this._indexToRenderer[0];
                    if (renderer) {
                        let bounds = dou.recyclable(dou2d.Rectangle);
                        renderer.getPreferredBounds(bounds);
                        if (bounds.width != rect.width || bounds.height != rect.height) {
                            values[sys.DataGroupKeys.typicalLayoutRect] = null;
                        }
                        bounds.recycle();
                    }
                }
            }
        }

        private ensureTypicalLayoutElement(): void {
            if (this.$DataGroup[sys.DataGroupKeys.typicalLayoutRect]) {
                return;
            }
            if (this._dataProvider && this._dataProvider.length > 0) {
                this.$DataGroup[sys.DataGroupKeys.typicalItem] = this._dataProvider.getItemAt(0);
                this.measureRendererSize();
            }
        }

        private measureRendererSize(): void {
            let values = this.$DataGroup;
            if (values[sys.DataGroupKeys.typicalItem] == undefined) {
                this.setTypicalLayoutRect(null);
                return;
            }
            let typicalRenderer = this.createVirtualRenderer(values[sys.DataGroupKeys.typicalItem]);
            if (!typicalRenderer) {
                this.setTypicalLayoutRect(null);
                return;
            }
            this.updateRenderer(typicalRenderer, 0, values[sys.DataGroupKeys.typicalItem]);
            typicalRenderer.validateNow();
            let bounds = dou.recyclable(dou2d.Rectangle);
            typicalRenderer.getPreferredBounds(bounds);
            let rect = new dou2d.Rectangle(0, 0, bounds.width, bounds.height);
            bounds.recycle();
            if (this._layout && this._layout.useVirtualLayout) {
                if (values[sys.DataGroupKeys.createNewRendererFlag]) {
                    this.rendererAdded(typicalRenderer, 0, values[sys.DataGroupKeys.typicalItem]);
                }
                this.doFreeRenderer(typicalRenderer);
            }
            else {
                this.removeChild(typicalRenderer);
            }
            this.setTypicalLayoutRect(rect);
            values[sys.DataGroupKeys.createNewRendererFlag] = false;
        }

        private setTypicalLayoutRect(rect: dou2d.Rectangle): void {
            this.$DataGroup[sys.DataGroupKeys.typicalLayoutRect] = rect;
            if (this._layout) {
                if (rect) {
                    this._layout.setTypicalSize(rect.width, rect.height);
                }
                else {
                    this._layout.setTypicalSize(0, 0);
                }
            }
        }

        private removeAllRenderers(): void {
            let indexToRenderer = this._indexToRenderer;
            let keys = Object.keys(indexToRenderer);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let index = keys[i];
                let renderer = indexToRenderer[index];
                if (renderer) {
                    this.rendererRemoved(renderer, renderer.itemIndex, renderer.data);
                    this.removeChild(renderer);
                }
            }
            this._indexToRenderer = [];
            let values = this.$DataGroup;
            if (values[sys.DataGroupKeys.cleanFreeRenderer]) {
                let freeRenderers = values[sys.DataGroupKeys.freeRenderers];
                let keys = freeRenderers.keys();
                let length = keys.length;
                for (let i = 0; i < length; i++) {
                    let key = keys[i];
                    let list: IItemRenderer[] = freeRenderers.get(key);
                    let length = list.length;
                    for (let i = 0; i < length; i++) {
                        let renderer = list[i];
                        this.rendererRemoved(renderer, renderer.itemIndex, renderer.data);
                        this.removeChild(renderer);
                    }
                }
                values[sys.DataGroupKeys.freeRenderers].clear();
                values[sys.DataGroupKeys.rendererToClassMap].clear();
                values[sys.DataGroupKeys.cleanFreeRenderer] = false;
            }
        }

        private createRenderers(): void {
            if (!this._dataProvider) {
                return;
            }
            let index = 0;
            let length = this._dataProvider.length;
            for (let i = 0; i < length; i++) {
                let item = this._dataProvider.getItemAt(i);
                let rendererClass = this.itemToRendererClass(item);
                let renderer: IItemRenderer = this.createOneRenderer(rendererClass);
                if (!renderer) {
                    continue;
                }
                this._indexToRenderer[index] = renderer;
                this.updateRenderer(renderer, index, item);
                this.rendererAdded(renderer, index, item);
                index++;
            }
        }

        public updateRenderer(renderer: IItemRenderer, itemIndex: number, data: any): IItemRenderer {
            let values = this.$DataGroup;
            values[sys.DataGroupKeys.renderersBeingUpdated] = true;
            renderer.itemIndex = itemIndex;
            if (renderer.parent == this) {
                this.setChildIndex(renderer, itemIndex);
            }
            renderer.data = data;
            values[sys.DataGroupKeys.renderersBeingUpdated] = false;
            return renderer;
        }

        protected rendererAdded(renderer: IItemRenderer, index: number, item: any): void {
        }

        protected rendererRemoved(renderer: IItemRenderer, index: number, item: any): void {
        }
    }
}

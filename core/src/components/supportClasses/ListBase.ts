namespace douUI {
    /**
     * 列表控件基类
     * @author wizardc
     */
    export class ListBase extends DataGroup {
        /**
         * 未选中任何项时的索引值
         */
        public static NO_SELECTION: number = -1;

        /**
         * 未设置缓存选中项的值
         */
        public static NO_PROPOSED_SELECTION: number = -2;

        public $ListBase: Object;

        public constructor() {
            super();
            this.$ListBase = {
                0: false,       // requireSelection
                1: false,       // requireSelectionChanged
                2: -2,          // proposedSelectedIndex
                3: -1,          // selectedIndex
                4: false,       // dispatchChangeAfterSelection
                5: undefined,   // pendingSelectedItem
                6: false,       // selectedIndexAdjusted
                7: null,        // touchDownItemRenderer
                8: false        // touchCancle
            };
        }

        /**
         * 是否必须存在选中的项
         */
        public set requireSelection(value: boolean) {
            value = !!value;
            let values = this.$ListBase;
            if (value === values[sys.ListBaseKeys.requireSelection]) {
                return;
            }
            values[sys.ListBaseKeys.requireSelection] = value;
            if (value) {
                values[sys.ListBaseKeys.requireSelectionChanged] = true;
                this.invalidateProperties();
            }
        }
        public get requireSelection(): boolean {
            return this.$ListBase[sys.ListBaseKeys.requireSelection];
        }

        /**
         * 选中项索引
         */
        public set selectedIndex(value: number) {
            value = +value | 0;
            this.setSelectedIndex(value, false);
        }
        public get selectedIndex(): number {
            return this.getSelectedIndex();
        }

        protected setSelectedIndex(value: number, dispatchChangeEvent?: boolean): void {
            if (value == this.selectedIndex) {
                return;
            }
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[sys.ListBaseKeys.dispatchChangeAfterSelection] = (values[sys.ListBaseKeys.dispatchChangeAfterSelection] || dispatchChangeEvent);
            }
            values[sys.ListBaseKeys.proposedSelectedIndex] = value;
            this.invalidateProperties();
        }

        protected getSelectedIndex(): number {
            let values = this.$ListBase;
            if (values[sys.ListBaseKeys.proposedSelectedIndex] != ListBase.NO_PROPOSED_SELECTION) {
                return values[sys.ListBaseKeys.proposedSelectedIndex];
            }
            return values[sys.ListBaseKeys.selectedIndex];
        }

        /**
         * 选中项数据
         */
        public set selectedItem(value: any) {
            this.setSelectedItem(value, false);
        }
        public get selectedItem(): any {
            return this.getSelectedItem();
        }

        protected setSelectedItem(value: any, dispatchChangeEvent: boolean = false): void {
            if (this.selectedItem === value) {
                return;
            }
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[sys.ListBaseKeys.dispatchChangeAfterSelection] = (values[sys.ListBaseKeys.dispatchChangeAfterSelection] || dispatchChangeEvent);
            }
            values[sys.ListBaseKeys.pendingSelectedItem] = value;
            this.invalidateProperties();
        }

        protected getSelectedItem(): any {
            let values = this.$ListBase;
            if (values[sys.ListBaseKeys.pendingSelectedItem] !== undefined) {
                return values[sys.ListBaseKeys.pendingSelectedItem];
            }
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex == ListBase.NO_SELECTION || this._dataProvider == null) {
                return undefined;
            }
            return this._dataProvider.length > selectedIndex ? this._dataProvider.getItemAt(selectedIndex) : undefined;
        }

        protected commitProperties(): void {
            let dataProviderChanged = this._dataProviderChanged;
            super.commitProperties();
            let values = this.$ListBase;
            let selectedIndex = this.getSelectedIndex();
            let dataProvider = this._dataProvider;
            if (dataProviderChanged) {
                if (selectedIndex >= 0 && dataProvider && selectedIndex < dataProvider.length) {
                    this.itemSelected(selectedIndex, true);
                }
                else if (this.requireSelection) {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = 0;
                }
                else {
                    this.setSelectedIndex(-1, false);
                }
            }
            if (values[sys.ListBaseKeys.requireSelectionChanged]) {
                values[sys.ListBaseKeys.requireSelectionChanged] = false;
                if (values[sys.ListBaseKeys.requireSelection] && selectedIndex == ListBase.NO_SELECTION && dataProvider && dataProvider.length > 0) {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = 0;
                }
            }
            if (values[sys.ListBaseKeys.pendingSelectedItem] !== undefined) {
                if (dataProvider) {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = dataProvider.getItemIndex(values[sys.ListBaseKeys.pendingSelectedItem]);
                }
                else {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = ListBase.NO_SELECTION;
                }
                values[sys.ListBaseKeys.pendingSelectedItem] = undefined;
            }
            let changedSelection = false;
            if (values[sys.ListBaseKeys.proposedSelectedIndex] != ListBase.NO_PROPOSED_SELECTION) {
                changedSelection = this.commitSelection();
            }
            if (values[sys.ListBaseKeys.selectedIndexAdjusted]) {
                values[sys.ListBaseKeys.selectedIndexAdjusted] = false;
                if (!changedSelection) {
                    this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                }
            }
        }

        public updateRenderer(renderer: IItemRenderer, itemIndex: number, data: any): IItemRenderer {
            this.itemSelected(itemIndex, this.isItemIndexSelected(itemIndex));
            return super.updateRenderer(renderer, itemIndex, data);
        }

        protected itemSelected(index: number, selected: boolean): void {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                renderer.selected = selected;
            }
        }

        protected isItemIndexSelected(index: number): boolean {
            return index == this.selectedIndex;
        }

        protected commitSelection(dispatchChangedEvents: boolean = true): boolean {
            let dataProvider = this._dataProvider;
            let values = this.$ListBase;
            let maxIndex = dataProvider ? dataProvider.length - 1 : -1;
            let oldSelectedIndex = values[sys.ListBaseKeys.selectedIndex];
            let tmpProposedIndex = values[sys.ListBaseKeys.proposedSelectedIndex];
            if (tmpProposedIndex < ListBase.NO_SELECTION) {
                tmpProposedIndex = ListBase.NO_SELECTION;
            }
            if (tmpProposedIndex > maxIndex) {
                tmpProposedIndex = maxIndex;
            }
            if (values[sys.ListBaseKeys.requireSelection] && tmpProposedIndex == ListBase.NO_SELECTION && dataProvider && dataProvider.length > 0) {
                values[sys.ListBaseKeys.proposedSelectedIndex] = ListBase.NO_PROPOSED_SELECTION;
                values[sys.ListBaseKeys.dispatchChangeAfterSelection] = false;
                return false;
            }
            if (values[sys.ListBaseKeys.dispatchChangeAfterSelection]) {
                let result = this.dispatchEvent(dou.Event.CHANGING, null, true);
                if (!result) {
                    this.itemSelected(values[sys.ListBaseKeys.proposedSelectedIndex], false);
                    values[sys.ListBaseKeys.proposedSelectedIndex] = ListBase.NO_PROPOSED_SELECTION;
                    values[sys.ListBaseKeys.dispatchChangeAfterSelection] = false;
                    return false;
                }
            }
            values[sys.ListBaseKeys.selectedIndex] = tmpProposedIndex;
            values[sys.ListBaseKeys.proposedSelectedIndex] = ListBase.NO_PROPOSED_SELECTION;
            if (oldSelectedIndex != ListBase.NO_SELECTION) {
                this.itemSelected(oldSelectedIndex, false);
            }
            if (values[sys.ListBaseKeys.selectedIndex] != ListBase.NO_SELECTION) {
                this.itemSelected(values[sys.ListBaseKeys.selectedIndex], true);
            }
            if (dispatchChangedEvents) {
                if (values[sys.ListBaseKeys.dispatchChangeAfterSelection]) {
                    this.dispatchEvent(dou.Event.CHANGE);
                    values[sys.ListBaseKeys.dispatchChangeAfterSelection] = false;
                }
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedItem");
            }
            return true;
        }

        protected adjustSelection(newIndex: number): void {
            let values = this.$ListBase;
            if (values[sys.ListBaseKeys.proposedSelectedIndex] != ListBase.NO_PROPOSED_SELECTION) {
                values[sys.ListBaseKeys.proposedSelectedIndex] = newIndex;
            }
            else {
                values[sys.ListBaseKeys.selectedIndex] = newIndex;
            }
            values[sys.ListBaseKeys.selectedIndexAdjusted] = true;
            this.invalidateProperties();
        }

        protected itemAdded(item: any, index: number): void {
            super.itemAdded(item, index);
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex == ListBase.NO_SELECTION) {
                if (this.$ListBase[sys.ListBaseKeys.requireSelection]) {
                    this.adjustSelection(index);
                }
            }
            else if (index <= selectedIndex) {
                this.adjustSelection(selectedIndex + 1);
            }
        }

        protected itemRemoved(item: any, index: number): void {
            super.itemRemoved(item, index);
            if (this.selectedIndex == ListBase.NO_SELECTION) {
                return;
            }
            let selectedIndex = this.getSelectedIndex();
            if (index == selectedIndex) {
                if (this.requireSelection && this._dataProvider && this._dataProvider.length > 0) {
                    if (index == 0) {
                        this.$ListBase[sys.ListBaseKeys.proposedSelectedIndex] = 0;
                        this.invalidateProperties();
                    }
                    else {
                        this.setSelectedIndex(0, false);
                    }
                }
                else {
                    this.adjustSelection(-1);
                }
            }
            else if (index < selectedIndex) {
                this.adjustSelection(selectedIndex - 1);
            }
        }

        protected onCollectionChange(event: CollectionEvent): void {
            super.onCollectionChange(event);
            if (event.kind == CollectionEventKind.reset) {
                if (this._dataProvider.length == 0) {
                    this.setSelectedIndex(ListBase.NO_SELECTION, false);
                }
            }
            else if (event.kind == CollectionEventKind.refresh) {
                this.dataProviderRefreshed();
            }
        }

        protected dataProviderRefreshed(): void {
            this.setSelectedIndex(ListBase.NO_SELECTION, false);
        }

        protected rendererAdded(renderer: IItemRenderer, index: number, item: any): void {
            renderer.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onRendererTouchBegin, this);
            renderer.on(dou2d.TouchEvent.TOUCH_END, this.onRendererTouchEnd, this);
            renderer.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onRendererTouchCancle, this);
        }

        protected rendererRemoved(renderer: IItemRenderer, index: number, item: any): void {
            renderer.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onRendererTouchBegin, this);
            renderer.off(dou2d.TouchEvent.TOUCH_END, this.onRendererTouchEnd, this);
            renderer.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onRendererTouchCancle, this);
        }

        protected onRendererTouchBegin(event: dou2d.TouchEvent): void {
            if (!this._stage) {
                return;
            }
            let values = this.$ListBase;
            if (event.$isDefaultPrevented()) {
                return;
            }
            values[sys.ListBaseKeys.touchCancle] = false;
            values[sys.ListBaseKeys.touchDownItemRenderer] = <IItemRenderer>(event.currentTarget);
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
        }

        protected onRendererTouchCancle(event: dou2d.TouchEvent): void {
            let values = this.$ListBase;
            values[sys.ListBaseKeys.touchDownItemRenderer] = null;
            values[sys.ListBaseKeys.touchCancle] = true;
            if (this._stage) {
                this._stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            }
        }

        protected onRendererTouchEnd(event: dou2d.TouchEvent): void {
            let values = this.$ListBase;
            let itemRenderer = <IItemRenderer>(event.currentTarget);
            let touchDownItemRenderer = values[sys.ListBaseKeys.touchDownItemRenderer];
            if (itemRenderer != touchDownItemRenderer) {
                return;
            }
            if (!values[sys.ListBaseKeys.touchCancle]) {
                this.setSelectedIndex(itemRenderer.itemIndex, true);
                this.dispatchEvent2D(dou2d.Event2D.ITEM_TAP, itemRenderer, true);
            }
            values[sys.ListBaseKeys.touchCancle] = false;
        }

        private onStageTouchEnd(event: dou2d.TouchEvent): void {
            let stage = <dou2d.Stage>event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.$ListBase[sys.ListBaseKeys.touchDownItemRenderer] = null;
        }
    }
}

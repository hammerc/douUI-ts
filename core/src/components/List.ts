namespace douUI {
    /**
     * 列表控件, 可以选择一个或多个项目
     * @author wizardc
     */
    export class List extends ListBase {
        private _allowMultipleSelection: boolean = false;
        private _selectedIndices: number[] = [];
        private _proposedSelectedIndices: number[];

        public set selectedIndex(value: number) {
            this.setSelectedIndex(value);
        }
        public get selectedIndex(): number {
            if (this._proposedSelectedIndices) {
                if (this._proposedSelectedIndices.length > 0) {
                    return this._proposedSelectedIndices[0];
                }
                return -1;
            }
            return this.getSelectedIndex();
        }

        /**
         * 是否允许同时选中多项
         */
        public set allowMultipleSelection(value: boolean) {
            this._allowMultipleSelection = value;
        }
        public get allowMultipleSelection(): boolean {
            return this._allowMultipleSelection;
        }

        /**
         * 选定数据项的列表
         */
        public set selectedItems(value: any[]) {
            let indices: number[] = [];
            if (value) {
                let count = value.length;
                for (let i = 0; i < count; i++) {
                    let index: number = this._dataProvider.getItemIndex(value[i]);
                    if (index != -1) {
                        indices.splice(0, 0, index);
                    }
                    if (index == -1) {
                        indices = [];
                        break;
                    }
                }
            }
            this.setSelectedIndices(indices, false);
        }
        public get selectedItems(): any[] {
            let result: any[] = [];
            let list = this.selectedIndices;
            if (list) {
                let count = list.length;
                for (let i = 0; i < count; i++) {
                    result[i] = this._dataProvider.getItemAt(list[i]);
                }
            }
            return result;
        }

        /**
         * 选定数据项的索引列表
         */
        public set selectedIndices(value: number[]) {
            this.setSelectedIndices(value, false);
        }
        public get selectedIndices(): number[] {
            if (this._proposedSelectedIndices) {
                return this._proposedSelectedIndices;
            }
            return this._selectedIndices;
        }

        protected setSelectedIndices(value: number[], dispatchChangeEvent?: boolean): void {
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[sys.ListBaseKeys.dispatchChangeAfterSelection] = (values[sys.ListBaseKeys.dispatchChangeAfterSelection] || dispatchChangeEvent);
            }
            if (value) {
                this._proposedSelectedIndices = value;
            }
            else {
                this._proposedSelectedIndices = [];
            }
            this.invalidateProperties();
        }

        protected commitProperties(): void {
            super.commitProperties();
            if (this._proposedSelectedIndices) {
                this.commitSelection();
            }
        }

        protected commitSelection(dispatchChangedEvents: boolean = true): boolean {
            let values = this.$ListBase;
            let oldSelectedIndex = values[sys.ListBaseKeys.selectedIndex];
            if (this._proposedSelectedIndices) {
                this._proposedSelectedIndices = this._proposedSelectedIndices.filter(this.isValidIndex, this);
                if (!this._allowMultipleSelection && this._proposedSelectedIndices.length > 0) {
                    let temp: number[] = [];
                    temp.push(this._proposedSelectedIndices[0]);
                    this._proposedSelectedIndices = temp;
                }
                if (this._proposedSelectedIndices.length > 0) {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = this._proposedSelectedIndices[0];
                }
                else {
                    values[sys.ListBaseKeys.proposedSelectedIndex] = -1;
                }
            }
            let retVal = super.commitSelection(false);
            if (!retVal) {
                this._proposedSelectedIndices = null;
                return false;
            }
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex > ListBase.NO_SELECTION) {
                if (this._proposedSelectedIndices) {
                    if (this._proposedSelectedIndices.indexOf(selectedIndex) == -1) {
                        this._proposedSelectedIndices.push(selectedIndex);
                    }
                }
                else {
                    this._proposedSelectedIndices = [selectedIndex];
                }
            }
            if (this._proposedSelectedIndices) {
                if (this._proposedSelectedIndices.indexOf(oldSelectedIndex) != -1) {
                    this.itemSelected(oldSelectedIndex, true);
                }
                this.commitMultipleSelection();
            }
            if (dispatchChangedEvents && retVal) {
                if (values[sys.ListBaseKeys.dispatchChangeAfterSelection]) {
                    this.dispatchEvent(dou.Event.CHANGE);
                    values[sys.ListBaseKeys.dispatchChangeAfterSelection] = false;
                }
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedItem");
            }
            return retVal;
        }

        private isValidIndex(item: number, index: number, v: number[]): boolean {
            return this._dataProvider && (item >= 0) && (item < this._dataProvider.length) && item % 1 == 0;
        }

        protected commitMultipleSelection(): void {
            let removedItems: number[] = [];
            let addedItems: number[] = [];
            let i: number;
            let count: number;
            let selectedIndices = this._selectedIndices;
            let proposedSelectedIndices = this._proposedSelectedIndices;
            if (selectedIndices.length > 0 && proposedSelectedIndices.length > 0) {
                count = proposedSelectedIndices.length;
                for (i = 0; i < count; i++) {
                    if (selectedIndices.indexOf(proposedSelectedIndices[i]) == -1) {
                        addedItems.push(proposedSelectedIndices[i]);
                    }
                }
                count = selectedIndices.length;
                for (i = 0; i < count; i++) {
                    if (proposedSelectedIndices.indexOf(selectedIndices[i]) == -1) {
                        removedItems.push(selectedIndices[i]);
                    }
                }
            }
            else if (selectedIndices.length > 0) {
                removedItems = selectedIndices;
            }
            else if (proposedSelectedIndices.length > 0) {
                addedItems = proposedSelectedIndices;
            }
            this._selectedIndices = proposedSelectedIndices;
            if (removedItems.length > 0) {
                count = removedItems.length;
                for (i = 0; i < count; i++) {
                    this.itemSelected(removedItems[i], false);
                }
            }
            if (addedItems.length > 0) {
                count = addedItems.length;
                for (i = 0; i < count; i++) {
                    this.itemSelected(addedItems[i], true);
                }
            }
            this._proposedSelectedIndices = null;
        }

        protected isItemIndexSelected(index: number): boolean {
            if (this._allowMultipleSelection) {
                return this._selectedIndices.indexOf(index) != -1;
            }
            return super.isItemIndexSelected(index);
        }

        protected dataProviderRefreshed(): void {
            if (this._allowMultipleSelection) {
                return;
            }
            super.dataProviderRefreshed();
        }

        private calculateSelectedIndices(index: number): number[] {
            let interval: number[] = [];
            let selectedIndices = this._selectedIndices;
            let length = selectedIndices.length;
            if (length > 0) {
                if (length == 1 && (selectedIndices[0] == index)) {
                    if (!this.$ListBase[sys.ListBaseKeys.requireSelection]) {
                        return interval;
                    }
                    interval.splice(0, 0, selectedIndices[0]);
                    return interval;
                }
                else {
                    let found = false;
                    for (let i = 0; i < length; i++) {
                        if (selectedIndices[i] == index) {
                            found = true;
                        }
                        else if (selectedIndices[i] != index) {
                            interval.splice(0, 0, selectedIndices[i]);
                        }
                    }
                    if (!found) {
                        interval.splice(0, 0, index);
                    }
                    return interval;
                }
            }
            else {
                interval.splice(0, 0, index);
                return interval;
            }
        }

        protected onRendererTouchEnd(event: dou2d.TouchEvent): void {
            if (this._allowMultipleSelection) {
                let itemRenderer = <IItemRenderer>(event.currentTarget);
                let touchDownItemRenderer = this.$ListBase[sys.ListBaseKeys.touchDownItemRenderer];
                if (itemRenderer != touchDownItemRenderer) {
                    return;
                }
                this.setSelectedIndices(this.calculateSelectedIndices(itemRenderer.itemIndex), true);
                this.dispatchEvent2D(dou2d.Event2D.ITEM_TAP, itemRenderer, true);
            }
            else {
                super.onRendererTouchEnd(event);
            }
        }
    }
}

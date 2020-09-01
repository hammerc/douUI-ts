namespace douUI {
    /**
     * 同一时间只显示一个子项的容器
     * @author wizardc
     */
    export class ViewStack extends Group implements ICollection {
        private _selectedChild: dou2d.DisplayObject;
        private _proposedSelectedIndex: number = ListBase.NO_PROPOSED_SELECTION;
        private _selectedIndex: number = -1;

        public get length(): number {
            return this.$children.length;
        }

        /**
         * 当前可见的子项
         */
        public set selectedChild(value: dou2d.DisplayObject) {
            let index = this.getChildIndex(value);
            if (index >= 0 && index < this.numChildren) {
                this.setSelectedIndex(index);
            }
        }
        public get selectedChild(): dou2d.DisplayObject {
            let index = this.selectedIndex;
            if (index >= 0 && index < this.numChildren) {
                return this.getChildAt(index);
            }
            return null;
        }

        /**
         * 当前选择的可见子项的索引
         */
        public set selectedIndex(value: number) {
            value = +value | 0;
            this.setSelectedIndex(value);
        }
        public get selectedIndex(): number {
            return this._proposedSelectedIndex != ListBase.NO_PROPOSED_SELECTION ? this._proposedSelectedIndex : this._selectedIndex;
        }

        /**
         * 设置选中项索引
         */
        private setSelectedIndex(value: number): void {
            if (value == this.selectedIndex) {
                return;
            }
            this._proposedSelectedIndex = value;
            this.invalidateProperties();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
        }

        public $childAdded(child: dou2d.DisplayObject, index: number): void {
            super.$childAdded(child, index);
            this.showOrHide(child, false);
            let selectedIndex = this.selectedIndex;
            if (selectedIndex == -1) {
                this.setSelectedIndex(index);
            }
            else if (index <= this.selectedIndex && this._stage) {
                this.setSelectedIndex(selectedIndex + 1);
            }
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.add, index, -1, [child, name]);
        }

        public $childRemoved(child: dou2d.DisplayObject, index: number): void {
            super.$childRemoved(child, index);
            this.showOrHide(child, true);
            let selectedIndex = this.selectedIndex;
            if (index == selectedIndex) {
                if (this.numChildren > 0) {
                    if (index == 0) {
                        this._proposedSelectedIndex = 0;
                        this.invalidateProperties();
                    }
                    else {
                        this.setSelectedIndex(0);
                    }
                }
                else {
                    this.setSelectedIndex(-1);
                }
            }
            else if (index < selectedIndex) {
                this.setSelectedIndex(selectedIndex - 1);
            }
            this.dispatchCollectionEvent(CollectionEvent.COLLECTION_CHANGE, CollectionEventKind.remove, index, -1, [child.name]);
        }

        protected commitProperties(): void {
            super.commitProperties();
            if (this._proposedSelectedIndex != ListBase.NO_PROPOSED_SELECTION) {
                this.commitSelection(this._proposedSelectedIndex);
                this._proposedSelectedIndex = ListBase.NO_PROPOSED_SELECTION;
            }
        }

        private commitSelection(newIndex: number): void {
            if (newIndex >= 0 && newIndex < this.numChildren) {
                this._selectedIndex = newIndex;
                if (this._selectedChild) {
                    this.showOrHide(this._selectedChild, false);
                }
                this._selectedChild = this.getElementAt(this._selectedIndex);
                this.showOrHide(this._selectedChild, true);
            }
            else {
                this._selectedChild = null;
                this._selectedIndex = -1;
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }

        private showOrHide(child: dou2d.DisplayObject, visible: boolean): void {
            if (sys.isIUIComponent(child)) {
                child.includeInLayout = visible;
            }
            child.visible = visible;
        }

        public getItemAt(index: number): any {
            let element = this.$children[index];
            return element ? element.name : "";
        }

        public getItemIndex(item: any): number {
            let list = this.$children;
            let length = list.length;
            for (let i = 0; i < length; i++) {
                if (list[i].name == item) {
                    return i;
                }
            }
            return -1;
        }
    }
}

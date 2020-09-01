namespace douUI {
    /**
     * 列表类组件的项呈示器
     * @author wizardc
     */
    export class ItemRenderer extends Component implements IItemRenderer {
        private _data: any;
        private _itemIndex: number = -1;
        private _selected: boolean = false;

        private _touchCaptured: boolean = false;

        public constructor() {
            super();
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }

        public set data(value: any) {
            this._data = value;
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "data");
            this.dataChanged();
        }
        public get data(): any {
            return this._data;
        }

        public set itemIndex(value: number) {
            this._itemIndex = value;
        }
        public get itemIndex(): number {
            return this._itemIndex;
        }

        public set selected(value: boolean) {
            if (this._selected == value) {
                return;
            }
            this._selected = value;
            this.invalidateState();
        }
        public get selected(): boolean {
            return this._selected;
        }

        protected dataChanged(): void {
        }

        protected onTouchBegin(event: dou2d.TouchEvent): void {
            if (!this.stage) {
                return;
            }
            this.stage.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            this.stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this._touchCaptured = true;
            this.invalidateState();
            event.updateAfterEvent();
        }

        protected onTouchCancle(event: dou2d.TouchEvent): void {
            this._touchCaptured = false;
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.invalidateState();
        }

        private onStageTouchEnd(event: dou2d.TouchEvent): void {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this._touchCaptured = false;
            this.invalidateState();
        }

        protected getCurrentState(): string {
            let state = "up";
            if (!this.enabled) {
                state = "disabled";
            }
            if (this._touchCaptured) {
                state = "down";
            }
            if (this._selected) {
                return state + "AndSelected";
            }
            return state;
        }
    }
}

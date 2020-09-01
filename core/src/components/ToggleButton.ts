namespace douUI {
    /**
     * 切换按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    export class ToggleButton extends Button {
        protected _selected: boolean = false;
        protected _autoSelected: boolean = true;

        /**
         * 当前是否处于选中状态
         */
        public set selected(value: boolean) {
            value = !!value;
            if (value === this._selected) {
                return;
            }
            this._selected = value;
            this.invalidateState();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selected");
        }
        public get selected(): boolean {
            return this._selected;
        }

        /**
         * 是否根据点击操作自动变换是否选中
         */
        public set autoSelected(value: boolean) {
            this._autoSelected = value;
        }
        public get autoSelected(): boolean {
            return this._autoSelected;
        }

        protected buttonReleased(): void {
            if (!this._autoSelected) {
                return;
            }
            this.selected = !this._selected;
            this.dispatchEvent(dou.Event.CHANGE);
        }

        protected getCurrentState(): string {
            let state = super.getCurrentState();
            if (!this._selected) {
                return state;
            }
            return state + "AndSelected";
        }
    }
}

namespace douUI {
    /**
     * 选项卡
     * @author wizardc
     */
    export class TabBar extends ListBase {
        private _indexBeingUpdated: boolean = false;

        public constructor() {
            super();
            this.requireSelection = true;
            this.useVirtualLayout = false;
        }

        public set dataProvider(value: ICollection) {
            let dp = this._dataProvider;
            if (dp && dp instanceof ViewStack) {
                dp.off(dou.Event.PROPERTY_CHANGE, this.onViewStackIndexChange, this);
                this.off(dou.Event.CHANGE, this.onIndexChanged, this);
            }
            if (value && value instanceof ViewStack) {
                value.on(dou.Event.PROPERTY_CHANGE, this.onViewStackIndexChange, this);
                this.on(dou.Event.CHANGE, this.onIndexChanged, this);
            }
            dou.superSetter(TabBar, this, "dataProvider", value);
        }
        public get dataProvider(): ICollection {
            return dou.superGetter(TabBar, this, "dataProvider");
        }

        protected createChildren(): void {
            if (!this._layout) {
                let layout = new HorizontalLayout();
                layout.gap = 0;
                layout.horizontalAlign = JustifyAlign.justify;
                layout.verticalAlign = JustifyAlign.contentJustify;
                this.layout = layout;
            }
            super.createChildren();
        }

        private onIndexChanged(event: dou.Event): void {
            this._indexBeingUpdated = true;
            (<ViewStack><any>(this._dataProvider)).selectedIndex = this.selectedIndex;
            this._indexBeingUpdated = false;
        }

        private onViewStackIndexChange(event: dou.Event): void {
            if (event.data == "selectedIndex" && !this._indexBeingUpdated) {
                this.setSelectedIndex((<ViewStack><any>(this._dataProvider)).selectedIndex, false);
            }
        }
    }
}

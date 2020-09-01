namespace douUI {
    let automaticRadioButtonGroups: { [key: string]: RadioButtonGroup } = {};

    /**
     * 单选按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    export class RadioButton extends ToggleButton {
        public $indexNumber: number = 0;
        public $radioButtonGroup: RadioButtonGroup;

        private _group: RadioButtonGroup;
        private _groupChanged: boolean = false;
        private _groupName: string;

        private _value: any;

        public constructor(groupName: string = "radioGroup") {
            super();
            this.groupName = groupName;
        }

        public set enabled(value: boolean) {
            dou.superSetter(RadioButton, this, "enabled", value);
            this.invalidateDisplayList();
        }
        public get enabled(): boolean {
            if (!this.$Component[sys.ComponentKeys.enabled]) {
                return false;
            }
            return !this.$radioButtonGroup || this.$radioButtonGroup.$enabled;
        }

        public set group(value: RadioButtonGroup) {
            if (this._group == value) {
                return;
            }
            if (this.$radioButtonGroup) {
                this.$radioButtonGroup.removeRadioButton(this, false);
            }
            this._group = value;
            this._groupName = value ? this.group.$name : "radioGroup";
            this._groupChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        public get group(): RadioButtonGroup {
            if (!this._group && this._groupName) {
                let group = automaticRadioButtonGroups[this._groupName];
                if (!group) {
                    group = new RadioButtonGroup();
                    group.$name = this._groupName;
                    automaticRadioButtonGroups[this._groupName] = group;
                }
                this._group = group;
            }
            return this._group;
        }

        public set groupName(value: string) {
            if (!value || value == "") {
                return;
            }
            this._groupName = value;
            if (this.$radioButtonGroup) {
                this.$radioButtonGroup.removeRadioButton(this, false);
            }
            this._group = null;
            this._groupChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        public get groupName(): string {
            return this._groupName;
        }

        /**
         * 当前组件的值
         */
        public set value(value: any) {
            if (this._value == value) {
                return;
            }
            this._value = value;
            if (this._selected && this.group) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
            }
        }
        public get value(): any {
            return this._value;
        }

        protected commitProperties(): void {
            if (this._groupChanged) {
                this.addToGroup();
                this._groupChanged = false;
            }
            super.commitProperties();
        }

        private addToGroup(): RadioButtonGroup {
            let group = this.group;
            if (group) {
                group.addRadioButton(this);
            }
            return group;
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            if (this.group) {
                if (this._selected) {
                    this._group.$setSelection(this, false);
                }
                else if (this.group.selection == this) {
                    this._group.$setSelection(null, false);
                }
            }
        }

        protected buttonReleased(): void {
            if (!this.enabled || this.selected) {
                return;
            }
            if (!this.$radioButtonGroup) {
                this.addToGroup();
            }
            super.buttonReleased();
            this.group.$setSelection(this, true);
        }
    }
}

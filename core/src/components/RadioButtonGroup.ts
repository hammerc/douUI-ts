namespace douUI {
    let groupCount: number = 0;

    /**
     * 单选按钮组
     * @author wizardc
     */
    export class RadioButtonGroup extends dou.EventDispatcher {
        public $name: string;
        public $enabled: boolean = true;

        private _radioButtons: RadioButton[];

        private _selectedValue: any;
        private _selection: RadioButton;

        public constructor(name?: string) {
            super();
            this.$name = name || "_radioButtonGroup" + groupCount++;
            this._radioButtons = [];
        }

        public set enabled(value: boolean) {
            value = !!value;
            if (this.$enabled === value) {
                return;
            }
            this.$enabled = value;
            let buttons = this._radioButtons;
            let length = buttons.length;
            for (let i = 0; i < length; i++) {
                buttons[i].invalidateState();
            }
        }
        public get enabled(): boolean {
            return this.$enabled;
        }

        public set selectedValue(value: any) {
            this._selectedValue = value;
            if (value == null) {
                this.$setSelection(null, false);
                return;
            }
            let n = this.numRadioButtons;
            for (let i = 0; i < n; i++) {
                let radioButton = this._radioButtons[i];
                if (radioButton.value == value) {
                    this.changeSelection(i, false);
                    this._selectedValue = null;
                    this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
                    break;
                }
            }
        }
        public get selectedValue(): any {
            if (this.selection) {
                return this.selection.value;
            }
            return null;
        }

        public set selection(value: RadioButton) {
            if (this._selection == value) {
                return;
            }
            this.$setSelection(value, false);
        }
        public get selection(): RadioButton {
            return this._selection;
        }

        public $setSelection(value: RadioButton, fireChange?: boolean): boolean {
            if (this._selection == value) {
                return false;
            }
            if (!value) {
                if (this._selection) {
                    this._selection.selected = false;
                    this._selection = null;
                    if (fireChange) {
                        this.dispatchEvent(dou.Event.CHANGE);
                    }
                }
            }
            else {
                let n = this.numRadioButtons;
                for (let i = 0; i < n; i++) {
                    if (value == this.getRadioButtonAt(i)) {
                        this.changeSelection(i, fireChange);
                        break;
                    }
                }
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
            return true;
        }

        public get numRadioButtons(): number {
            return this._radioButtons.length;
        }

        public getRadioButtonAt(index: number): RadioButton {
            return this._radioButtons[index];
        }

        private changeSelection(index: number, fireChange?: boolean): void {
            let rb = this.getRadioButtonAt(index);
            if (rb && rb != this._selection) {
                if (this._selection) {
                    this._selection.selected = false;
                }
                this._selection = rb;
                this._selection.selected = true;
                if (fireChange) {
                    this.dispatchEvent(dou.Event.CHANGE);
                }
            }
        }

        public addRadioButton(instance: RadioButton): void {
            instance.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.removedHandler, this);
            let buttons = this._radioButtons;
            buttons.push(instance);
            buttons.sort(this.breadthOrderCompare);
            let length = buttons.length;
            for (let i = 0; i < length; i++) {
                buttons[i].$indexNumber = i;
            }
            if (this._selectedValue) {
                this.selectedValue = this._selectedValue;
            }
            if (instance.selected == true) {
                this.selection = instance;
            }
            instance.$radioButtonGroup = this;
            instance.invalidateState();
        }

        private removedHandler(event: dou2d.Event2D): void {
            let rb = event.target as RadioButton;
            if (rb == event.currentTarget) {
                rb.off(dou2d.Event2D.REMOVED_FROM_STAGE, this.removedHandler, this);
                this.removeRadioButton(rb, true);
            }
        }

        private breadthOrderCompare(a: dou2d.DisplayObject, b: dou2d.DisplayObject): number {
            let aParent = a.parent;
            let bParent = b.parent;
            if (!aParent || !bParent) {
                return 0;
            }
            let aNestLevel = a.$nestLevel;
            let bNestLevel = b.$nestLevel;
            let aIndex = 0;
            let bIndex = 0;
            if (aParent == bParent) {
                aIndex = aParent.getChildIndex(a);
                bIndex = bParent.getChildIndex(b);
            }
            if (aNestLevel > bNestLevel || aIndex > bIndex) {
                return 1;
            }
            if (aNestLevel < bNestLevel || bIndex > aIndex) {
                return -1;
            }
            if (a == b) {
                return 0;
            }
            return this.breadthOrderCompare(aParent, bParent);
        }

        public removeRadioButton(instance: RadioButton, addListener?: boolean): void {
            if (instance) {
                let foundInstance = false;
                let buttons = this._radioButtons;
                let length = buttons.length;
                for (let i = 0; i < length; i++) {
                    let rb = buttons[i];
                    if (foundInstance) {
                        rb.$indexNumber = rb.$indexNumber - 1;
                    }
                    else if (rb == instance) {
                        if (addListener) {
                            instance.on(dou2d.Event2D.ADDED_TO_STAGE, this.addedHandler, this);
                        }
                        if (instance == this._selection) {
                            this._selection = null;
                        }
                        instance.$radioButtonGroup = null;
                        instance.invalidateState();
                        this._radioButtons.splice(i, 1);
                        foundInstance = true;
                        i--;
                        length--;
                    }
                }
            }
        }

        private addedHandler(event: dou2d.Event2D): void {
            let rb = event.target as RadioButton;
            if (rb == event.currentTarget) {
                rb.off(dou2d.Event2D.ADDED_TO_STAGE, this.addedHandler, this);
                this.addRadioButton(rb);
            }
        }
    }
}

namespace douUI {
    /**
     * 范围选取组件, 该组件包含一个值和这个值所允许的最大最小约束范围
     * @author wizardc
     */
    export abstract class Range extends Component {
        public $Range: Object;

        public constructor() {
            super();
            this.$Range = {
                0: 100,         // maximum
                1: false,       // maxChanged
                2: 0,           // minimum
                3: false,       // minChanged
                4: 0,           // value
                5: 0,           // changedValue
                6: false,       // valueChanged
                7: 1,           // snapInterval
                8: false,       // snapIntervalChanged
                9: false,       // explicitSnapInterval
            };
        }

        /**
         * 最大有效值
         */
        public set maximum(value: number) {
            value = +value || 0;
            let values = this.$Range;
            if (value === values[sys.RangeKeys.maximum]) {
                return;
            }
            values[sys.RangeKeys.maximum] = value;
            values[sys.RangeKeys.maxChanged] = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        public get maximum(): number {
            return this.$Range[sys.RangeKeys.maximum];
        }

        /**
         * 最小有效值
         */
        public set minimum(value: number) {
            value = +value || 0;
            let values = this.$Range;
            if (value === values[sys.RangeKeys.minimum]) {
                return;
            }
            values[sys.RangeKeys.minimum] = value;
            values[sys.RangeKeys.minChanged] = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        public get minimum(): number {
            return this.$Range[sys.RangeKeys.minimum];
        }

        /**
         * 此范围的当前值
         */
        public set value(newValue: number) {
            newValue = +newValue || 0;
            if (newValue === this.value) {
                return;
            }
            let values = this.$Range;
            values[sys.RangeKeys.changedValue] = newValue;
            values[sys.RangeKeys.valueChanged] = true;
            this.invalidateProperties();
        }
        public get value(): number {
            let values = this.$Range;
            return values[sys.RangeKeys.valueChanged] ? values[sys.RangeKeys.changedValue] : values[sys.RangeKeys.value];
        }

        /**
         * 步进值
         */
        public set snapInterval(value: number) {
            let values = this.$Range;
            values[sys.RangeKeys.explicitSnapInterval] = true;
            value = +value || 0;
            if (value === values[sys.RangeKeys.snapInterval]) {
                return;
            }
            if (isNaN(value)) {
                values[sys.RangeKeys.snapInterval] = 1;
                values[sys.RangeKeys.explicitSnapInterval] = false;
            }
            else {
                values[sys.RangeKeys.snapInterval] = value;
            }
            values[sys.RangeKeys.snapIntervalChanged] = true;
            this.invalidateProperties();
        }
        public get snapInterval(): number {
            return this.$Range[sys.RangeKeys.snapInterval];
        }

        protected commitProperties(): void {
            super.commitProperties();
            let values = this.$Range;
            if (values[sys.RangeKeys.minimum] > values[sys.RangeKeys.maximum]) {
                if (!values[sys.RangeKeys.maxChanged]) {
                    values[sys.RangeKeys.minimum] = values[sys.RangeKeys.maximum];
                }
                else {
                    values[sys.RangeKeys.maximum] = values[sys.RangeKeys.minimum];
                }
            }
            if (values[sys.RangeKeys.valueChanged] || values[sys.RangeKeys.maxChanged] || values[sys.RangeKeys.minChanged] || values[sys.RangeKeys.snapIntervalChanged]) {
                let currentValue = values[sys.RangeKeys.valueChanged] ? values[sys.RangeKeys.changedValue] : values[sys.RangeKeys.value];
                values[sys.RangeKeys.valueChanged] = false;
                values[sys.RangeKeys.maxChanged] = false;
                values[sys.RangeKeys.minChanged] = false;
                values[sys.RangeKeys.snapIntervalChanged] = false;
                this.setValue(this.nearestValidValue(currentValue, values[sys.RangeKeys.snapInterval]));
            }
        }

        protected setValue(value: number): void {
            let values = this.$Range;
            if (values[sys.RangeKeys.value] === value) {
                return;
            }
            if (values[sys.RangeKeys.maximum] > values[sys.RangeKeys.minimum]) {
                values[sys.RangeKeys.value] = Math.min(values[sys.RangeKeys.maximum], Math.max(values[sys.RangeKeys.minimum], value));
            }
            else {
                values[sys.RangeKeys.value] = value;
            }
            values[sys.RangeKeys.valueChanged] = false;
            this.invalidateDisplayList();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "value");
        }

        /**
         * 返回最接近的值
         */
        protected nearestValidValue(value: number, interval: number): number {
            let values = this.$Range;
            if (interval == 0) {
                return Math.max(values[sys.RangeKeys.minimum], Math.min(values[sys.RangeKeys.maximum], value));
            }
            let maxValue = values[sys.RangeKeys.maximum] - values[sys.RangeKeys.minimum];
            let scale = 1;
            value -= values[sys.RangeKeys.minimum];
            if (interval != Math.round(interval)) {
                let parts = ((1 + interval).toString()).split(".");
                scale = Math.pow(10, parts[1].length);
                maxValue *= scale;
                value = Math.round(value * scale);
                interval = Math.round(interval * scale);
            }
            let lower = Math.max(0, Math.floor(value / interval) * interval);
            let upper = Math.min(maxValue, Math.floor((value + interval) / interval) * interval);
            let validValue = ((value - lower) >= ((upper - lower) / 2)) ? upper : lower;
            return (validValue / scale) + values[sys.RangeKeys.minimum];
        }

        protected updateDisplayList(w: number, h: number): void {
            super.updateDisplayList(w, h);
            this.updateSkinDisplayList();
        }

        /**
         * 更新皮肤
         */
        protected updateSkinDisplayList(): void {
        }
    }
}

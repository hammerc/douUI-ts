namespace douUI {
    /**
     * 滑块基类
     * * 皮肤必须子项: "track", "thumb"
     * * 皮肤可选子项: "trackHighlight"
     * @author wizardc
     */
    export abstract class SliderBase extends Range {
        /**
         * 轨道显示对象
         */
        public track: Component;

        /**
         * 轨道高亮显示对象
         */
        public trackHighlight: dou2d.DisplayObject;

        /**
         * 滑块显示对象
         */
        public thumb: Component;

        public $SliderBase: Object;

        public constructor() {
            super();
            this.$SliderBase = {
                0: 0,        // clickOffsetX
                1: 0,        // clickOffsetY
                2: 0,        // moveStageX
                3: 0,        // moveStageY
                4: null,     // touchDownTarget
                5: 0,        // pendingValue
                6: 0,        // slideToValue
                7: true      // liveDragging
            };
            this.maximum = 10;
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }

        /**
         * 如果为 true, 则将在沿着轨道拖动滑块时就刷新滑块的值, 否则在释放时刷新
         */
        public set liveDragging(value: boolean) {
            this.$SliderBase[sys.SliderKeys.liveDragging] = !!value;
        }
        public get liveDragging(): boolean {
            return this.$SliderBase[sys.SliderKeys.liveDragging];
        }

        /**
         * 当前滑块的值
         */
        public set pendingValue(value: number) {
            value = +value || 0;
            let values = this.$SliderBase;
            if (value === values[sys.SliderKeys.pendingValue]) {
                return;
            }
            values[sys.SliderKeys.pendingValue] = value;
            this.invalidateDisplayList();
        }
        public get pendingValue(): number {
            return this.$SliderBase[sys.SliderKeys.pendingValue];
        }

        protected onSkinAdded(): void {
            this.thumb.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onThumbTouchBegin, this);
            this.track.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTrackTouchBegin, this);
            if (this.trackHighlight) {
                this.trackHighlight.touchEnabled = false;
                if (this.trackHighlight instanceof dou2d.DisplayObjectContainer) {
                    this.trackHighlight.touchChildren = false;
                }
            }
        }

        protected onSkinRemoved(): void {
            this.thumb.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onThumbTouchBegin, this);
            this.track.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onTrackTouchBegin, this);
        }

        private onTouchBegin(event: dou2d.TouchEvent): void {
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.stageTouchEndHandler, this);
            this.$SliderBase[sys.SliderKeys.touchDownTarget] = <dou2d.DisplayObject>(event.target);
        }

        private stageTouchEndHandler(event: dou2d.TouchEvent): void {
            let target = event.target as dou2d.DisplayObject;
            let values = this.$SliderBase;
            event.currentTarget.off(dou2d.TouchEvent.TOUCH_END, this.stageTouchEndHandler, this);
            if (values[sys.SliderKeys.touchDownTarget] != target && this.contains(<dou2d.DisplayObject>(target))) {
                this.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_TAP, event.stageX, event.stageY, event.touchPointID, false, true, true);
            }
            values[sys.SliderKeys.touchDownTarget] = null;
        }

        protected setValue(value: number): void {
            this.$SliderBase[sys.SliderKeys.pendingValue] = value;
            super.setValue(value);
        }

        /**
         * 将相对于轨道的 x, y 像素位置转换为介于最小值和最大值 (包括两者) 之间的一个值
         */
        protected pointToValue(x: number, y: number): number {
            return this.minimum;
        }

        protected onThumbTouchBegin(event: dou2d.TouchEvent): void {
            let values = this.$SliderBase;
            let stage = this._stage;
            stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.onStageTouchMove, this);
            stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            let point = dou.recyclable(dou2d.Point);
            let clickOffset = this.thumb.globalToLocal(event.stageX, event.stageY, point);
            values[sys.SliderKeys.clickOffsetX] = clickOffset.x;
            values[sys.SliderKeys.clickOffsetY] = clickOffset.y;
            point.recycle();
            this.dispatchUIEvent(UIEvent.CHANGE_START);
        }

        private onStageTouchMove(event: dou2d.TouchEvent): void {
            let values = this.$SliderBase;
            values[sys.SliderKeys.moveStageX] = event.stageX;
            values[sys.SliderKeys.moveStageY] = event.stageY;
            let track = this.track;
            if (!track) {
                return;
            }
            let point = dou.recyclable(dou2d.Point);
            let p = track.globalToLocal(values[sys.SliderKeys.moveStageX], values[sys.SliderKeys.moveStageY], point);
            let newValue = this.pointToValue(p.x - values[sys.SliderKeys.clickOffsetX], p.y - values[sys.SliderKeys.clickOffsetY]);
            point.recycle();
            newValue = this.nearestValidValue(newValue, this.snapInterval);
            this.updateWhenTouchMove(newValue);
            event.updateAfterEvent();
        }

        protected updateWhenTouchMove(newValue: number): void {
            if (newValue != this.$SliderBase[sys.SliderKeys.pendingValue]) {
                if (this.liveDragging) {
                    this.setValue(newValue);
                    this.dispatchEvent(dou.Event.CHANGE);
                }
                else {
                    this.pendingValue = newValue;
                }
            }
        }

        protected onStageTouchEnd(event: dou2d.TouchEvent): void {
            let stage = event.currentTarget as dou2d.Stage;
            stage.off(dou2d.TouchEvent.TOUCH_MOVE, this.onStageTouchMove, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.dispatchUIEvent(UIEvent.CHANGE_END);
            let values = this.$SliderBase;
            if (!this.liveDragging && this.value != values[sys.SliderKeys.pendingValue]) {
                this.setValue(values[sys.SliderKeys.pendingValue]);
                this.dispatchEvent(dou.Event.CHANGE);
            }
        }

        protected onTrackTouchBegin(event: dou2d.TouchEvent): void {
            let thumbW = this.thumb ? this.thumb.width : 0;
            let thumbH = this.thumb ? this.thumb.height : 0;
            let offsetX = event.stageX - (thumbW / 2);
            let offsetY = event.stageY - (thumbH / 2);
            let point = dou.recyclable(dou2d.Point);
            let p = this.track.globalToLocal(offsetX, offsetY, point);
            let rangeValues = this.$Range;
            let newValue = this.pointToValue(p.x, p.y);
            point.recycle();
            newValue = this.nearestValidValue(newValue, rangeValues[sys.RangeKeys.snapInterval]);
            let values = this.$SliderBase;
            if (newValue != values[sys.SliderKeys.pendingValue]) {
                this.setValue(newValue);
                this.dispatchEvent(dou.Event.CHANGE);
            }
        }
    }
}

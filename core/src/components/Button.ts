namespace douUI {
    /**
     * 按钮
     * * 拥有状态: "up", "down", "disabled"
     * @author wizardc
     */
    export class Button extends Component {
        private touchCaptured: boolean = false;

        public constructor() {
            super();
            this.touchChildren = false;
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }

        protected onTouchBegin(event: dou2d.TouchEvent): void {
            this._stage.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.touchCaptured = true;
            this.invalidateState();
            event.updateAfterEvent();
        }

        protected onTouchCancle(event: dou2d.TouchEvent): void {
            let stage = event.currentTarget as dou2d.Stage;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.touchCaptured = false;
            this.invalidateState();
        }

        private onStageTouchEnd(event: dou2d.TouchEvent): void {
            let stage = event.currentTarget as dou2d.Stage;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            if (this.contains(event.target as dou2d.DisplayObject)) {
                this.buttonReleased();
            }
            this.touchCaptured = false;
            this.invalidateState();
        }

        protected buttonReleased(): void {
        }

        protected getCurrentState(): string {
            if (!this.enabled) {
                return "disabled";
            }
            if (this.touchCaptured) {
                return "down";
            }
            return "up";
        }
    }
}

namespace douUI {
    /**
     * 可滚动组件
     * * 当 viewport 指向的组件大于自己的尺寸时会裁剪 viewport 组件并可进行拖拽
     * * 需要将 viewport 组件作为 Scroller 组件的子项添加到显示列表, 如果不是则在设定 viewport 属性是会自动作为子项添加
     * * 本组件的 touchChildren 属性会被内部逻辑使用, 请保留默认值不要再外部手动设置
     * * 皮肤必须子项: 无
     * * 皮肤可选子项: "horizontalScrollBar", "verticalScrollBar"
     * @author wizardc
     */
    export class Scroller extends Component {
        /**
         * 开始触发滚动的阈值, 当触摸点偏离初始触摸点的距离超过这个值时才会触发滚动
         */
        public static scrollThreshold: number = 5;

        /**
         * 水平滚动条
         */
        public horizontalScrollBar: HScrollBar;

        /**
         * 垂直滚动条
         */
        public verticalScrollBar: VScrollBar;

        public $Scroller: Object;

        private _bounces: boolean = true;

        private _downTarget: dou2d.DisplayObject;

        public constructor() {
            super();
            let touchScrollH = new sys.TouchScroll(this, this.horizontalUpdateHandler, this.horizontalEndHandler);
            let touchScrollV = new sys.TouchScroll(this, this.verticalUpdateHandler, this.verticalEndHanlder);
            this.$Scroller = {
                0: ScrollPolicy.auto,   // scrollPolicyV
                1: ScrollPolicy.auto,   // scrollPolicyH
                2: null,                // autoHideTimer
                3: 0,                   // touchStartX
                4: 0,                   // touchStartY
                5: false,               // touchMoved
                6: false,               // horizontalCanScroll
                7: false,               // verticalCanScroll
                8: touchScrollH,        // touchScrollH
                9: touchScrollV,        // touchScrollV
                10: null,               // viewport
                11: false               // viewprotRemovedEvent
            };
        }

        /**
         * 是否启用回弹
         */
        public set bounces(value: boolean) {
            this._bounces = !!value;
            let touchScrollH = this.$Scroller[sys.ScrollerKeys.touchScrollH];
            if (touchScrollH) {
                touchScrollH.bounces = this._bounces;
            }
            let touchScrollV = this.$Scroller[sys.ScrollerKeys.touchScrollV];
            if (touchScrollV) {
                touchScrollV.bounces = this._bounces;
            }
        }
        public get bounces(): boolean {
            return this._bounces;
        }

        /**
         * 调节滑动结束时滚出的速度, 等于 0 时没有滚动动画
         */
        public set throwSpeed(value: number) {
            value = +value;
            if (value < 0) {
                value = 0;
            }
            this.$Scroller[sys.ScrollerKeys.touchScrollH].scrollFactor = value;
            this.$Scroller[sys.ScrollerKeys.touchScrollV].scrollFactor = value;
        }
        public get throwSpeed(): number {
            return this.$Scroller[sys.ScrollerKeys.touchScrollH].scrollFactor;
        }

        /**
         * 垂直滑动条显示策略
         */
        public set scrollPolicyV(value: string) {
            let values = this.$Scroller;
            if (values[sys.ScrollerKeys.scrollPolicyV] == value) {
                return;
            }
            values[sys.ScrollerKeys.scrollPolicyV] = value;
            this.checkScrollPolicy();
        }
        public get scrollPolicyV(): string {
            return this.$Scroller[sys.ScrollerKeys.scrollPolicyV];
        }

        /**
         * 水平滑动条显示策略
         */
        public set scrollPolicyH(value: string) {
            let values = this.$Scroller;
            if (values[sys.ScrollerKeys.scrollPolicyH] == value) {
                return;
            }
            values[sys.ScrollerKeys.scrollPolicyH] = value;
            this.checkScrollPolicy();
        }
        public get scrollPolicyH(): string {
            return this.$Scroller[sys.ScrollerKeys.scrollPolicyH];
        }

        /**
         * 要滚动的视域组件
         */
        public set viewport(value: IViewport) {
            let values = this.$Scroller;
            if (value == values[sys.ScrollerKeys.viewport]) {
                return;
            }
            this.uninstallViewport();
            values[sys.ScrollerKeys.viewport] = value;
            values[sys.ScrollerKeys.viewprotRemovedEvent] = false;
            this.installViewport();
        }
        public get viewport(): IViewport {
            return this.$Scroller[sys.ScrollerKeys.viewport];
        }

        private uninstallViewport(): void {
            if (this.horizontalScrollBar) {
                this.horizontalScrollBar.viewport = null;
            }
            if (this.verticalScrollBar) {
                this.verticalScrollBar.viewport = null;
            }
            let viewport = this.viewport;
            if (viewport) {
                viewport.scrollEnabled = false;
                viewport.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onViewportTouchBegin, this);
                viewport.off(dou2d.Event2D.REMOVED, this.onViewPortRemove, this);
                if (this.$Scroller[sys.ScrollerKeys.viewprotRemovedEvent] == false) {
                    this.removeChild(viewport);
                }
            }
        }

        private installViewport(): void {
            let viewport = this.viewport;
            if (viewport) {
                this.addChildAt(viewport, 0);
                viewport.scrollEnabled = true;
                viewport.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onViewportTouchBegin, this);
                viewport.on(dou2d.Event2D.REMOVED, this.onViewPortRemove, this);
            }
            if (this.horizontalScrollBar) {
                this.horizontalScrollBar.viewport = viewport;
            }
            if (this.verticalScrollBar) {
                this.verticalScrollBar.viewport = viewport;
            }
        }

        private onViewportTouchBegin(event: dou2d.TouchEvent): void {
            if (!this._stage) {
                return;
            }
            let canScroll = this.checkScrollPolicy();
            if (!canScroll) {
                return;
            }
            this.onTouchBegin(event);
        }

        private onViewPortRemove(event: dou2d.Event2D): void {
            if (event.target == this.viewport) {
                this.$Scroller[sys.ScrollerKeys.viewprotRemovedEvent] = true;
                this.viewport = null;
            }
        }

        private checkScrollPolicy(): boolean {
            let values = this.$Scroller;
            let viewport: IViewport = values[sys.ScrollerKeys.viewport];
            if (!viewport) {
                return false;
            }
            let hCanScroll: boolean;
            let uiValues = viewport.$UIComponent;
            switch (values[sys.ScrollerKeys.scrollPolicyH]) {
                case ScrollPolicy.auto:
                    if (viewport.contentWidth > uiValues[sys.UIKeys.width] || viewport.scrollH !== 0) {
                        hCanScroll = true;
                    }
                    else {
                        hCanScroll = false;
                    }
                    break;
                case ScrollPolicy.on:
                    hCanScroll = true;
                    break;
                case ScrollPolicy.off:
                    hCanScroll = false;
                    break;
            }
            values[sys.ScrollerKeys.horizontalCanScroll] = hCanScroll;
            let vCanScroll: boolean;
            switch (values[sys.ScrollerKeys.scrollPolicyV]) {
                case ScrollPolicy.auto:
                    if (viewport.contentHeight > uiValues[sys.UIKeys.height] || viewport.scrollV !== 0) {
                        vCanScroll = true;
                    }
                    else {
                        vCanScroll = false;
                    }
                    break;
                case ScrollPolicy.on:
                    vCanScroll = true;
                    break;
                case ScrollPolicy.off:
                    vCanScroll = false;
                    break;
            }
            values[sys.ScrollerKeys.verticalCanScroll] = vCanScroll;
            return hCanScroll || vCanScroll;
        }

        private onTouchBegin(event: dou2d.TouchEvent): void {
            if (event.$isDefaultPrevented()) {
                return;
            }
            if (!this.checkScrollPolicy()) {
                return;
            }
            this._downTarget = event.target as dou2d.DisplayObject;
            let values = this.$Scroller;
            this.stopAnimation();
            values[sys.ScrollerKeys.touchStartX] = event.stageX;
            values[sys.ScrollerKeys.touchStartY] = event.stageY;
            if (values[sys.ScrollerKeys.horizontalCanScroll]) {
                values[sys.ScrollerKeys.touchScrollH].start(event.stageX);
            }
            if (values[sys.ScrollerKeys.verticalCanScroll]) {
                values[sys.ScrollerKeys.touchScrollV].start(event.stageY);
            }
            let stage = this._stage;
            this.on(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.on(dou2d.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            this.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
        }

        private onTouchMove(event: dou2d.TouchEvent): void {
            if (event.$isDefaultPrevented()) {
                return;
            }
            let values = this.$Scroller;
            if (!values[sys.ScrollerKeys.touchMoved]) {
                let outX: boolean;
                if (Math.abs(values[sys.ScrollerKeys.touchStartX] - event.stageX) < Scroller.scrollThreshold) {
                    outX = false;
                } else {
                    outX = true;
                }
                let outY: boolean;
                if (Math.abs(values[sys.ScrollerKeys.touchStartY] - event.stageY) < Scroller.scrollThreshold) {
                    outY = false;
                } else {
                    outY = true;
                }
                if (!outX && !outY) {
                    return;
                }
                if (!outY && outX && values[sys.ScrollerKeys.scrollPolicyH] == ScrollPolicy.off) {
                    return;
                }
                if (!outX && outY && values[sys.ScrollerKeys.scrollPolicyV] == ScrollPolicy.off) {
                    return;
                }
                // 标记开始滚动
                values[sys.ScrollerKeys.touchMoved] = true;
                this.touchChildren = false;
                this._downTarget.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_CANCEL, event.stageX, event.stageY, event.touchPointID, event.touchDown, true, true);
                let horizontalBar = this.horizontalScrollBar;
                let verticalBar = this.verticalScrollBar;
                if (horizontalBar && horizontalBar.autoVisibility && values[sys.ScrollerKeys.horizontalCanScroll]) {
                    horizontalBar.visible = true;
                }
                if (verticalBar && verticalBar.autoVisibility && values[sys.ScrollerKeys.verticalCanScroll]) {
                    verticalBar.visible = true;
                }
                if (values[sys.ScrollerKeys.autoHideTimer]) {
                    values[sys.ScrollerKeys.autoHideTimer].reset();
                }
                this.dispatchUIEvent(UIEvent.CHANGE_START);
                this._stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            }
            event.preventDefault();
            let viewport = values[sys.ScrollerKeys.viewport];
            let uiValues = viewport.$UIComponent;
            if (values[sys.ScrollerKeys.horizontalCanScroll]) {
                values[sys.ScrollerKeys.touchScrollH].update(event.stageX, viewport.contentWidth - uiValues[sys.UIKeys.width], viewport.scrollH);
            }
            if (values[sys.ScrollerKeys.verticalCanScroll]) {
                values[sys.ScrollerKeys.touchScrollV].update(event.stageY, viewport.contentHeight - uiValues[sys.UIKeys.height], viewport.scrollV);
            }
        }

        private onTouchCancel(event: dou2d.TouchEvent): void {
            if (!this.$Scroller[sys.ScrollerKeys.touchMoved]) {
                this.onRemoveListeners();
            }
        }

        private onTouchEnd(event: dou2d.TouchEvent): void {
            let values = this.$Scroller;
            values[sys.ScrollerKeys.touchMoved] = false;
            this.touchChildren = true;
            this.onRemoveListeners();
            let viewport: IViewport = values[sys.ScrollerKeys.viewport];
            let uiValues = viewport.$UIComponent;
            if (values[sys.ScrollerKeys.touchScrollH].isStarted) {
                values[sys.ScrollerKeys.touchScrollH].finish(viewport.scrollH, viewport.contentWidth - uiValues[sys.UIKeys.width]);
            }
            if (values[sys.ScrollerKeys.touchScrollV].isStarted) {
                values[sys.ScrollerKeys.touchScrollV].finish(viewport.scrollV, viewport.contentHeight - uiValues[sys.UIKeys.height]);
            }
        }

        private onRemoveListeners(): void {
            let stage = dou2d.sys.stage;
            this.off(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            stage.off(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            this.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.off(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
        }

        private horizontalUpdateHandler(scrollPos: number): void {
            const viewport = this.$Scroller[sys.ScrollerKeys.viewport];
            if (viewport) {
                viewport.scrollH = scrollPos;
            }
            this.dispatchEvent(dou.Event.CHANGE);
        }

        private verticalUpdateHandler(scrollPos: number): void {
            const viewport = this.$Scroller[sys.ScrollerKeys.viewport];
            if (viewport) {
                viewport.scrollV = scrollPos;
            }
            this.dispatchEvent(dou.Event.CHANGE);
        }

        private horizontalEndHandler(): void {
            if (!this.$Scroller[sys.ScrollerKeys.touchScrollV].isPlaying) {
                this.onChangeEnd();
            }
        }

        private verticalEndHanlder(): void {
            if (!this.$Scroller[sys.ScrollerKeys.touchScrollH].isPlaying) {
                this.onChangeEnd();
            }
        }

        private onChangeEnd(): void {
            let values = this.$Scroller;
            let horizontalBar = this.horizontalScrollBar;
            let verticalBar = this.verticalScrollBar;
            if (horizontalBar && horizontalBar.visible || verticalBar && verticalBar.visible) {
                if (!values[sys.ScrollerKeys.autoHideTimer]) {
                    values[sys.ScrollerKeys.autoHideTimer] = new dou2d.Timer(200, 1);
                    values[sys.ScrollerKeys.autoHideTimer].on(dou2d.TimerEvent.TIMER_COMPLETE, this.onAutoHideTimer, this);
                }
                values[sys.ScrollerKeys.autoHideTimer].reset();
                values[sys.ScrollerKeys.autoHideTimer].start();
            }
            this.dispatchUIEvent(UIEvent.CHANGE_END);
        }

        private onAutoHideTimer(event: dou2d.TimerEvent): void {
            let horizontalBar = this.horizontalScrollBar;
            let verticalBar = this.verticalScrollBar;
            if (horizontalBar && horizontalBar.autoVisibility) {
                horizontalBar.visible = false;
            }
            if (verticalBar && verticalBar.autoVisibility) {
                verticalBar.visible = false;
            }
        }

        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let viewport = this.viewport;
            if (viewport) {
                viewport.setLayoutBoundsSize(unscaledWidth, unscaledHeight);
                viewport.setLayoutBoundsPosition(0, 0);
            }
        }

        protected onSkinAdded(): void {
            this.horizontalScrollBar.touchChildren = false;
            this.horizontalScrollBar.touchEnabled = false;
            this.horizontalScrollBar.viewport = this.viewport;
            if (this.horizontalScrollBar.autoVisibility) {
                this.horizontalScrollBar.visible = false;
            }
            this.verticalScrollBar.touchChildren = false;
            this.verticalScrollBar.touchEnabled = false;
            this.verticalScrollBar.viewport = this.viewport;
            if (this.verticalScrollBar.autoVisibility) {
                this.verticalScrollBar.visible = false;
            }
        }

        /**
         * 停止滚动的动画
         */
        public stopAnimation(): void {
            let values = this.$Scroller;
            let scrollV = values[sys.ScrollerKeys.touchScrollV];
            let scrollH = values[sys.ScrollerKeys.touchScrollH];
            if (scrollV.isPlaying) {
                this.dispatchUIEvent(UIEvent.CHANGE_END);
            }
            else if (scrollH.isPlaying) {
                this.dispatchUIEvent(UIEvent.CHANGE_END);
            }
            scrollV.stop();
            scrollH.stop();
            let verticalBar = this.verticalScrollBar;
            let horizontalBar = this.horizontalScrollBar;
            if (verticalBar && verticalBar.autoVisibility) {
                verticalBar.visible = false;
            }
            if (horizontalBar && horizontalBar.autoVisibility) {
                horizontalBar.visible = false;
            }
        }
    }
}

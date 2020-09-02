namespace douUI.sys {
    /**
     * 拖拽后继续滚动的动画模拟类
     * @author wizardc
     */
    export class TouchScroll {
        /**
         * 滚动速度系数
         */
        public scrollFactor: number = 1;

        private _target: dou.IEventDispatcher;
        private _updateFunction: (scrollPos: number) => void;
        private _endFunction: () => void;

        private _velocity: number;
        private _previousVelocity: number[];

        private _currentPosition: number;
        private _previousPosition: number;

        private _currentScrollPos: number;
        private _maxScrollPos: number;

        private _offsetPoint: number;

        private _animation: sys.Animation;
        private _started: boolean = true;
        private _bounces: boolean = true;

        public constructor(target: dou.IEventDispatcher, updateFunction: (scrollPos: number) => void, endFunction?: () => void) {
            this._updateFunction = updateFunction;
            this._endFunction = endFunction;
            this._target = target;
            this._previousVelocity = [];
            this._animation = new sys.Animation(this.onScrollingUpdate, this.finishScrolling, this);
        }

        /**
         * 是否允许回弹
         */
        public set bounces(value: boolean) {
            this._bounces = value;
        }
        public get bounces(): boolean {
            return this._bounces;
        }

        public get isStarted(): boolean {
            return this._started;
        }

        public get isPlaying(): boolean {
            return this._animation.isPlaying;
        }

        private onScrollingUpdate(animation: Animation): void {
            this._currentScrollPos = animation.currentValue;
            this._updateFunction.call(this._target, animation.currentValue);
        }

        /**
         * 开始记录位移变化
         */
        public start(touchPoint: number): void {
            this._started = true;
            this._velocity = 0;
            this._previousVelocity.length = 0;
            this._previousPosition = this._currentPosition = touchPoint;
            this._offsetPoint = touchPoint;
            dou2d.sys.ticker.startTick(this.onTick, this);
        }

        private onTick(passedTime: number): boolean {
            let previousVelocity = this._previousVelocity;
            if (previousVelocity.length >= MAX_VELOCITY_COUNT) {
                previousVelocity.shift();
            }
            this._velocity = (this._currentPosition - this._previousPosition) / passedTime;
            previousVelocity.push(this._velocity);
            this._previousPosition = this._currentPosition;
            return true;
        }

        /**
         * 更新当前移动到的位置
         */
        public update(touchPoint: number, maxScrollValue: number, scrollValue: number): void {
            maxScrollValue = Math.max(maxScrollValue, 0);
            this._currentPosition = touchPoint;
            this._maxScrollPos = maxScrollValue;
            let disMove = this._offsetPoint - touchPoint;
            let scrollPos = disMove + scrollValue;
            this._offsetPoint = touchPoint;
            if (scrollPos < 0) {
                if (!this._bounces) {
                    scrollPos = 0;
                }
                else {
                    scrollPos -= disMove * 0.5;
                }
            }
            if (scrollPos > maxScrollValue) {
                if (!this._bounces) {
                    scrollPos = maxScrollValue;
                }
                else {
                    scrollPos -= disMove * 0.5;
                }
            }
            this._currentScrollPos = scrollPos;
            this._updateFunction.call(this._target, scrollPos);
        }

        /**
         * 停止记录位移变化, 并计算出目标值和继续缓动的时间
         */
        public finish(currentScrollPos: number, maxScrollPos: number): void {
            dou2d.sys.ticker.stopTick(this.onTick, this);
            this._started = false;
            let sum = this._velocity * CURRENT_VELOCITY_WEIGHT;
            let previousVelocityX = this._previousVelocity;
            let length = previousVelocityX.length;
            let totalWeight = CURRENT_VELOCITY_WEIGHT;
            for (let i = 0; i < length; i++) {
                let weight = VELOCITY_WEIGHTS[i];
                sum += previousVelocityX[0] * weight;
                totalWeight += weight;
            }
            let pixelsPerMS = sum / totalWeight;
            let absPixelsPerMS = Math.abs(pixelsPerMS);
            let duration = 0;
            let posTo = 0;
            if (absPixelsPerMS > MINIMUM_VELOCITY) {
                posTo = currentScrollPos + (pixelsPerMS - MINIMUM_VELOCITY) / FRICTION_LOG * 2 * this.scrollFactor;
                if (posTo < 0 || posTo > maxScrollPos) {
                    posTo = currentScrollPos;
                    while (Math.abs(pixelsPerMS) > MINIMUM_VELOCITY) {
                        posTo -= pixelsPerMS;
                        if (posTo < 0 || posTo > maxScrollPos) {
                            pixelsPerMS *= FRICTION * EXTRA_FRICTION;
                        }
                        else {
                            pixelsPerMS *= FRICTION;
                        }
                        duration++;
                    }
                }
                else {
                    duration = Math.log(MINIMUM_VELOCITY / absPixelsPerMS) / FRICTION_LOG;
                }
            }
            else {
                posTo = currentScrollPos;
            }
            if (duration > 0) {
                if (!this._bounces) {
                    if (posTo < 0) {
                        posTo = 0;
                    }
                    else if (posTo > maxScrollPos) {
                        posTo = maxScrollPos;
                    }
                }
                this.throwTo(posTo, duration);
            }
            else {
                this.finishScrolling();
            }
        }

        private finishScrolling(animation?: Animation): void {
            let hsp = this._currentScrollPos;
            let maxHsp = this._maxScrollPos;
            let hspTo = hsp;
            if (hsp < 0) {
                hspTo = 0;
            }
            if (hsp > maxHsp) {
                hspTo = maxHsp;
            }
            this.throwTo(hspTo, 300);
        }

        private throwTo(hspTo: number, duration: number = 500): void {
            let hsp = this._currentScrollPos;
            if (hsp == hspTo) {
                this._endFunction.call(this._target);
                return;
            }
            let animation = this._animation;
            animation.play(duration, hsp, hspTo, easeOut);
        }

        /**
         * 停止缓动
         */
        public stop(): void {
            this._started = false;
            this._animation.stop();
            dou2d.sys.ticker.stopTick(this.onTick, this);
        }
    }

    /**
     * 需要记录的历史速度的最大次数
     */
    const MAX_VELOCITY_COUNT: number = 4;

    /**
     * 记录的历史速度的权重列表
     */
    const VELOCITY_WEIGHTS: number[] = [1, 1.33, 1.66, 2];

    /**
     * 当前速度所占的权重
     */
    const CURRENT_VELOCITY_WEIGHT: number = 2.33;

    /**
     * 最小的改变速度，解决浮点数精度问题
     */
    const MINIMUM_VELOCITY: number = 0.02;

    /**
     * 当容器自动滚动时要应用的摩擦系数
     */
    const FRICTION: number = 0.998;

    /**
     * 当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数
     */
    const EXTRA_FRICTION: number = 0.95;

    /**
     * 摩擦系数的自然对数
     */
    const FRICTION_LOG: number = Math.log(FRICTION);

    /**
     * 缓动方法
     */
    function easeOut(ratio: number): number {
        let invRatio = ratio - 1.0;
        return invRatio * invRatio * invRatio + 1;
    }
}

namespace douUI.sys {
    /**
     * 缓动动画类
     * @author wizardc
     */
    export class Animation {
        private _updateFunction: (animation: Animation) => void;
        private _endFunction: (animation: Animation) => void;
        private _thisObject: any;

        private _easerFunction: (fraction: number) => number;

        private _isPlaying: boolean = false;
        private _runningTime: number;

        private _duration: number;

        private _from: number;
        private _to: number;
        private _currentValue: number;

        public constructor(updateFunction: (animation: Animation) => void, endFunction?: (animation: Animation) => void, thisObject?: any) {
            this._updateFunction = updateFunction;
            this._endFunction = endFunction;
            this._thisObject = thisObject;
        }

        /**
         * 当前是否正在播放动画
         */
        public get isPlaying(): boolean {
            return this._isPlaying;
        }

        /**
         * 当前的值
         */
        public get currentValue(): number {
            return this._currentValue;
        }

        /**
         * 开始播放动画
         */
        public play(duration: number, from: number, to: number, easerFunction: (fraction: number) => number = dou.Ease.sineInOut): void {
            this._duration = duration;
            this._from = from;
            this._to = to;
            this._easerFunction = easerFunction;
            this.stop();
            this.start();
        }

        private start(): void {
            this._isPlaying = false;
            this._currentValue = 0;
            this._runningTime = 0;
            this.update(0);
            dou2d.sys.ticker.startTick(this.update, this);
        }

        private update(passedTime: number): boolean {
            this._runningTime += passedTime;
            if (!this._isPlaying) {
                this._isPlaying = true;
            }
            let duration = this._duration;
            let fraction = duration == 0 ? 1 : Math.min(this._runningTime, duration) / duration;
            if (this._easerFunction) {
                fraction = this._easerFunction(fraction);
            }
            this._currentValue = this._from + (this._to - this._from) * fraction;
            if (this._updateFunction) {
                this._updateFunction.call(this._thisObject, this);
            }
            let isEnded = this._runningTime >= duration;
            if (isEnded) {
                this.stop();
            }
            if (isEnded && this._endFunction) {
                this._endFunction.call(this._thisObject, this);
            }
            return true;
        }

        /**
         * 停止播放动画
         */
        public stop(): void {
            this._isPlaying = false;
            this._runningTime = 0;
            dou2d.sys.ticker.stopTick(this.update, this);
        }
    }
}

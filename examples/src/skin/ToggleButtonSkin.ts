namespace skin {
    /**
     * 通用切换按钮皮肤
     * @author wizardc
     */
    export class ToggleButtonSkin extends Dou.SkinBase {
        private _bg1: Dou.Image;
        private _bg2: Dou.Image;

        private _handleSource: string = "handle_png";
        private _offSource: string = "off_png";
        private _onSource: string = "on_png";

        public constructor(target: Dou.Component) {
            super(target);
        }

        protected createSkin(): void {
            this._bg1 = new Dou.Image();
            this._bg2 = new Dou.Image();
            this._bg2.verticalCenter = 0;
        }

        protected apply(): void {
            let target = this._target;
            target.addChild(this._bg1);
            target.addChild(this._bg2);
        }

        protected unload(): void {
            let target = this._target;
            target.removeChild(this._bg1);
            target.removeChild(this._bg2);
        }

        public setState(state: string): void {
            switch (state) {
                case "up":
                case "down":
                case "disable":
                    this._bg1.source = this._offSource;
                    this._bg2.left = 5;
                    this._bg2.right = NaN;
                    break;
                case "upAndSelected":
                case "downAndSelected":
                case "disabledAndSelected":
                    this._bg1.source = this._onSource;
                    this._bg2.left = NaN;
                    this._bg2.right = 5;
                    break;
            }
            this._bg2.source = this._handleSource;
            if (state == "disable" || state == "disabledAndSelected") {
                this._target.filters = [FilterUtil.darkFilter];
            }
            else {
                this._target.filters = [];
            }
        }

        public bg(handleSource: string, offSource?: string, onSource?: string): void {
            if (handleSource) {
                this._handleSource = handleSource;
            }
            if (offSource) {
                this._offSource = offSource;
            }
            if (onSource) {
                this._onSource = onSource;
            }
            this._target.invalidateState();
        }
    }
}

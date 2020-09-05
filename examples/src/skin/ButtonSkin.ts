namespace skin {
    /**
     * 通用按钮皮肤
     */
    export class ButtonSkin extends Dou.SkinBase {
        private _bg: Dou.Image;
        private _label: Dou.Label;

        private _upSource: string = "button_up_png";
        private _downSource: string = "button_down_png";

        private _scale9Grid: Dou.Rectangle = new Dou.Rectangle(3, 3, 10, 10);

        private _btnLabel: string = "Button";

        public constructor(target: Dou.Component) {
            super(target, { minWidth: 60, minHeight: 20 });
        }

        protected createSkin(): void {
            let bg = this._bg = new Dou.Image();
            bg.percentWidth = 100;
            bg.percentHeight = 100;
            let label = this._label = new Dou.Label();
            label.top = label.bottom = label.left = label.right = 5;
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            label.textAlign = Dou.HorizontalAlign.center;
            label.verticalAlign = Dou.VerticalAlign.middle;
        }

        protected apply(): void {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._label);
        }

        protected unload(): void {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._label);
        }

        public setState(state: string): void {
            switch (state) {
                case "up":
                    this._bg.source = this._upSource;
                    break;
                case "down":
                    this._bg.source = this._downSource;
                    break;
                case "disable":
                    break;
            }
            this._bg.scale9Grid = this._scale9Grid;
            this._label.text = this._btnLabel;
            if (state == "disable") {
                this._target.filters = [];
            }
            else {
                this._target.filters = [];
            }
        }

        public bg(upSource: string, downSource?: string): void {
            if (upSource) {
                this._upSource = upSource;
            }
            if (downSource) {
                this._downSource = downSource;
            }
            this._target.invalidateState();
        }

        public scale9Grid(rect: Dou.Rectangle): void {
            this._scale9Grid = rect;
            this._target.invalidateState();
        }

        public label(text: string): void {
            this._btnLabel = text;
            this._target.invalidateState();
        }
    }
}

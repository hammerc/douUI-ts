namespace skin {
    /**
     * 通用复选框皮肤
     * @author wizardc
     */
    export class CheckBoxSkin extends Dou.SkinBase {
        private _group: Dou.Group;
        private _bg: Dou.Image;
        private _label: Dou.Label;

        private _unselectSource: string = "checkbox_unselect_png";
        private _upSource: string = "checkbox_select_up_png";
        private _downSource: string = "checkbox_select_down_png";
        private _disableSource: string = "checkbox_select_disabled_png";

        private _cbLabel: string = "CheckBox";

        public constructor(target: Dou.Component) {
            super(target, { minWidth: 60, minHeight: 20 });
        }

        protected createSkin(): void {
            let group = this._group = new Dou.Group();
            let layout = group.layout = new Dou.HorizontalLayout();
            layout.horizontalAlign = Dou.HorizontalAlign.left;
            layout.verticalAlign = Dou.VerticalAlign.middle;
            let bg = this._bg = new Dou.Image();
            group.addChild(bg);
            let label = this._label = new Dou.Label();
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            group.addChild(label);
        }

        protected apply(): void {
            let target = this._target;
            target.addChild(this._group);
        }

        protected unload(): void {
            let target = this._target;
            target.removeChild(this._group);
        }

        public setState(state: string): void {
            switch (state) {
                case "up":
                case "down":
                    this._bg.source = this._unselectSource;
                    this._bg.source = this._unselectSource;
                    break;
                case "disable":
                    this._bg.source = this._disableSource;
                    break;
                case "upAndSelected":
                    this._bg.source = this._upSource;
                    break;
                case "downAndSelected":
                    this._bg.source = this._downSource;
                    break;
                case "disabledAndSelected":
                    this._bg.source = this._disableSource;
                    break;
            }
            this._label.text = this._cbLabel;
        }

        public bg(unselectSource: string, upSource?: string, downSource?: string, disableSource?: string): void {
            this._unselectSource = unselectSource;
            this._upSource = upSource;
            this._downSource = downSource;
            this._disableSource = disableSource;
            this._target.invalidateState();
        }

        public label(text: string): void {
            this._cbLabel = text;
            this._target.invalidateState();
        }
    }
}

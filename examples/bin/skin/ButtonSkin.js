var skin;
(function (skin) {
    /**
     * 通用按钮皮肤
     */
    class ButtonSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { minWidth: 60, minHeight: 20 });
            this._upSource = "button_up_png";
            this._downSource = "button_down_png";
            this._scale9Grid = new Dou.Rectangle(3, 3, 10, 10);
            this._btnLabel = "Button";
        }
        createSkin() {
            let bg = this._bg = new Dou.Image();
            bg.percentWidth = 100;
            bg.percentHeight = 100;
            let label = this._label = new Dou.Label();
            label.top = label.bottom = label.left = label.right = 5;
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            label.textAlign = 1 /* center */;
            label.verticalAlign = 1 /* middle */;
        }
        apply() {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._label);
        }
        unload() {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._label);
        }
        setState(state) {
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
        bg(upSource, downSource) {
            if (upSource) {
                this._upSource = upSource;
            }
            if (downSource) {
                this._downSource = downSource;
            }
            this._target.invalidateState();
        }
        scale9Grid(rect) {
            this._scale9Grid = rect;
            this._target.invalidateState();
        }
        label(text) {
            this._btnLabel = text;
            this._target.invalidateState();
        }
    }
    skin.ButtonSkin = ButtonSkin;
})(skin || (skin = {}));

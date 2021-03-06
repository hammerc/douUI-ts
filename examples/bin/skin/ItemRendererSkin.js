var skin;
(function (skin) {
    /**
     * 通用的列表类组件的项呈示器皮肤
     * @author wizardc
     */
    class ItemRendererSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { width: 300, height: 80 });
        }
        createSkin() {
            let bg = this._bg = new Dou.Image();
            bg.percentWidth = bg.percentHeight = 100;
            bg.scale9Grid = new Dou.Rectangle(1, 3, 8, 8);
            let label = this._label = new Dou.Label();
            label.top = label.bottom = label.left = label.right = 5;
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            label.textAlign = 1 /* center */;
            label.verticalAlign = 1 /* middle */;
            this.bindToTarget("label", label);
        }
        apply() {
            let target = this._target;
            target.addChild(this._bg);
            target.addChild(this._label);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._bg);
            target.removeChild(this._label);
        }
        setState(state) {
            switch (state) {
                case "up":
                case "down":
                case "disable":
                    this._bg.source = "button_up_png";
                    break;
                case "upAndSelected":
                case "downAndSelected":
                case "disabledAndSelected":
                    this._bg.source = "button_down_png";
                    break;
            }
            if (state == "disable" || state == "disabledAndSelected") {
                this._target.filters = [skin.FilterUtil.darkFilter];
            }
            else {
                this._target.filters = [];
            }
        }
    }
    skin.ItemRendererSkin = ItemRendererSkin;
})(skin || (skin = {}));

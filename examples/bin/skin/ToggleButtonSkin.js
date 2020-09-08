var skin;
(function (skin) {
    /**
     * 通用切换按钮皮肤
     * @author wizardc
     */
    class ToggleButtonSkin extends Dou.SkinBase {
        constructor(target) {
            super(target);
            this._handleSource = "handle_png";
            this._offSource = "off_png";
            this._onSource = "on_png";
        }
        createSkin() {
            this._bg1 = new Dou.Image();
            this._bg2 = new Dou.Image();
            this._bg2.verticalCenter = 0;
        }
        apply() {
            let target = this._target;
            target.addChild(this._bg1);
            target.addChild(this._bg2);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._bg1);
            target.removeChild(this._bg2);
        }
        setState(state) {
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
                this._target.filters = [skin.FilterUtil.darkFilter];
            }
            else {
                this._target.filters = [];
            }
        }
        bg(handleSource, offSource, onSource) {
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
    skin.ToggleButtonSkin = ToggleButtonSkin;
})(skin || (skin = {}));

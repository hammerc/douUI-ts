var skin;
(function (skin) {
    /**
     * 通用单选框皮肤
     * @author wizardc
     */
    class RadioButtonSkin extends Dou.SkinBase {
        constructor(target) {
            super(target, { minWidth: 60, minHeight: 20 });
            this._unselectSource = "radiobutton_unselect_png";
            this._upSource = "radiobutton_select_up_png";
            this._downSource = "radiobutton_select_down_png";
            this._disableSource = "radiobutton_select_disabled_png";
            this._cbLabel = "RadioButton";
        }
        createSkin() {
            let group = this._group = new Dou.Group();
            let layout = group.layout = new Dou.HorizontalLayout();
            layout.horizontalAlign = 0 /* left */;
            layout.verticalAlign = 1 /* middle */;
            let bg = this._bg = new Dou.Image();
            group.addChild(bg);
            let label = this._label = new Dou.Label();
            label.fontFamily = "SimHei";
            label.size = 25;
            label.textColor = 0xffffff;
            group.addChild(label);
        }
        apply() {
            let target = this._target;
            target.addChild(this._group);
        }
        unload() {
            let target = this._target;
            target.removeChild(this._group);
        }
        setState(state) {
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
        bg(unselectSource, upSource, downSource, disableSource) {
            this._unselectSource = unselectSource;
            this._upSource = upSource;
            this._downSource = downSource;
            this._disableSource = disableSource;
            this._target.invalidateState();
        }
        label(text) {
            this._cbLabel = text;
            this._target.invalidateState();
        }
    }
    skin.RadioButtonSkin = RadioButtonSkin;
})(skin || (skin = {}));

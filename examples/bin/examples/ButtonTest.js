var examples;
(function (examples) {
    /**
     * 按钮示例
     * @author wizardc
     */
    class ButtonTest extends Dou.UILayer {
        constructor() {
            super();
            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }
        onAdded(event) {
            let button = new Dou.Button();
            button.setStyle("label", "开始游戏");
            this.addChild(button);
            button = new Dou.Button();
            button.right = 0;
            button.width = 200;
            button.height = 50;
            button.setStyle("label", "再续前缘");
            this.addChild(button);
            let group = new Dou.Group();
            group.layout = new Dou.VerticalLayout();
            group.x = 200;
            group.y = 200;
            this.addChild(group);
            let checkBox = new Dou.CheckBox();
            checkBox.setStyle("label", "选项一");
            group.addChild(checkBox);
            checkBox = new Dou.CheckBox();
            checkBox.setStyle("label", "选项二");
            group.addChild(checkBox);
            checkBox = new Dou.CheckBox();
            checkBox.setStyle("label", "选项三");
            group.addChild(checkBox);
            group = new Dou.Group();
            group.layout = new Dou.VerticalLayout();
            group.x = 400;
            group.y = 200;
            this.addChild(group);
            let radioButton = new Dou.RadioButton();
            radioButton.setStyle("label", "选项一");
            group.addChild(radioButton);
            radioButton = new Dou.RadioButton();
            radioButton.setStyle("label", "选项二");
            group.addChild(radioButton);
            radioButton = new Dou.RadioButton();
            radioButton.setStyle("label", "选项三");
            group.addChild(radioButton);
            let toggleButton = new Dou.ToggleButton();
            toggleButton.horizontalCenter = 0;
            this.addChild(toggleButton);
            let progress = new Dou.ProgressBar();
            progress.bottom = 0;
            progress.value = 50;
            this.addChild(progress);
            let hSlider = new Dou.HSlider();
            hSlider.horizontalCenter = 0;
            hSlider.bottom = 0;
            this.addChild(hSlider);
            let vSlider = new Dou.VSlider();
            vSlider.right = 0;
            vSlider.bottom = 0;
            this.addChild(vSlider);
        }
    }
    examples.ButtonTest = ButtonTest;
})(examples || (examples = {}));

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
            button.top = 0;
            button.right = 0;
            button.width = 200;
            button.height = 50;
            button.setStyle("label", "再续前缘");
            this.addChild(button);
        }
    }
    examples.ButtonTest = ButtonTest;
})(examples || (examples = {}));

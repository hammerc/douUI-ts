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
            button.setStyle("label", "开始游戏111111");
            this.addChild(button);
        }
    }
    examples.ButtonTest = ButtonTest;
})(examples || (examples = {}));

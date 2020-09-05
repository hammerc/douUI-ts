namespace examples {
    /**
     * 按钮示例
     * @author wizardc
     */
    export class ButtonTest extends Dou.UILayer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: Dou.Event2D): void {
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
}

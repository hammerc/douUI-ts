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
            button.setStyle("label", "开始游戏111111");
            this.addChild(button);
        }
    }
}

namespace douUI {
    /**
     * 当舞台尺寸发生改变时会跟随舞台尺寸改变的容器, 通常都将它作为 UI 显示列表的根节点
     * @author wizardc
     */
    export class UILayer extends Group {
        public constructor() {
            super();
            this.on(dou2d.Event2D.ADDED_TO_STAGE, this.onAddToStage, this);
            this.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);
        }

        private onAddToStage(event?: dou2d.Event2D): void {
            this._stage.on(dou2d.Event2D.RESIZE, this.onResize, this);
            this.onResize();
        }

        private onRemoveFromStage(event: dou2d.Event2D): void {
            this._stage.off(dou2d.Event2D.RESIZE, this.onResize, this);
        }

        private onResize(event?: dou2d.Event2D): void {
            let stage = this._stage;
            this.$setWidth(stage.stageWidth);
            this.$setHeight(stage.stageHeight);
        }
    }
}

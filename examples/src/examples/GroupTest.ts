namespace examples {
    /**
     * 容器示例
     * @author wizardc
     */
    export class GroupTest extends Dou.UILayer {
        public constructor() {
            super();

            this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
        }

        private onAdded(event: Dou.Event2D): void {
            let data = new Dou.ArrayCollection();
            data.source = [
                { label: "数据1" },
                { label: "数据2" },
                { label: "数据3" },
                { label: "数据4" },
                { label: "数据5" },
                { label: "数据6" },
                { label: "数据7" },
                { label: "数据8" },
                { label: "数据9" },
            ];

            let list = new Dou.List();
            list.itemRenderer = item.SimpleItem;
            list.dataProvider = data;

            let scroller = new Dou.Scroller();
            scroller.x = scroller.y = 200;
            scroller.width = 200;
            scroller.height = 500;
            scroller.viewport = list;
            this.addChild(scroller);
        }
    }
}

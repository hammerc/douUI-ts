namespace item {
    /**
     * 测试列表项
     * @author wizardc
     */
    export class SimpleItem extends Dou.ItemRenderer {
        public label: Dou.Label;

        protected dataChanged(): void {
            let data = this.data as { label: string };

            this.label.text = data.label;
        }
    }
}

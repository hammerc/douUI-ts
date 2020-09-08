var item;
(function (item) {
    /**
     * 测试列表项
     * @author wizardc
     */
    class SimpleItem extends Dou.ItemRenderer {
        dataChanged() {
            let data = this.data;
            this.label.text = data.label;
        }
    }
    item.SimpleItem = SimpleItem;
})(item || (item = {}));

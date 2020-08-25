namespace douUI {
    /**
     * 支持视区的组件接口
	 * * 如果组件的内容子项比组件要大, 而且您向往子项可以在父级组件的边缘处被裁减, 您可以定义一个视区
	 * * 视区是您希望显示的组件的区域的矩形子集, 而不是显示整个组件
     * @author wizardc
     */
    export interface IViewport extends sys.IUIComponent {
        /**
         * 视域的内容的宽度
         */
        contentWidth: number;

        /**
         * 视域的内容的高度
         */
        contentHeight: number;

        /**
         * 可视区域水平方向起始点
         */
        scrollH: number;

        /**
         * 可视区域竖直方向起始点
         */
        scrollV: number;

        /**
         * 是否启用容器滚动
         */
        scrollEnabled: boolean;
    }
}

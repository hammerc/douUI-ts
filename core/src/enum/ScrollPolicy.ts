namespace douUI {
	/**
	 * 滚动条显示策略枚举
     * @author wizardc
	 */
    export const enum ScrollPolicy {
		/**
		 * 如果子项超出父级的尺寸, 则允许滚动反之不允许滚动
		 */
        auto,
		/**
		 * 从不允许滚动
		 */
        off,
		/**
		 * 总是允许滚动
		 */
        on
    }
}

namespace douUI {
    /**
     * RowAlign 类为 TileLayout 类的 <code>rowAlign</code> 属性定义可能的值
     * @author wizardc
     */
    export const enum RowAlign {
        /**
         * 不进行两端对齐
         */
        top,
        /**
         * 通过增大垂直间隙将行两端对齐
         */
        justifyUsingGap,
        /**
         * 通过增大行高度将行两端对齐
         */
        justifyUsingHeight
    }
}

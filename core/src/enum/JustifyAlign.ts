namespace douUI {
    /**
     * 两端对齐枚举
     * @author wizardc
     */
    export const enum JustifyAlign {
        /**
         * 相对于容器对齐子代, 这会将所有子代的大小统一调整为与容器相同的尺寸
         */
        justify = 10,
        /**
         * 相对于容器对子代进行内容对齐, 这会将所有子代的大小统一调整为容器的内容宽度/高度
         * * 容器的内容宽度/高度是最大子代的大小, 如果所有子代都小于容器的宽度/高度, 则会将所有子代的大小调整为容器的宽度/高度
         */
        contentJustify
    }
}

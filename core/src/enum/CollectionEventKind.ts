namespace douUI {
    /**
     * 集合更改具体类型
     * @author wizardc
     */
    export const enum CollectionEventKind {
        /**
         * 集合添加了一个或多个项目
         */
        ADD,
        /**
         * 集合应用了排序或筛选
         */
        REFRESH,
        /**
         * 集合删除了一个或多个项目
         */
        REMOVE,
        /**
         * 已替换确定的位置处的项目
         */
        REPLACE,
        /**
         * 集合已彻底更改需要进行重置
         */
        RESET,
        /**
         * 集合中一个或多个项目进行了更新
         */
        UPDATE
    }
}

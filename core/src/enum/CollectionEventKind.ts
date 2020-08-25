namespace douUI {
    /**
     * 集合更改具体类型
     * @author wizardc
     */
    export const enum CollectionEventKind {
        /**
         * 集合添加了一个或多个项目
         */
        add,
        /**
         * 集合应用了排序或筛选
         */
        refresh,
        /**
         * 集合删除了一个或多个项目
         */
        remove,
        /**
         * 已替换确定的位置处的项目
         */
        replace,
        /**
         * 集合已彻底更改需要进行重置
         */
        reset,
        /**
         * 集合中一个或多个项目进行了更新
         */
        update
    }
}

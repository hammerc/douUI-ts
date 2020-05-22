namespace douUI {
    /**
     * 集合类数据源接口
     * @author wizardc
     */
    export interface ICollection extends dou.IEventDispatcher {
        /**
         * 此集合中的项目数
         */
        length: number;

        /**
         * 获取指定索引处的项目
         */
        getItemAt(index: number): any;

        /**
         * 如果项目位于列表中, 返回该项目的索引, 否则返回 -1
         */
        getItemIndex(item: any): number;
    }
}

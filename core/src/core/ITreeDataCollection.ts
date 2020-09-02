namespace douUI {
    /**
     * 树组件数据源接口
     * @author wizardc
     */
    export interface ITreeDataCollection {
        /**
         * 深度, 顶级节点为 0
         */
        readonly depth: number;

        /**
         * 原始数据
         */
        readonly data: any;

        /**
         * 父节点
         */
        readonly parent: ITreeDataCollection;

        /**
         * 是否展开
         */
        expand: boolean;

        /**
         * 子项数据
         */
        children?: ITreeDataCollection[];
    }
}

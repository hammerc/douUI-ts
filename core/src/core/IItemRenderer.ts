namespace douUI {
    /**
     * 列表类组件的项呈示器接口
     * @author wizardc
     */
    export interface IItemRenderer extends Component {
        /**
         * 要呈示或编辑的数据
         */
        data: any;

        /**
         * 如果项呈示器可以将其自身显示为已选中, 则为 true
         */
        selected: boolean;

        /**
         * 项呈示器的数据提供程序中的项目索引
         */
        itemIndex: number;
    }
}

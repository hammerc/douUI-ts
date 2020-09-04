namespace douUI {
    /**
     * 皮肤接口
     * @author wizardc
     */
    export interface ISkin {
        readonly width: number;
        readonly minWidth: number;
        readonly maxWidth: number;

        readonly height: number;
        readonly minHeight: number;
        readonly maxHeight: number;

        /**
         * 创建皮肤子项
         */
        onCreateSkin(): void;

        /**
         * 应用当前皮肤
         */
        onApply(): void;

        /**
         * 卸载当前皮肤
         */
        onUnload(): void;

        /**
         * 设定当前皮肤的状态
         */
        setState(state: string): void;
    }
}

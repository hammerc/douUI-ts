namespace skin {
    /**
     * 滤镜工具类
     * @author wizardc
     */
    export namespace FilterUtil {
        /**
         * 暗色矩阵滤镜
         */
        export const darkFilter: Dou.ColorMatrixFilter = new Dou.ColorMatrixFilter([
            1, 0, 0, 0, -100,
            0, 1, 0, 0, -100,
            0, 0, 1, 0, -100,
            0, 0, 0, 1, 0
        ]);
    }
}

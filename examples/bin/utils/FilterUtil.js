var skin;
(function (skin) {
    /**
     * 滤镜工具类
     * @author wizardc
     */
    let FilterUtil;
    (function (FilterUtil) {
        /**
         * 暗色矩阵滤镜
         */
        FilterUtil.darkFilter = new Dou.ColorMatrixFilter([
            1, 0, 0, 0, -100,
            0, 1, 0, 0, -100,
            0, 0, 1, 0, -100,
            0, 0, 0, 1, 0
        ]);
    })(FilterUtil = skin.FilterUtil || (skin.FilterUtil = {}));
})(skin || (skin = {}));

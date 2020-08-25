namespace douUI.sys {
    /**
     * 组件接口
     * @author wizardc
     */
    export interface IUIComponent extends dou2d.DisplayObject {
        /**
         * 接口类型
         */
        __interface_type__: "douUI.sys.IUIComponent";

        /**
         * 组件属性
         */
        $UIComponent: Object;

        // /**
        //  * 创建子项
        //  */
        // protected createChildren():void;

        // /**
        //  * 创建子项
        //  */
        // protected childrenCreated():void;

        // /**
        //  * 提交属性
        //  */
        // protected commitProperties():void;

        // /**
        //  * 测量组件尺寸
        //  */
        // protected measure():void;

        // /**
        //  * 更新显示列表
        //  */
        // protected updateDisplayList(unscaledWidth:number, unscaledHeight:number):void;

        // /**
        //  * 标记父级容器的尺寸和显示列表为失效
        //  */
        // protected invalidateParentLayout():void;

        /**
         * 指定此组件是否包含在父容器的布局中
         */
        includeInLayout: boolean;

        /**
         * 距父级容器离左边距离
         */
        left: any;

        /**
         * 距父级容器右边距离
         */
        right: any;

        /**
         * 距父级容器顶部距离
         */
        top: any;

        /**
         * 距父级容器底部距离
         */
        bottom: any;

        /**
         * 在父级容器中距水平中心位置的距离
         */
        horizontalCenter: any;

        /**
         * 在父级容器中距竖直中心位置的距离
         */
        verticalCenter: any;

        /**
         * 相对父级容器宽度的百分比
         */
        percentWidth: number;

        /**
         * 相对父级容器高度的百分比
         */
        percentHeight: number;

        /**
         * 外部显式指定的宽度
         */
        readonly explicitWidth: number;

        /**
         * 外部显式指定的高度
         */
        readonly explicitHeight: number;

        /**
         * 组件的最小宽度, 此属性设置为大于 maxWidth 的值时无效
         */
        minWidth: number;

        /**
         * 组件的最大高度
         */
        maxWidth: number;

        /**
         * 组件的最小高度, 此属性设置为大于 maxHeight 的值时无效
         */
        minHeight: number;

        /**
         * 组件的最大高度
         */
        maxHeight: number;

        /**
         * 设置测量结果
         * @param width 测量宽度
         * @param height 测量高度
         */
        setMeasuredSize(width: number, height: number): void;

        /**
         * 标记提交过需要延迟应用的属性, 以便在稍后屏幕更新期间调用该组件的 commitProperties() 方法
         */
        invalidateProperties(): void;

        /**
         * 由布局逻辑用于通过调用 commitProperties() 方法来验证组件的属性
         * * 通常子类应覆盖 commitProperties() 方法, 而不是覆盖此方法
         */
        validateProperties(): void;

        /**
         * 标记提交过需要验证组件尺寸, 以便在稍后屏幕更新期间调用该组件的 measure() 方法
         */
        invalidateSize(): void;

        /**
         * 验证组件的尺寸
         * @param recursive 如果为 true, 则调用对象子项的此方法
         */
        validateSize(recursive?: boolean): void;

        /**
         * 标记需要验证显示列表, 以便在稍后屏幕更新期间调用该组件的 updateDisplayList() 方法
         */
        invalidateDisplayList(): void;

        /**
         * 验证子项的位置和大小, 并绘制其他可视内容
         */
        validateDisplayList(): void;

        /**
         * 验证并更新此对象的属性和布局, 如果需要的话重绘对象
         */
        validateNow(): void;

        /**
         * 设置元素的布局大小, 这是元素在屏幕上进行绘制时所用的大小
         * @param layoutWidth 元素的布局宽度
         * @param layoutHeight 元素的布局高度
         */
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;

        /**
         * 设置元素在屏幕上进行绘制时所用的布局坐标
         * @param x 边框左上角的 X 坐标
         * @param y 边框左上角的 Y 坐标
         */
        setLayoutBoundsPosition(x: number, y: number): void;

        /**
         * 组件的布局尺寸, 常用于父级的 updateDisplayList() 方法中
         * * 按照: 布局尺寸 -> 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸
         * * 注意此方法返回值已经包含 scale 和 rotation
         * @param bounds 可以放置结果的 Rectangle 实例
         */
        getLayoutBounds(bounds: dou2d.Rectangle): void;

        /**
         * 获取组件的首选尺寸, 常用于父级的 measure() 方法中
         * 按照: 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸
         * * 注意此方法返回值已经包含 scale 和 rotation
         */
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}

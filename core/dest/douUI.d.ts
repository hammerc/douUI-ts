declare module dou {
    module Event {
        const CHANGING: string;
        const PROPERTY_CHANGE: string;
    }
}
declare module dou2d {
    module Event2D {
        const ITEM_TAP: string;
        const RICH_TEXT_CHANGE: string;
    }
    module TouchEvent {
        /**
         * 触发取消操作时, Scroller 组件滚动时按下的组件会派发该事件, 注意后续的 TOUCH_END 等事件已经不会继续派发了
         */
        const TOUCH_CANCEL: string;
    }
}
declare namespace douUI.sys {
    /**
     * 自定义类实现 IUIComponent 的步骤:
     * 1. 在自定义类的构造函数里调用: this.initializeUIValues();
     * 2. 拷贝 IUIComponent 接口定义的所有内容 (包括注释掉的 protected 函数) 到自定义类, 将所有子类需要覆盖的方法都声明为空方法体
     * 3. 在定义类结尾的外部调用 implementUIComponent(), 并传入自定义类
     * 4. 若覆盖了某个 IUIComponent 的方法, 需要手动调用 UIComponentImpl.prototype["方法名"].call(this);
     * @param descendant 自定义的 IUIComponent 子类
     * @param base 自定义子类继承的父类
     */
    function implementUIComponent(descendant: any, base: any, isContainer?: boolean): void;
    /**
     * 拷贝模板类的方法体和属性到目标类上
     * @param target 目标类
     * @param template 模板类
     */
    function mixin(target: any, template: any): void;
    /**
     * 检测指定对象是否实现了 IUIComponent 接口
     */
    function isIUIComponent(obj: any): obj is IUIComponent;
    /**
     * 使用 BasicLayout 规则测量目标对象
     */
    function measure(target: Group | Component): void;
    /**
     * 使用 BasicLayout 规则布局目标对象
     */
    function updateDisplayList(target: Group | Component, unscaledWidth: number, unscaledHeight: number): dou.Recyclable<dou2d.Point>;
}
declare namespace douUI {
    /**
     * 资源加载接口
     * @author wizardc
     */
    interface IAssetAdapter {
        getAsset(source: string, callBack: (content: any, source: string) => void, thisObject?: any): void;
    }
}
declare namespace douUI {
    /**
     * 默认的资源加载实现
     * * 可根据需要编写自己的资源加载器
     * @author wizardc
     */
    class DefaultAssetAdapter implements IAssetAdapter {
        getAsset(source: string, callBack: (content: any, source: string) => void, thisObject?: any): void;
    }
}
declare namespace douUI {
    /**
     * 获取资源
     */
    function getAsset(source: string, callBack: (content: any, source: string) => void, thisObject?: any): void;
}
declare namespace douUI {
    /**
     * 集合类数据源接口
     * @author wizardc
     */
    interface ICollection extends dou.IEventDispatcher {
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
declare namespace douUI {
    /**
     * 集合类数据源接
     * @author wizardc
     */
    class ArrayCollection extends dou.EventDispatcher implements ICollection {
        private _source;
        constructor(source?: any[]);
        /**
         * 数据源
         * * 通常情况下请不要直接调用 Array 的方法操作数据源, 否则对应的视图无法收到数据改变的通知, 若对数据源进行了修改, 请手动调用 refresh 方法刷新数据
         */
        set source(value: any[]);
        get source(): any[];
        /**
         * 此集合中的项目数
         */
        get length(): number;
        /**
         * 向列表末尾添加指定项目
         * @param item 要被添加的项
         */
        addItem(item: any): void;
        /**
         * 在指定的索引处添加项目
         * @param item 要添加的项
         * @param index 要添加的指定索引位置
         */
        addItemAt(item: any, index: number): void;
        /**
         * 获取指定索引处的项目
         */
        getItemAt(index: number): any;
        /**
         * 如果项目位于列表中, 返回该项目的索引, 否则返回 -1
         */
        getItemIndex(item: any): number;
        /**
         * 通知视图某个项目的属性已更新
         * @param item 视图中需要被更新的项
         */
        itemUpdated(item: any): void;
        /**
         * 替换在指定索引处的项目, 并返回该项目
         * @param item 要在指定索引放置的新的项
         * @param index 要被替换的项的索引位置
         * @return 被替换的项目
         */
        replaceItemAt(item: any, index: number): any;
        /**
         * 用新数据源替换原始数据源, 此方法与直接设置 source 不同, 它不会导致目标视图重置滚动位置
         */
        replaceAll(newSource: any[]): void;
        /**
         * 删除指定索引处的项目并返回该项目, 原先位于此索引之后的所有项目的索引现在都向前移动一个位置
         * @param index 要被移除的项的索引
         * @return 被移除的项
         */
        removeItemAt(index: number): any;
        /**
         * 删除列表中的所有项目
         */
        removeAll(): void;
        /**
         * 在对数据源进行排序或过滤操作后可以手动调用此方法刷新所有数据, 以更新视图
         * * ArrayCollection 不会自动检原始数据进行了改变, 所以你必须调用该方法去更新显示
         */
        refresh(): void;
    }
}
declare namespace douUI.sys {
    /**
     * 失效验证管理器
     * @author wizardc
     */
    class Validator extends dou.EventDispatcher {
        private _targetLevel;
        private _invalidatePropertiesFlag;
        private _invalidateClientPropertiesFlag;
        private _invalidatePropertiesQueue;
        private _invalidateSizeFlag;
        private _invalidateClientSizeFlag;
        private _invalidateSizeQueue;
        private _invalidateDisplayListFlag;
        private _invalidateDisplayListQueue;
        private _eventDisplay;
        /**
         * 是否已经添加了事件监听
         */
        private _listenersAttached;
        /**
         * 标记组件属性失效
         */
        invalidateProperties(client: IUIComponent): void;
        /**
         * 验证失效的属性
         */
        private validateProperties;
        /**
         * 标记需要重新测量尺寸
         */
        invalidateSize(client: IUIComponent): void;
        /**
         * 测量尺寸
         */
        private validateSize;
        /**
         * 标记需要重新布局
         */
        invalidateDisplayList(client: IUIComponent): void;
        /**
         * 重新布局
         */
        private validateDisplayList;
        /**
         * 添加事件监听
         */
        private attachListeners;
        /**
         * 执行属性应用
         */
        private doPhasedInstantiationCallBack;
        private doPhasedInstantiation;
        /**
         * 使大于等于指定组件层级的元素立即应用属性
         * @param target 要立即应用属性的组件
         */
        validateClient(target: IUIComponent): void;
    }
}
declare namespace douUI.sys {
    /**
     * 组件接口
     * @author wizardc
     */
    interface IUIComponent extends dou2d.DisplayObject {
        /**
         * 接口类型
         */
        __interface_type__: "douUI.sys.IUIComponent";
        /**
         * 组件属性
         */
        $UIComponent: Object;
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
declare namespace douUI.sys {
    /**
     * UI 组件实现类
     * @author wizardc
     */
    class UIComponentImpl extends dou2d.DisplayObject implements IUIComponent {
        __interface_type__: "douUI.sys.IUIComponent";
        /**
         * 父类引用
         */
        $super: any;
        /**
         * 属性集合
         */
        $UIComponent: Object;
        /**
         * 是否包含在父容器的布局中
         */
        $includeInLayout: boolean;
        constructor();
        /**
         * 组件宽度
         * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
         */
        $setWidth(value: number): boolean;
        $getWidth(): number;
        /**
         * 组件高度
         * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
         */
        $setHeight(value: number): boolean;
        $getHeight(): number;
        /**
         * 距父级容器离左边距离
         */
        set left(value: any);
        get left(): any;
        /**
         * 距父级容器右边距离
         */
        set right(value: any);
        get right(): any;
        /**
         * 距父级容器顶部距离
         */
        set top(value: any);
        get top(): any;
        /**
         * 距父级容器底部距离
         */
        set bottom(value: any);
        get bottom(): any;
        /**
         * 在父级容器中距水平中心位置的距离
         */
        set horizontalCenter(value: any);
        get horizontalCenter(): any;
        /**
         * 在父级容器中距竖直中心位置的距离
         */
        set verticalCenter(value: any);
        get verticalCenter(): any;
        /**
         * 相对父级容器宽度的百分比
         */
        set percentWidth(value: number);
        get percentWidth(): number;
        /**
         * 相对父级容器高度的百分比
         */
        set percentHeight(value: number);
        get percentHeight(): number;
        /**
         * 外部显式指定的宽度
         */
        get explicitWidth(): number;
        /**
         * 外部显式指定的高度
         */
        get explicitHeight(): number;
        /**
         * 组件的最小宽度, 此属性设置为大于 maxWidth 的值时无效, 同时影响测量和自动布局的尺寸
         */
        set minWidth(value: number);
        get minWidth(): number;
        /**
         * 组件的最大高度, 同时影响测量和自动布局的尺寸
         */
        set maxWidth(value: number);
        get maxWidth(): number;
        /**
         * 组件的最小高度, 此属性设置为大于maxHeight的值时无效, 同时影响测量和自动布局的尺寸
         */
        set minHeight(value: number);
        get minHeight(): number;
        /**
         * 组件的最大高度, 同时影响测量和自动布局的尺寸
         */
        set maxHeight(value: number);
        get maxHeight(): number;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        /**
         * 子类覆盖此方法可以执行一些初始化子项操作, 此方法仅在组件第一次添加到舞台时回调一次
         */
        protected createChildren(): void;
        /**
         * 子项创建完成, 此方法在 createChildren() 之后执行
         */
        protected childrenCreated(): void;
        /**
         * 提交属性, 子类在调用完 invalidateProperties() 方法后, 应覆盖此方法以应用属性
         */
        protected commitProperties(): void;
        /**
         * 测量组件尺寸
         */
        protected measure(): void;
        /**
         * 更新显示列表
         */
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        /**
         * 指定此组件是否包含在父容器的布局中, 若为 false, 则父级容器在测量和布局阶段都忽略此组件, 默认值为 true
         * * 注意: visible 属性与此属性不同, 设置 visible 为 false, 父级容器仍会对其布局
         */
        set includeInLayout(value: boolean);
        get includeInLayout(): boolean;
        $onAddToStage(stage: dou2d.Stage, nestLevel: number): void;
        /**
         * 检查属性失效标记并应用
         */
        private checkInvalidateFlag;
        /**
         * 立即验证自身的尺寸
         */
        private validateSizeNow;
        /**
         * 设置测量结果
         * @param width 测量宽度
         * @param height 测量高度
         */
        setMeasuredSize(width: number, height: number): void;
        /**
         * 设置组件的宽高
         * * 此方法不同于直接设置 width, height 属性, 不会影响显式标记尺寸属性
         */
        protected setActualSize(w: number, h: number): void;
        protected $updateUseTransform(): void;
        $setMatrix(matrix: dou2d.Matrix, needUpdateProperties?: boolean): boolean;
        $setAnchorOffsetX(value: number): boolean;
        $setAnchorOffsetY(value: number): boolean;
        $setX(value: number): boolean;
        $setY(value: number): boolean;
        /**
         * 标记属性失效
         */
        invalidateProperties(): void;
        /**
         * 验证组件的属性
         */
        validateProperties(): void;
        /**
         * 标记提交过需要验证组件尺寸
         */
        invalidateSize(): void;
        /**
         * 验证组件的尺寸
         */
        validateSize(recursive?: boolean): void;
        /**
         * 测量组件尺寸, 返回尺寸是否发生变化
         */
        protected measureSizes(): boolean;
        /**
         * 标记需要验证显示列表
         */
        invalidateDisplayList(): void;
        /**
         * 验证子项的位置和大小, 并绘制其他可视内容
         */
        validateDisplayList(): void;
        /**
         * 更新最终的组件宽高
         */
        private updateFinalSize;
        /**
         * 立即应用组件及其子项的所有属性
         */
        validateNow(): void;
        /**
         * 标记父级容器的尺寸和显示列表为失效
         */
        protected invalidateParentLayout(): void;
        /**
         * 设置组件的布局宽高
         */
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        /**
         * 设置组件的布局位置
         */
        setLayoutBoundsPosition(x: number, y: number): void;
        /**
         * 组件的布局尺寸, 常用于父级的 updateDisplayList() 方法中
         * * 按照: 布局尺寸 -> 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
         */
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        private getPreferredUWidth;
        private getPreferredUHeight;
        /**
         * 获取组件的首选尺寸, 常用于父级的 measure() 方法中
         * 按照: 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
         */
        getPreferredBounds(bounds: dou2d.Rectangle): void;
        private applyMatrix;
        private getAnchorMatrix;
    }
}
declare namespace douUI {
    /**
     * 支持视区的组件接口
     * * 如果组件的内容子项比组件要大, 而且您向往子项可以在父级组件的边缘处被裁减, 您可以定义一个视区
     * * 视区是您希望显示的组件的区域的矩形子集, 而不是显示整个组件
     * @author wizardc
     */
    interface IViewport extends sys.IUIComponent {
        /**
         * 视域的内容的宽度
         */
        contentWidth: number;
        /**
         * 视域的内容的高度
         */
        contentHeight: number;
        /**
         * 可视区域水平方向起始点
         */
        scrollH: number;
        /**
         * 可视区域竖直方向起始点
         */
        scrollV: number;
        /**
         * 是否启用容器滚动
         */
        scrollEnabled: boolean;
    }
}
declare namespace douUI {
    /**
     * 列表类组件的项呈示器接口
     * @author wizardc
     */
    interface IItemRenderer extends Component {
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
declare namespace douUI {
    /**
     * 树组件数据源接口
     * @author wizardc
     */
    interface ITreeDataCollection {
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
declare namespace douUI {
    /**
     * 可设置外观的 UI 组件基类
     * @author wizardc
     */
    abstract class Component extends dou2d.DisplayObjectContainer implements sys.IUIComponent {
        $Component: Object;
        constructor();
        /**
         * 组件是否可以接受用户交互
         */
        set enabled(value: boolean);
        get enabled(): boolean;
        $setTouchChildren(value: boolean): boolean;
        $setTouchEnabled(value: boolean): void;
        /**
         * 当前使用的皮肤
         */
        set skin(value: ISkin);
        get skin(): ISkin;
        /**
         * 当前使用的皮肤名称
         */
        set skinName(value: string);
        get skinName(): string;
        /**
         * 当前的状态
         */
        set currentState(value: string);
        get currentState(): string;
        /**
         * 标记状态失效
         */
        invalidateState(): void;
        protected getCurrentState(): string;
        /**
         * 设置皮肤风格
         * * 仅对当前使用的皮肤有效, 皮肤更换后需要重新调用
         */
        setStyle(name: string, ...args: any[]): void;
        /**
         * 皮肤添加成功后调用
         */
        protected onSkinAdded(): void;
        /**
         * 皮肤移除成功后调用
         */
        protected onSkinRemoved(): void;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI.sys {
    /**
     * 缓动动画类
     * @author wizardc
     */
    class Animation {
        private _updateFunction;
        private _endFunction;
        private _thisObject;
        private _easerFunction;
        private _isPlaying;
        private _runningTime;
        private _duration;
        private _from;
        private _to;
        private _currentValue;
        constructor(updateFunction: (animation: Animation) => void, endFunction?: (animation: Animation) => void, thisObject?: any);
        /**
         * 当前是否正在播放动画
         */
        get isPlaying(): boolean;
        /**
         * 当前的值
         */
        get currentValue(): number;
        /**
         * 开始播放动画
         */
        play(duration: number, from: number, to: number, easerFunction?: (fraction: number) => number): void;
        private start;
        private update;
        /**
         * 停止播放动画
         */
        stop(): void;
    }
}
declare namespace douUI {
    /**
     * 范围选取组件, 该组件包含一个值和这个值所允许的最大最小约束范围
     * @author wizardc
     */
    abstract class Range extends Component {
        $Range: Object;
        constructor();
        /**
         * 最大有效值
         */
        set maximum(value: number);
        get maximum(): number;
        /**
         * 最小有效值
         */
        set minimum(value: number);
        get minimum(): number;
        /**
         * 此范围的当前值
         */
        set value(newValue: number);
        get value(): number;
        /**
         * 步进值
         */
        set snapInterval(value: number);
        get snapInterval(): number;
        protected commitProperties(): void;
        protected setValue(value: number): void;
        /**
         * 返回最接近的值
         */
        protected nearestValidValue(value: number, interval: number): number;
        protected updateDisplayList(w: number, h: number): void;
        /**
         * 更新皮肤
         */
        protected updateSkinDisplayList(): void;
    }
}
declare namespace douUI {
    /**
     * 滚动条基类
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class ScrollBarBase extends Component {
        /**
         * 滑块显示对象
         */
        thumb: Component;
        /**
         * 是否自动显示隐藏
         */
        autoVisibility: boolean;
        protected _viewport: IViewport;
        set viewport(value: IViewport);
        get viewport(): IViewport;
        private onViewportResize;
        protected onPropertyChanged(event: dou.Event): void;
    }
}
declare namespace douUI {
    /**
     * 滑块基类
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    abstract class SliderBase extends Range {
        /**
         * 轨道显示对象
         */
        track: Component;
        /**
         * 轨道高亮显示对象
         */
        trackHighlight: dou2d.DisplayObject;
        /**
         * 滑块显示对象
         */
        thumb: Component;
        $SliderBase: Object;
        constructor();
        /**
         * 如果为 true, 则将在沿着轨道拖动滑块时就刷新滑块的值, 否则在释放时刷新
         */
        set liveDragging(value: boolean);
        get liveDragging(): boolean;
        /**
         * 当前滑块的值
         */
        set pendingValue(value: number);
        get pendingValue(): number;
        protected onSkinAdded(): void;
        protected onSkinRemoved(): void;
        private onTouchBegin;
        private stageTouchEndHandler;
        protected setValue(value: number): void;
        /**
         * 将相对于轨道的 x, y 像素位置转换为介于最小值和最大值 (包括两者) 之间的一个值
         */
        protected pointToValue(x: number, y: number): number;
        protected onThumbTouchBegin(event: dou2d.TouchEvent): void;
        private onStageTouchMove;
        protected updateWhenTouchMove(newValue: number): void;
        protected onStageTouchEnd(event: dou2d.TouchEvent): void;
        protected onTrackTouchBegin(event: dou2d.TouchEvent): void;
    }
}
declare namespace douUI.sys {
    /**
     * 拖拽后继续滚动的动画模拟类
     * @author wizardc
     */
    class TouchScroll {
        /**
         * 滚动速度系数
         */
        scrollFactor: number;
        private _target;
        private _updateFunction;
        private _endFunction;
        private _velocity;
        private _previousVelocity;
        private _currentPosition;
        private _previousPosition;
        private _currentScrollPos;
        private _maxScrollPos;
        private _offsetPoint;
        private _animation;
        private _started;
        private _bounces;
        constructor(target: dou.IEventDispatcher, updateFunction: (scrollPos: number) => void, endFunction?: () => void);
        /**
         * 是否允许回弹
         */
        set bounces(value: boolean);
        get bounces(): boolean;
        get isStarted(): boolean;
        get isPlaying(): boolean;
        private onScrollingUpdate;
        /**
         * 开始记录位移变化
         */
        start(touchPoint: number): void;
        private onTick;
        /**
         * 更新当前移动到的位置
         */
        update(touchPoint: number, maxScrollValue: number, scrollValue: number): void;
        /**
         * 停止记录位移变化, 并计算出目标值和继续缓动的时间
         */
        finish(currentScrollPos: number, maxScrollPos: number): void;
        private finishScrolling;
        private throwTo;
        /**
         * 停止缓动
         */
        stop(): void;
    }
}
declare namespace douUI {
    /**
     * 文本
     * @author wizardc
     */
    class Label extends dou2d.TextField implements sys.IUIComponent {
        private _widthConstraint;
        constructor(text?: string);
        $invalidateTextField(): void;
        $setWidth(value: number): boolean;
        $setHeight(value: number): boolean;
        $setText(value: string): boolean;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI {
    /**
     * 位图文本
     * @author wizardc
     */
    class BitmapLabel extends dou2d.BitmapText implements sys.IUIComponent {
        private _widthConstraint;
        private _heightConstraint;
        private _source;
        private _sourceChanged;
        constructor(text?: string);
        $setWidth(value: number): boolean;
        $setHeight(value: number): boolean;
        $setText(value: string): boolean;
        set source(value: string);
        get source(): string;
        $invalidateContentBounds(): void;
        private parseFont;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI {
    /**
     * 可编辑文本
     * @author wizardc
     */
    class EditableText extends dou2d.TextField implements sys.IUIComponent {
        $EditableText: Object;
        private _widthConstraint;
        private _isShowPrompt;
        private _promptColor;
        private _isFocusIn;
        private _isTouchCancle;
        constructor();
        /**
         * 空字符串时要显示的文本内容
         */
        set prompt(value: string);
        get prompt(): string;
        /**
         * 空字符串时要显示的文本内容的颜色
         */
        set promptColor(value: number);
        get promptColor(): number;
        $invalidateTextField(): void;
        $setWidth(value: number): boolean;
        $setHeight(value: number): boolean;
        $setText(value: string): boolean;
        $getText(): string;
        $onAddToStage(stage: dou2d.Stage, nestLevel: number): void;
        $onRemoveFromStage(): void;
        private onfocusOut;
        private onTouchBegin;
        private onTouchCancle;
        private onfocusIn;
        private showPromptText;
        $setTextColor(value: number): boolean;
        $setDisplayAsPassword(value: boolean): boolean;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI {
    /**
     * 图片
     * @author wizardc
     */
    class Image extends dou2d.Bitmap implements sys.IUIComponent {
        private _source;
        private _sourceChanged;
        constructor(source?: string | dou2d.Texture);
        set source(value: string | dou2d.Texture);
        get source(): string | dou2d.Texture;
        $setScale9Grid(value: dou2d.Rectangle): void;
        $setFillMode(value: dou2d.BitmapFillMode): boolean;
        $setTexture(value: dou2d.Texture): boolean;
        private parseSource;
        $measureContentBounds(bounds: dou2d.Rectangle): void;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected setActualSize(w: number, h: number): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI {
    /**
     * 按钮
     * * 拥有状态: "up", "down", "disabled"
     * @author wizardc
     */
    class Button extends Component {
        private touchCaptured;
        constructor();
        protected onTouchBegin(event: dou2d.TouchEvent): void;
        protected onTouchCancle(event: dou2d.TouchEvent): void;
        private onStageTouchEnd;
        protected buttonReleased(): void;
        protected getCurrentState(): string;
    }
}
declare namespace douUI {
    /**
     * 切换按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class ToggleButton extends Button {
        protected _selected: boolean;
        protected _autoSelected: boolean;
        /**
         * 当前是否处于选中状态
         */
        set selected(value: boolean);
        get selected(): boolean;
        /**
         * 是否根据点击操作自动变换是否选中
         */
        set autoSelected(value: boolean);
        get autoSelected(): boolean;
        protected buttonReleased(): void;
        protected getCurrentState(): string;
    }
}
declare namespace douUI {
    /**
     * 复选框
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class CheckBox extends ToggleButton {
    }
}
declare namespace douUI {
    /**
     * 单选按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class RadioButton extends ToggleButton {
        $indexNumber: number;
        $radioButtonGroup: RadioButtonGroup;
        private _group;
        private _groupChanged;
        private _groupName;
        private _value;
        constructor(groupName?: string);
        set enabled(value: boolean);
        get enabled(): boolean;
        set group(value: RadioButtonGroup);
        get group(): RadioButtonGroup;
        set groupName(value: string);
        get groupName(): string;
        /**
         * 当前组件的值
         */
        set value(value: any);
        get value(): any;
        protected commitProperties(): void;
        private addToGroup;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected buttonReleased(): void;
    }
}
declare namespace douUI {
    /**
     * 单选按钮组
     * @author wizardc
     */
    class RadioButtonGroup extends dou.EventDispatcher {
        $name: string;
        $enabled: boolean;
        private _radioButtons;
        private _selectedValue;
        private _selection;
        constructor(name?: string);
        set enabled(value: boolean);
        get enabled(): boolean;
        set selectedValue(value: any);
        get selectedValue(): any;
        set selection(value: RadioButton);
        get selection(): RadioButton;
        $setSelection(value: RadioButton, fireChange?: boolean): boolean;
        get numRadioButtons(): number;
        getRadioButtonAt(index: number): RadioButton;
        private changeSelection;
        addRadioButton(instance: RadioButton): void;
        private removedHandler;
        private breadthOrderCompare;
        removeRadioButton(instance: RadioButton, addListener?: boolean): void;
        private addedHandler;
    }
}
declare namespace douUI {
    /**
     * 自动布局的容器基类
     * @author wizardc
     */
    class Group extends dou2d.DisplayObjectContainer implements IViewport {
        $Group: Object;
        protected _layout: LayoutBase;
        constructor();
        /**
         * 触摸组件的背景透明区域是否可以穿透
         */
        set touchThrough(value: boolean);
        get touchThrough(): boolean;
        /**
         * 布局元素子项的数量
         */
        get numElements(): number;
        /**
         * 此容器的布局对象
         */
        set layout(value: LayoutBase);
        get layout(): LayoutBase;
        /**
         * 是否启用滚动条
         */
        set scrollEnabled(value: boolean);
        get scrollEnabled(): boolean;
        /**
         * 水平方向的滚动数值
         */
        set scrollH(value: number);
        get scrollH(): number;
        /**
         * 垂直方向的滚动数值
         */
        set scrollV(value: number);
        get scrollV(): number;
        /**
         * 获取内容宽度
         */
        get contentWidth(): number;
        /**
         * 获取内容高度
         */
        get contentHeight(): number;
        private updateScrollRect;
        /**
         * 设置内容尺寸, 由引擎内部调用
         */
        setContentSize(width: number, height: number): void;
        /**
         * 获取一个布局元素子项
         */
        getElementAt(index: number): dou2d.DisplayObject;
        /**
         * 获取一个虚拟布局元素子项
         */
        getVirtualElementAt(index: number): dou2d.DisplayObject;
        /**
         * 在支持虚拟布局的容器中, 设置容器内可见的子元素索引范围
         */
        setVirtualElementIndicesInView(startIndex: number, endIndex: number): void;
        $hitTest(stageX: number, stageY: number): dou2d.DisplayObject;
        __interface_type__: "douUI.sys.IUIComponent";
        $UIComponent: Object;
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues;
        protected createChildren(): void;
        protected childrenCreated(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected invalidateParentLayout(): void;
        includeInLayout: boolean;
        left: any;
        right: any;
        top: any;
        bottom: any;
        horizontalCenter: any;
        verticalCenter: any;
        percentWidth: number;
        percentHeight: number;
        explicitWidth: number;
        explicitHeight: number;
        minWidth: number;
        maxWidth: number;
        minHeight: number;
        maxHeight: number;
        setMeasuredSize(width: number, height: number): void;
        invalidateProperties(): void;
        validateProperties(): void;
        invalidateSize(): void;
        validateSize(recursive?: boolean): void;
        invalidateDisplayList(): void;
        validateDisplayList(): void;
        validateNow(): void;
        setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void;
        setLayoutBoundsPosition(x: number, y: number): void;
        getLayoutBounds(bounds: dou2d.Rectangle): void;
        getPreferredBounds(bounds: dou2d.Rectangle): void;
    }
}
declare namespace douUI {
    /**
     * 按渲染项排列显示多个数据的容器
     * @author wizardc
     */
    class DataGroup extends Group {
        $DataGroup: Object;
        protected _dataProviderChanged: boolean;
        protected _dataProvider: ICollection;
        protected _indexToRenderer: IItemRenderer[];
        constructor();
        set layout(value: LayoutBase);
        get layout(): LayoutBase;
        private onUseVirtualLayoutChanged;
        set useVirtualLayout(value: boolean);
        get useVirtualLayout(): boolean;
        /**
         * 项呈示器类
         */
        set itemRenderer(value: any);
        get itemRenderer(): any;
        /**
         * 数据源
         */
        set dataProvider(value: ICollection);
        get dataProvider(): ICollection;
        get numElements(): number;
        getElementAt(index: number): dou2d.DisplayObject;
        getVirtualElementAt(index: number): dou2d.DisplayObject;
        setVirtualElementIndicesInView(startIndex: number, endIndex: number): void;
        private freeRendererByIndex;
        private doFreeRenderer;
        invalidateSize(): void;
        private createVirtualRenderer;
        private createOneRenderer;
        private removeDataProviderListener;
        protected onCollectionChange(event: CollectionEvent): void;
        private itemAddedHandler;
        private itemRemovedHandler;
        protected itemAdded(item: any, index: number): void;
        protected itemRemoved(item: any, index: number): void;
        private resetRenderersIndices;
        private itemUpdatedHandler;
        private resetRendererItemIndex;
        private itemToRendererClass;
        protected createChildren(): void;
        protected commitProperties(): void;
        protected measure(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        private ensureTypicalLayoutElement;
        private measureRendererSize;
        private setTypicalLayoutRect;
        private removeAllRenderers;
        private createRenderers;
        updateRenderer(renderer: IItemRenderer, itemIndex: number, data: any): IItemRenderer;
        protected rendererAdded(renderer: IItemRenderer, index: number, item: any): void;
        protected rendererRemoved(renderer: IItemRenderer, index: number, item: any): void;
    }
}
declare namespace douUI {
    /**
     * 列表控件基类
     * @author wizardc
     */
    class ListBase extends DataGroup {
        /**
         * 未选中任何项时的索引值
         */
        static NO_SELECTION: number;
        /**
         * 未设置缓存选中项的值
         */
        static NO_PROPOSED_SELECTION: number;
        $ListBase: Object;
        constructor();
        /**
         * 是否必须存在选中的项
         */
        set requireSelection(value: boolean);
        get requireSelection(): boolean;
        /**
         * 选中项索引
         */
        set selectedIndex(value: number);
        get selectedIndex(): number;
        protected setSelectedIndex(value: number, dispatchChangeEvent?: boolean): void;
        protected getSelectedIndex(): number;
        /**
         * 选中项数据
         */
        set selectedItem(value: any);
        get selectedItem(): any;
        protected setSelectedItem(value: any, dispatchChangeEvent?: boolean): void;
        protected getSelectedItem(): any;
        protected commitProperties(): void;
        updateRenderer(renderer: IItemRenderer, itemIndex: number, data: any): IItemRenderer;
        protected itemSelected(index: number, selected: boolean): void;
        protected isItemIndexSelected(index: number): boolean;
        protected commitSelection(dispatchChangedEvents?: boolean): boolean;
        protected adjustSelection(newIndex: number): void;
        protected itemAdded(item: any, index: number): void;
        protected itemRemoved(item: any, index: number): void;
        protected onCollectionChange(event: CollectionEvent): void;
        protected dataProviderRefreshed(): void;
        protected rendererAdded(renderer: IItemRenderer, index: number, item: any): void;
        protected rendererRemoved(renderer: IItemRenderer, index: number, item: any): void;
        protected onRendererTouchBegin(event: dou2d.TouchEvent): void;
        protected onRendererTouchCancle(event: dou2d.TouchEvent): void;
        protected onRendererTouchEnd(event: dou2d.TouchEvent): void;
        private onStageTouchEnd;
    }
}
declare namespace douUI {
    /**
     * 水平滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class HScrollBar extends ScrollBarBase {
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected onPropertyChanged(event: dou.Event): void;
    }
}
declare namespace douUI {
    /**
     * 水平滑块
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class HSlider extends SliderBase {
        protected pointToValue(x: number, y: number): number;
        private getThumbRange;
        protected updateSkinDisplayList(): void;
    }
}
declare namespace douUI {
    /**
     * 列表类组件的项呈示器
     * @author wizardc
     */
    class ItemRenderer extends Component implements IItemRenderer {
        private _data;
        private _itemIndex;
        private _selected;
        private _touchCaptured;
        constructor();
        set data(value: any);
        get data(): any;
        set itemIndex(value: number);
        get itemIndex(): number;
        set selected(value: boolean);
        get selected(): boolean;
        protected dataChanged(): void;
        protected onTouchBegin(event: dou2d.TouchEvent): void;
        protected onTouchCancle(event: dou2d.TouchEvent): void;
        private onStageTouchEnd;
        protected getCurrentState(): string;
    }
}
declare namespace douUI {
    /**
     * 富文本
     * @author wizardc
     */
    export class RichLabel extends Group {
        protected _label: Label;
        protected _text: string;
        protected _pickup: RegExp;
        protected _sourceFunc: (result: RegExpExecArray) => string;
        protected _scaleFunc: (result: RegExpExecArray) => number;
        protected _textInvalid: boolean;
        protected _styleInvalid: boolean;
        protected _lastWidth: number;
        protected _lastHeight: number;
        protected _imageList: IImageInfo[];
        constructor();
        get label(): Label;
        set fontFamily(value: string);
        get fontFamily(): string;
        set size(value: number);
        get size(): number;
        set bold(value: boolean);
        get bold(): boolean;
        set italic(value: boolean);
        get italic(): boolean;
        set textAlign(value: dou2d.HorizontalAlign);
        get textAlign(): dou2d.HorizontalAlign;
        set verticalAlign(value: dou2d.VerticalAlign);
        get verticalAlign(): dou2d.VerticalAlign;
        set lineSpacing(value: number);
        get lineSpacing(): number;
        set textColor(value: number);
        get textColor(): number;
        set text(value: string);
        get text(): string;
        set strokeColor(value: number);
        get strokeColor(): number;
        set stroke(value: number);
        get stroke(): number;
        get numLines(): number;
        get textWidth(): number;
        get textHeight(): number;
        /**
         * 需要添加 g 标签
         * 表情获取如下：label.pickup = /#\d{2}#/g;
         */
        set pickup(value: RegExp);
        get pickup(): RegExp;
        /**
         * @param result 为获取的匹配结果
         * @returns 对应的图片路径
         */
        set sourceFunc(value: (result: RegExpExecArray) => string);
        get sourceFunc(): (result: RegExpExecArray) => string;
        /**
         * @param result 为获取的匹配结果, 设置为空表示缩放为 1
         * @returns 对应的图片缩放值
         */
        set scaleFunc(value: (result: RegExpExecArray) => number);
        get scaleFunc(): (result: RegExpExecArray) => number;
        set linkPreventTap(value: boolean);
        get linkPreventTap(): boolean;
        protected createChildren(): void;
        private onResize;
        private $onResize;
        protected onRender(): void;
        protected onImageLoad(event: dou.Event): void;
        protected onTextRender(): void;
        clear(): void;
    }
    interface IImageInfo {
        sign: string;
        icon: dou.Recyclable<Image>;
        x: number;
        y: number;
        scale: number;
    }
    export {};
}
declare namespace douUI {
    /**
     * 列表控件, 可以选择一个或多个项目
     * @author wizardc
     */
    class List extends ListBase {
        private _allowMultipleSelection;
        private _selectedIndices;
        private _proposedSelectedIndices;
        constructor();
        set selectedIndex(value: number);
        get selectedIndex(): number;
        /**
         * 是否允许同时选中多项
         */
        set allowMultipleSelection(value: boolean);
        get allowMultipleSelection(): boolean;
        /**
         * 选定数据项的列表
         */
        set selectedItems(value: any[]);
        get selectedItems(): any[];
        /**
         * 选定数据项的索引列表
         */
        set selectedIndices(value: number[]);
        get selectedIndices(): number[];
        protected setSelectedIndices(value: number[], dispatchChangeEvent?: boolean): void;
        protected commitProperties(): void;
        protected commitSelection(dispatchChangedEvents?: boolean): boolean;
        private isValidIndex;
        protected commitMultipleSelection(): void;
        protected isItemIndexSelected(index: number): boolean;
        protected dataProviderRefreshed(): void;
        private calculateSelectedIndices;
        protected onRendererTouchEnd(event: dou2d.TouchEvent): void;
    }
}
declare namespace douUI {
    /**
     * 进度条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: "labelDisplay"
     * @author wizardc
     */
    class ProgressBar extends Range {
        /**
         * 进度高亮显示对象
         */
        thumb: Component;
        /**
         * 进度条文本
         */
        labelDisplay: Label;
        private _labelFunction;
        private _direction;
        private _thumbInitX;
        private _thumbInitY;
        /**
         * 进度条文本格式化回调函数
         */
        set labelFunction(value: (value: number, maximum: number) => string);
        get labelFunction(): (value: number, maximum: number) => string;
        /**
         * 进度条增长方向
         */
        set direction(value: Direction);
        get direction(): Direction;
        protected updateSkinDisplayList(): void;
        protected valueToLabel(value: number, maximum: number): string;
    }
}
declare namespace douUI {
    /**
     * 矩形绘图组件
     * @author wizardc
     */
    class Rect extends Component {
        private _graphics;
        private _fillColor;
        private _fillAlpha;
        private _strokeColor;
        private _strokeAlpha;
        private _strokeWeight;
        private _ellipseWidth;
        private _ellipseHeight;
        constructor(width?: number, height?: number, fillColor?: number);
        get graphics(): dou2d.Graphics;
        /**
         * 填充颜色
         */
        set fillColor(value: number);
        get fillColor(): number;
        /**
         * 填充透明度
         */
        set fillAlpha(value: number);
        get fillAlpha(): number;
        /**
         * 边框颜色
         */
        set strokeColor(value: number);
        get strokeColor(): number;
        /**
         * 边框透明度
         */
        set strokeAlpha(value: number);
        get strokeAlpha(): number;
        /**
         * 边框粗细, 为 0 时不显示边框
         */
        set strokeWeight(value: number);
        get strokeWeight(): number;
        /**
         * 用于绘制圆角的椭圆的宽度
         */
        set ellipseWidth(value: number);
        get ellipseWidth(): number;
        /**
         * 用于绘制圆角的椭圆的高度
         */
        set ellipseHeight(value: number);
        get ellipseHeight(): number;
        $measureContentBounds(bounds: dou2d.Rectangle): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        $onRemoveFromStage(): void;
    }
}
declare namespace douUI {
    /**
     * 可滚动组件
     * * 当 viewport 指向的组件大于自己的尺寸时会裁剪 viewport 组件并可进行拖拽
     * * 需要将 viewport 组件作为 Scroller 组件的子项添加到显示列表, 如果不是则在设定 viewport 属性是会自动作为子项添加
     * * 本组件的 touchChildren 属性会被内部逻辑使用, 请保留默认值不要再外部手动设置
     * * 皮肤必须子项: 无
     * * 皮肤可选子项: "horizontalScrollBar", "verticalScrollBar"
     * @author wizardc
     */
    class Scroller extends Component {
        /**
         * 开始触发滚动的阈值, 当触摸点偏离初始触摸点的距离超过这个值时才会触发滚动
         */
        static scrollThreshold: number;
        /**
         * 水平滚动条
         */
        horizontalScrollBar: HScrollBar;
        /**
         * 垂直滚动条
         */
        verticalScrollBar: VScrollBar;
        $Scroller: Object;
        private _bounces;
        private _downTarget;
        constructor();
        /**
         * 是否启用回弹
         */
        set bounces(value: boolean);
        get bounces(): boolean;
        /**
         * 调节滑动结束时滚出的速度, 等于 0 时没有滚动动画
         */
        set throwSpeed(value: number);
        get throwSpeed(): number;
        /**
         * 垂直滑动条显示策略
         */
        set scrollPolicyV(value: string);
        get scrollPolicyV(): string;
        /**
         * 水平滑动条显示策略
         */
        set scrollPolicyH(value: string);
        get scrollPolicyH(): string;
        /**
         * 要滚动的视域组件
         */
        set viewport(value: IViewport);
        get viewport(): IViewport;
        private uninstallViewport;
        private installViewport;
        private onViewportTouchBegin;
        private onViewPortRemove;
        private checkScrollPolicy;
        private onTouchBegin;
        private onTouchMove;
        private onTouchCancel;
        private onTouchEnd;
        private onRemoveListeners;
        private horizontalUpdateHandler;
        private verticalUpdateHandler;
        private horizontalEndHandler;
        private verticalEndHanlder;
        private onChangeEnd;
        private onAutoHideTimer;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected onSkinAdded(): void;
        /**
         * 停止滚动的动画
         */
        stopAnimation(): void;
    }
}
declare namespace douUI {
    /**
     * 选项卡
     * @author wizardc
     */
    class TabBar extends ListBase {
        private _indexBeingUpdated;
        constructor();
        set dataProvider(value: ICollection);
        get dataProvider(): ICollection;
        protected createChildren(): void;
        private onIndexChanged;
        private onViewStackIndexChange;
    }
}
declare namespace douUI {
    /**
     * 树形组件
     * @author wizardc
     */
    class Tree extends Group {
        protected _itemRenderers: any[];
        protected _showRoot: boolean;
        protected _keepStatus: boolean;
        protected _justOpenOne: boolean;
        protected _allowClose: boolean;
        protected _dataProvider: any;
        protected _selectedItem: any;
        protected _itemChangedFlag: boolean;
        protected _sizeChangedFlag: boolean;
        protected _itemPool: IItemRenderer[][];
        protected _treeDataProvider: ITreeDataCollection;
        protected _selectedRenderer: IItemRenderer;
        constructor();
        /**
         * 项目渲染列表
         * * 分别对应各深度项目的渲染器类
         * * 如果不需要显示顶级深度项目则数组第一个元素为空即可
         */
        set itemRenderers(value: any[]);
        get itemRenderers(): any[];
        /**
         * 是否显示顶级深度项目
         */
        set showRoot(value: boolean);
        get showRoot(): boolean;
        /**
         * 数据源发生变化后, 是否保持之前打开状态
         * * 要求新数据源的父级节点对象仍然是之前的对象
         */
        set keepStatus(value: boolean);
        get keepStatus(): boolean;
        /**
         * 是否只能展开一个项目
         * * 如果为 true, 展开一个项目之后会关闭其它已经展开的项目
         */
        set justOpenOne(value: boolean);
        get justOpenOne(): boolean;
        /**
         * 展开的项目点击其父级项目是否会收起展开
         */
        set allowClose(value: boolean);
        get allowClose(): boolean;
        /**
         * 设置数据源, 子项的字段名为 children 且必须是数组
         * * 无论源数据是否改变, 重新设置都会触发刷新
         */
        set dataProvider(value: any);
        get dataProvider(): any;
        /**
         * 当前选择的项目
         * * 设定之后会展开到当前选择的项目
         */
        set selectedItem(value: any);
        get selectedItem(): any;
        protected commitProperties(): void;
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        private onTap;
        private checkIsSelected;
        getVirtualElementAt(index: number): dou2d.DisplayObject;
        setVirtualElementIndicesInView(startIndex: number, endIndex: number): void;
        /**
         * 展开指定项目但并不选中该项目
         */
        expandItem(item: any): void;
        /**
         * 关闭指定项目如果该项目已经展开
         */
        closeItem(item: any, closeChildren?: boolean): void;
        updateRenderListByDepth(depth: number): void;
    }
}
declare namespace douUI {
    /**
     * 当舞台尺寸发生改变时会跟随舞台尺寸改变的容器, 通常都将它作为 UI 显示列表的根节点
     * @author wizardc
     */
    class UILayer extends Group {
        constructor();
        private onAddToStage;
        private onRemoveFromStage;
        private onResize;
    }
}
declare namespace douUI {
    /**
     * 同一时间只显示一个子项的容器
     * @author wizardc
     */
    class ViewStack extends Group implements ICollection {
        private _selectedChild;
        private _proposedSelectedIndex;
        private _selectedIndex;
        get length(): number;
        /**
         * 当前可见的子项
         */
        set selectedChild(value: dou2d.DisplayObject);
        get selectedChild(): dou2d.DisplayObject;
        /**
         * 当前选择的可见子项的索引
         */
        set selectedIndex(value: number);
        get selectedIndex(): number;
        /**
         * 设置选中项索引
         */
        private setSelectedIndex;
        $childAdded(child: dou2d.DisplayObject, index: number): void;
        $childRemoved(child: dou2d.DisplayObject, index: number): void;
        protected commitProperties(): void;
        private commitSelection;
        private showOrHide;
        getItemAt(index: number): any;
        getItemIndex(item: any): number;
    }
}
declare namespace douUI {
    /**
     * 垂直滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class VScrollBar extends ScrollBarBase {
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
        protected onPropertyChanged(event: dou.Event): void;
    }
}
declare namespace douUI {
    /**
     * 垂直滑块
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class VSlider extends SliderBase {
        protected pointToValue(x: number, y: number): number;
        private getThumbRange;
        updateSkinDisplayList(): void;
    }
}
declare namespace douUI {
    /**
     * 集合更改具体类型
     * @author wizardc
     */
    const enum CollectionEventKind {
        /**
         * 集合添加了一个或多个项目
         */
        add = 0,
        /**
         * 集合应用了排序或筛选
         */
        refresh = 1,
        /**
         * 集合删除了一个或多个项目
         */
        remove = 2,
        /**
         * 已替换确定的位置处的项目
         */
        replace = 3,
        /**
         * 集合已彻底更改需要进行重置
         */
        reset = 4,
        /**
         * 集合中一个或多个项目进行了更新
         */
        update = 5
    }
}
declare namespace douUI.sys {
    const enum UIKeys {
        left = 0,
        right = 1,
        top = 2,
        bottom = 3,
        horizontalCenter = 4,
        verticalCenter = 5,
        percentWidth = 6,
        percentHeight = 7,
        explicitWidth = 8,
        explicitHeight = 9,
        width = 10,
        height = 11,
        minWidth = 12,
        maxWidth = 13,
        minHeight = 14,
        maxHeight = 15,
        measuredWidth = 16,
        measuredHeight = 17,
        oldPreferWidth = 18,
        oldPreferHeight = 19,
        oldX = 20,
        oldY = 21,
        oldWidth = 22,
        oldHeight = 23,
        invalidatePropertiesFlag = 24,
        invalidateSizeFlag = 25,
        invalidateDisplayListFlag = 26,
        layoutWidthExplicitlySet = 27,
        layoutHeightExplicitlySet = 28,
        initialized = 29
    }
    const enum ComponentKeys {
        enabled = 0,
        explicitTouchChildren = 1,
        explicitTouchEnabled = 2,
        skin = 3,
        skinName = 4,
        skinIsDirty = 5,
        explicitState = 6,
        stateIsDirty = 7,
        skinStyle = 8
    }
    const enum GroupKeys {
        contentWidth = 0,
        contentHeight = 1,
        scrollH = 2,
        scrollV = 3,
        scrollEnabled = 4,
        touchThrough = 5
    }
    const enum EditableTextKeys {
        promptText = 0,
        textColorUser = 1,
        asPassword = 2
    }
    const enum RangeKeys {
        maximum = 0,
        maxChanged = 1,
        minimum = 2,
        minChanged = 3,
        value = 4,
        changedValue = 5,
        valueChanged = 6,
        snapInterval = 7,
        snapIntervalChanged = 8,
        explicitSnapInterval = 9
    }
    const enum SliderKeys {
        clickOffsetX = 0,
        clickOffsetY = 1,
        moveStageX = 2,
        moveStageY = 3,
        touchDownTarget = 4,
        pendingValue = 5,
        slideToValue = 6,
        liveDragging = 7
    }
    const enum ScrollerKeys {
        scrollPolicyV = 0,
        scrollPolicyH = 1,
        autoHideTimer = 2,
        touchStartX = 3,
        touchStartY = 4,
        touchMoved = 5,
        horizontalCanScroll = 6,
        verticalCanScroll = 7,
        touchScrollH = 8,
        touchScrollV = 9,
        viewport = 10,
        viewprotRemovedEvent = 11
    }
    const enum DataGroupKeys {
        useVirtualLayout = 0,
        useVirtualLayoutChanged = 1,
        rendererToClassMap = 2,
        freeRenderers = 3,
        createNewRendererFlag = 4,
        itemRendererChanged = 5,
        itemRenderer = 6,
        typicalItemChanged = 7,
        typicalLayoutRect = 8,
        cleanFreeRenderer = 9,
        renderersBeingUpdated = 10,
        typicalItem = 11
    }
    const enum ListBaseKeys {
        requireSelection = 0,
        requireSelectionChanged = 1,
        proposedSelectedIndex = 2,
        selectedIndex = 3,
        dispatchChangeAfterSelection = 4,
        pendingSelectedItem = 5,
        selectedIndexAdjusted = 6,
        touchDownItemRenderer = 7,
        touchCancle = 8
    }
}
declare namespace douUI {
    /**
     * 两端对齐枚举
     * @author wizardc
     */
    const enum JustifyAlign {
        /**
         * 相对于容器对齐子代, 这会将所有子代的大小统一调整为与容器相同的尺寸
         */
        justify = 10,
        /**
         * 相对于容器对子代进行内容对齐, 这会将所有子代的大小统一调整为容器的内容宽度/高度
         * * 容器的内容宽度/高度是最大子代的大小, 如果所有子代都小于容器的宽度/高度, 则会将所有子代的大小调整为容器的宽度/高度
         */
        contentJustify = 11
    }
}
declare namespace douUI {
    /**
     * 列对其枚举
     * @author wizardc
     */
    const enum ColumnAlign {
        /**
         * 不将行两端对齐
         */
        left = 0,
        /**
         * 通过增大水平间隙将行两端对齐
         */
        justifyUsingGap = 1,
        /**
         * 通过增大行高度将行两端对齐
         */
        justifyUsingWidth = 2
    }
}
declare namespace douUI {
    /**
     * RowAlign 类为 TileLayout 类的 <code>rowAlign</code> 属性定义可能的值
     * @author wizardc
     */
    const enum RowAlign {
        /**
         * 不进行两端对齐
         */
        top = 0,
        /**
         * 通过增大垂直间隙将行两端对齐
         */
        justifyUsingGap = 1,
        /**
         * 通过增大行高度将行两端对齐
         */
        justifyUsingHeight = 2
    }
}
declare namespace douUI {
    /**
     * Tile 布局的排列方向枚举
     * @author wizardc
     */
    const enum TileOrientation {
        /**
         * 逐行排列元素
         */
        rows = 0,
        /**
         * 逐列排列元素
         */
        columns = 1
    }
}
declare namespace douUI {
    /**
     * 控件方向枚举
       * @author wizardc
     */
    const enum Direction {
        /**
         * 水平从左到右增长
         */
        ltr = 0,
        /**
         * 水平从右到左增长
         */
        rtl = 1,
        /**
         * 竖直从上到下增长
         */
        ttb = 2,
        /**
         * 竖直从下到上增长
         */
        btt = 3
    }
}
declare namespace douUI {
    /**
     * 滚动条显示策略枚举
     * @author wizardc
     */
    const enum ScrollPolicy {
        /**
         * 如果子项超出父级的尺寸, 则允许滚动反之不允许滚动
         */
        auto = 0,
        /**
         * 从不允许滚动
         */
        off = 1,
        /**
         * 总是允许滚动
         */
        on = 2
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出集合数据改变事件
         */
        dispatchCollectionEvent(type: string, kind?: douUI.CollectionEventKind, location?: number, oldLocation?: number, items?: any[], oldItems?: any[], cancelable?: boolean): boolean;
    }
}
declare namespace douUI {
    /**
     * 集合数据改变事件
     * @author wizardc
     */
    class CollectionEvent extends dou.Event {
        static COLLECTION_CHANGE: string;
        private _kind;
        private _location;
        private _oldLocation;
        private _items;
        private _oldItems;
        /**
         * 发生的事件类型
         */
        get kind(): CollectionEventKind;
        /**
         * 如果 kind 值为 CollectionEventKind.ADD, CollectionEventKind.REMOVE, CollectionEventKind.REPLACE, CollectionEventKind.UPDATE,
         * 则此属性为 items 属性中指定的项目集合中零号元素的的索引
         */
        get location(): number;
        /**
         * 此属性为 items 属性中指定的项目在目标集合中原来位置的从零开始的索引
         */
        get oldLocation(): number;
        /**
         * 受事件影响的项目的列表
         */
        get items(): any[];
        /**
         * 仅当 kind 的值为 CollectionEventKind.REPLACE 时, 表示替换前的项目列表
         */
        get oldItems(): any[];
        $initCollectionEvent(type: string, cancelable?: boolean, kind?: CollectionEventKind, location?: number, oldLocation?: number, items?: any[], oldItems?: any[]): void;
        onRecycle(): void;
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出列表项触碰事件
         */
        dispatchItemTapEvent(type: string, itemRenderer?: douUI.IItemRenderer): boolean;
    }
}
declare namespace douUI {
    /**
     * 列表项触碰事件
     * @author wizardc
     */
    class ItemTapEvent extends dou2d.Event2D {
        /**
         * 列表项触碰
         */
        static ITEM_TAP: string;
        private _item;
        private _itemRenderer;
        private _itemIndex;
        /**
         * 触发触摸事件的项呈示器数据源项
         */
        get item(): any;
        /**
         * 触发触摸事件的项呈示器
         */
        get itemRenderer(): IItemRenderer;
        /**
         * 触发触摸事件的项索引
         */
        get itemIndex(): number;
        $initItemTapEvent(type: string, itemRenderer?: IItemRenderer): void;
        onRecycle(): void;
    }
}
declare module dou {
    interface EventDispatcher {
        /**
         * 抛出 UI 事件
         */
        dispatchUIEvent(type: string, bubbles?: boolean, cancelable?: boolean): boolean;
    }
}
declare namespace douUI {
    /**
     * UI 事件
     * @author wizardc
     */
    class UIEvent extends dou2d.Event2D {
        /**
         * 组件创建完成
         */
        static CREATION_COMPLETE: string;
        /**
         * UI组件在父级容器中的坐标发生改变事件
         */
        static MOVE: string;
        /**
         * 改变开始
         */
        static CHANGE_START: string;
        /**
         * 改变结束
         */
        static CHANGE_END: string;
        /**
         * 即将关闭面板事件
         */
        static CLOSING: string;
        $initUIEvent(type: string, bubbles?: boolean, cancelable?: boolean): void;
    }
}
declare namespace douUI {
    /**
     * 布局基类
     * @author wizardc
     */
    abstract class LayoutBase extends dou.EventDispatcher {
        protected _target: Group;
        protected _useVirtualLayout: boolean;
        protected _typicalWidth: number;
        protected _typicalHeight: number;
        /**
         * 此布局将测量其元素, 调整其元素的大小并定位其元素的 Group 容器
         */
        set target(value: Group);
        get target(): Group;
        /**
         * 是否使用虚拟布局
         */
        set useVirtualLayout(value: boolean);
        get useVirtualLayout(): boolean;
        /**
         * 设置一个典型元素的大小
         */
        setTypicalSize(width: number, height: number): void;
        scrollPositionChanged(): void;
        clearVirtualLayoutCache(): void;
        elementAdded(index: number): void;
        elementRemoved(index: number): void;
        getElementIndicesInView(): number[];
        /**
         * 基于目标的内容测量其默认大小
         */
        measure(): void;
        /**
         * 调整目标的元素的大小并定位这些元素
         */
        updateDisplayList(width: number, height: number): void;
    }
}
declare namespace douUI {
    /**
     * 线性布局基类
     * @author wizardc
     */
    abstract class LinearLayoutBase extends LayoutBase {
        protected _horizontalAlign: dou2d.HorizontalAlign | JustifyAlign;
        protected _verticalAlign: dou2d.VerticalAlign | JustifyAlign;
        protected _gap: number;
        protected _paddingLeft: number;
        protected _paddingRight: number;
        protected _paddingTop: number;
        protected _paddingBottom: number;
        /**
         * 虚拟布局使用的尺寸缓存
         */
        protected _elementSizeTable: number[];
        /**
         * 虚拟布局使用的当前视图中的第一个元素索引
         */
        protected _startIndex: number;
        /**
         * 虚拟布局使用的当前视图中的最后一个元素的索引
         */
        protected _endIndex: number;
        /**
         * 视图的第一个和最后一个元素的索引值已经计算好的标志
         */
        protected _indexInViewCalculated: boolean;
        /**
         * 子元素最大的尺寸
         */
        protected _maxElementSize: number;
        constructor();
        /**
         * 布局元素的水平对齐策略
         */
        set horizontalAlign(value: dou2d.HorizontalAlign | JustifyAlign);
        get horizontalAlign(): dou2d.HorizontalAlign | JustifyAlign;
        /**
         * 布局元素的垂直对齐策略
         */
        set verticalAlign(value: dou2d.VerticalAlign | JustifyAlign);
        get verticalAlign(): dou2d.VerticalAlign | JustifyAlign;
        /**
         * 布局元素之间的间隔
         */
        set gap(value: number);
        get gap(): number;
        /**
         * 容器的左边缘与第一个布局元素的左边缘之间的像素数
         */
        set paddingLeft(value: number);
        get paddingLeft(): number;
        /**
         * 容器的右边缘与最后一个布局元素的右边缘之间的像素数
         */
        set paddingRight(value: number);
        get paddingRight(): number;
        /**
         * 容器的顶边缘与所有容器的布局元素的顶边缘之间的最少像素数
         */
        set paddingTop(value: number);
        get paddingTop(): number;
        /**
         * 容器的底边缘与所有容器的布局元素的底边缘之间的最少像素数
         */
        set paddingBottom(value: number);
        get paddingBottom(): number;
        /**
         * 失效目标容器的尺寸和显示列表的简便方法
         */
        protected invalidateTargetLayout(): void;
        measure(): void;
        /**
         * 计算目标容器 measuredWidth 和 measuredHeight 的精确值
         */
        protected measureReal(): void;
        /**
         * 计算目标容器 measuredWidth 和 measuredHeight 的近似值
         */
        protected measureVirtual(): void;
        updateDisplayList(width: number, height: number): void;
        /**
         * 获取指定索引元素的起始位置
         */
        protected getStartPosition(index: number): number;
        /**
         * 获取指定索引元素的尺寸
         */
        protected getElementSize(index: number): number;
        /**
         * 获取缓存的子对象尺寸总和
         */
        protected getElementTotalSize(): number;
        elementRemoved(index: number): void;
        clearVirtualLayoutCache(): void;
        /**
         * 折半查找法寻找指定位置的显示对象索引
         */
        protected findIndexAt(x: number, i0: number, i1: number): number;
        scrollPositionChanged(): void;
        /**
         * 获取视图中第一个和最后一个元素的索引, 返回是否发生改变
         */
        protected getIndexInView(): boolean;
        /**
         * 更新虚拟布局的显示列表
         */
        protected updateDisplayListVirtual(width: number, height: number): void;
        /**
         * 更新真实布局的显示列表
         */
        protected updateDisplayListReal(width: number, height: number): void;
        /**
         * 为每个可变尺寸的子项分配空白区域
         */
        protected flexChildrenProportionally(spaceForChildren: number, spaceToDistribute: number, totalPercent: number, childInfoArray: sys.ChildInfo[]): void;
    }
}
declare namespace douUI.sys {
    /**
     * 子项信息
     * @author wizardc
     */
    class ChildInfo {
        layoutElement: IUIComponent;
        size: number;
        percent: number;
        min: number;
        max: number;
    }
}
declare namespace douUI {
    /**
     * 基础布局类, 子项可以任意布局
     * @author wizardc
     */
    class BasicLayout extends LayoutBase {
        /**
         * 不支持虚拟布局, 设置这个属性无效
         */
        useVirtualLayout: boolean;
        measure(): void;
        updateDisplayList(unscaledWidth: number, unscaledHeight: number): void;
    }
}
declare namespace douUI {
    /**
     * 水平布局类
     * @author wizardc
     */
    class HorizontalLayout extends LinearLayoutBase {
        protected measureReal(): void;
        protected measureVirtual(): void;
        protected updateDisplayListReal(width: number, height: number): void;
        protected updateDisplayListVirtual(width: number, height: number): void;
        protected getStartPosition(index: number): number;
        protected getElementSize(index: number): number;
        protected getElementTotalSize(): number;
        elementAdded(index: number): void;
        protected getIndexInView(): boolean;
    }
}
declare namespace douUI {
    /**
     * 垂直布局类
     * @author wizardc
     */
    class VerticalLayout extends LinearLayoutBase {
        protected measureReal(): void;
        protected measureVirtual(): void;
        protected updateDisplayListReal(width: number, height: number): void;
        protected updateDisplayListVirtual(width: number, height: number): void;
        protected getStartPosition(index: number): number;
        protected getElementSize(index: number): number;
        protected getElementTotalSize(): number;
        elementAdded(index: number): void;
        protected getIndexInView(): boolean;
    }
}
declare namespace douUI {
    /**
     * 单元格布局类
     * @author wizardc
     */
    class TileLayout extends LayoutBase {
        private _explicitHorizontalGap;
        private _horizontalGap;
        private _explicitVerticalGap;
        private _verticalGap;
        private _columnCount;
        private _requestedColumnCount;
        private _rowCount;
        private _requestedRowCount;
        private _explicitColumnWidth;
        private _columnWidth;
        private _explicitRowHeight;
        private _rowHeight;
        private _paddingLeft;
        private _paddingRight;
        private _paddingTop;
        private _paddingBottom;
        private _horizontalAlign;
        private _verticalAlign;
        private _columnAlign;
        private _rowAlign;
        private _orientation;
        /**
         * 当前视图中的第一个元素索引
         */
        private _startIndex;
        /**
         * 当前视图中的最后一个元素的索引
         */
        private _endIndex;
        /**
         * 视图的第一个和最后一个元素的索引值已经计算好的标志
         */
        private _indexInViewCalculated;
        /**
         * 缓存的最大子对象宽度
         */
        private _maxElementWidth;
        /**
         * 缓存的最大子对象高度
         */
        private _maxElementHeight;
        /**
         * 列之间的水平空间
         */
        set horizontalGap(value: number);
        get horizontalGap(): number;
        /**
         * 行之间的垂直空间
         */
        set verticalGap(value: number);
        get verticalGap(): number;
        /**
         *  列计数
         */
        get columnCount(): number;
        /**
         * 要显示的列数
         * * 设置为 0 会允许 TileLayout 自动确定列计数
         */
        set requestedColumnCount(value: number);
        get requestedColumnCount(): number;
        /**
         *  行计数
         */
        get rowCount(): number;
        /**
         * 要显示的行数
         * * 设置为 -1 会删除显式覆盖并允许 TileLayout 自动确定行计数
         */
        set requestedRowCount(value: number);
        get requestedRowCount(): number;
        /**
         * 列宽
         */
        set columnWidth(value: number);
        get columnWidth(): number;
        /**
         * 行高
         */
        set rowHeight(value: number);
        get rowHeight(): number;
        set paddingTop(value: number);
        get paddingTop(): number;
        set paddingBottom(value: number);
        get paddingBottom(): number;
        set paddingLeft(value: number);
        get paddingLeft(): number;
        set paddingRight(value: number);
        get paddingRight(): number;
        /**
         * 指定如何在水平方向上对齐单元格内的元素
         */
        set horizontalAlign(value: dou2d.HorizontalAlign | JustifyAlign);
        get horizontalAlign(): dou2d.HorizontalAlign | JustifyAlign;
        /**
         * 指定如何在垂直方向上对齐单元格内的元素
         */
        set verticalAlign(value: dou2d.VerticalAlign | JustifyAlign);
        get verticalAlign(): dou2d.VerticalAlign | JustifyAlign;
        /**
         * 指定如何将完全可见列与容器宽度对齐
         */
        set columnAlign(value: ColumnAlign);
        get columnAlign(): ColumnAlign;
        /**
         * 指定如何将完全可见行与容器高度对齐
         */
        set rowAlign(value: RowAlign);
        get rowAlign(): RowAlign;
        /**
         * 指定是逐行还是逐列排列元素
         */
        set orientation(value: TileOrientation);
        get orientation(): TileOrientation;
        /**
         * 标记目标容器的尺寸和显示列表失效
         */
        private invalidateTargetLayout;
        measure(): void;
        /**
         * 计算行和列的尺寸及数量
         */
        private calculateRowAndColumn;
        /**
         * 更新最大子对象尺寸
         */
        private updateMaxElementSize;
        /**
         * 更新虚拟布局的最大子对象尺寸
         */
        private doUpdateMaxElementSize;
        clearVirtualLayoutCache(): void;
        scrollPositionChanged(): void;
        /**
         * 获取视图中第一个和最后一个元素的索引, 返回是否发生改变
         */
        private getIndexInView;
        updateDisplayList(width: number, height: number): void;
        /**
         * 为单个元素布局
         */
        private sizeAndPositionElement;
        /**
         * 为两端对齐调整间隔或格子尺寸
         */
        private adjustForJustify;
    }
}
declare namespace douUI {
    /**
     * 皮肤接口
     * @author wizardc
     */
    interface ISkin {
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
declare namespace douUI {
    /**
     * 皮肤基类
     * @author wizardc
     */
    abstract class SkinBase implements ISkin {
        protected _target: Component;
        protected _width: number;
        protected _minWidth: number;
        protected _maxWidth: number;
        protected _height: number;
        protected _minHeight: number;
        protected _maxHeight: number;
        protected _skinCreated: boolean;
        constructor(target: Component, size?: {
            width?: number;
            minWidth?: number;
            maxWidth?: number;
            height?: number;
            minHeight?: number;
            maxHeight?: number;
        });
        get width(): number;
        get minWidth(): number;
        get maxWidth(): number;
        get height(): number;
        get minHeight(): number;
        get maxHeight(): number;
        /**
         * 将特定的实例绑定到目标对象的指定属性上
         */
        protected bindToTarget(attributeName: string, instance: dou2d.DisplayObject): void;
        onCreateSkin(): void;
        protected abstract createSkin(): void;
        onApply(): void;
        protected abstract apply(): void;
        onUnload(): void;
        protected abstract unload(): void;
        setState(state: string): void;
    }
}
declare namespace douUI {
    /**
     * 主题管理器
     * @author wizardc
     */
    namespace Theme {
        /**
         * 注册组件默认皮肤
         */
        function registerDefaultSkin(component: {
            new (): Component;
        }, skinClass: {
            new (...args: any[]): ISkin;
        }): void;
        /**
         * 获取指定组件的默认皮肤类
         */
        function getDefaultSkin(component: {
            new (): Component;
        }): {
            new (...args: any[]): ISkin;
        };
        /**
         * 注册皮肤别名
         */
        function registerSkin(skinName: string, skinClass: {
            new (...args: any[]): ISkin;
        }): void;
        /**
         * 获取指定组件的皮肤类
         */
        function getSkin(skinName: string): {
            new (...args: any[]): ISkin;
        };
    }
}
declare namespace douUI.sys {
    /**
     * 矩阵工具类
     * @author wizardc
     */
    namespace MatrixUtil {
        function isDeltaIdentity(m: dou2d.Matrix): boolean;
        function fitBounds(width: number, height: number, matrix: dou2d.Matrix, explicitWidth: number, explicitHeight: number, preferredWidth: number, preferredHeight: number, minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): dou.Recyclable<dou2d.Point>;
    }
}
declare namespace douUI {
    /**
     * 树形组件工具类
     * @author wizardc
     */
    namespace TreeUtil {
        /**
         * 获取树组件数据源
         * @param source 如果有子项需要有 children 字段来表示
         */
        function getTree(source: any): ITreeDataCollection;
        function forEach(treeData: ITreeDataCollection, ignoreClose: boolean, callback: (value: ITreeDataCollection) => void, thisObj?: any): void;
        function getTreeData(source: ITreeDataCollection, data: any): ITreeDataCollection;
        function expand(target: ITreeDataCollection): void;
    }
}

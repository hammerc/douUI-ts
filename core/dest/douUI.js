(function () {
    let f, p;
    f = dou.Event;
    f.CHANGING = "changing";
    f.PROPERTY_CHANGE = "propertyChange";
    f = dou2d.Event2D;
    f.ITEM_TAP = "itemTap";
    f.RICH_TEXT_CHANGE = "richTextChange";
    f = dou2d.TouchEvent;
    f.TOUCH_CANCEL = "touchCancel";
})();
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 自定义类实现 IUIComponent 的步骤:
         * 1. 在自定义类的构造函数里调用: this.initializeUIValues();
         * 2. 拷贝 IUIComponent 接口定义的所有内容 (包括注释掉的 protected 函数) 到自定义类, 将所有子类需要覆盖的方法都声明为空方法体
         * 3. 在定义类结尾的外部调用 implementUIComponent(), 并传入自定义类
         * 4. 若覆盖了某个 IUIComponent 的方法, 需要手动调用 UIComponentImpl.prototype["方法名"].call(this);
         * @param descendant 自定义的 IUIComponent 子类
         * @param base 自定义子类继承的父类
         */
        function implementUIComponent(descendant, base, isContainer) {
            mixin(descendant, douUI.sys.UIComponentImpl);
            let prototype = descendant.prototype;
            prototype.$super = base.prototype;
            if (isContainer) {
                prototype.$childAdded = function (child, index) {
                    this.invalidateSize();
                    this.invalidateDisplayList();
                };
                prototype.$childRemoved = function (child, index) {
                    this.invalidateSize();
                    this.invalidateDisplayList();
                };
            }
        }
        sys.implementUIComponent = implementUIComponent;
        /**
         * 拷贝模板类的方法体和属性到目标类上
         * @param target 目标类
         * @param template 模板类
         */
        function mixin(target, template) {
            for (let property in template) {
                if (property != "prototype" && template.hasOwnProperty(property)) {
                    target[property] = template[property];
                }
            }
            let prototype = target.prototype;
            let protoBase = template.prototype;
            let keys = Object.getOwnPropertyNames(protoBase);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let key = keys[i];
                if (key == "__meta__") {
                    continue;
                }
                if (!prototype.hasOwnProperty(key) || isEmptyFunction(prototype, key)) {
                    let value = Object.getOwnPropertyDescriptor(protoBase, key);
                    Object.defineProperty(prototype, key, value);
                }
            }
        }
        sys.mixin = mixin;
        /**
         * 检查一个函数的方法体是否为空
         */
        function isEmptyFunction(prototype, key) {
            if (typeof prototype[key] != "function") {
                return false;
            }
            let body = prototype[key].toString();
            let index = body.indexOf("{");
            let lastIndex = body.lastIndexOf("}");
            body = body.substring(index + 1, lastIndex);
            return body.trim() == "";
        }
        /**
         * 检测指定对象是否实现了 IUIComponent 接口
         */
        function isIUIComponent(obj) {
            return obj.__interface_type__ === "douUI.sys.IUIComponent";
        }
        sys.isIUIComponent = isIUIComponent;
        function formatRelative(value, total) {
            if (!value || typeof value == "number") {
                return value;
            }
            let str = value;
            let index = str.indexOf("%");
            if (index == -1) {
                return +str;
            }
            let percent = +str.substring(0, index);
            return percent * 0.01 * total;
        }
        /**
         * 使用 BasicLayout 规则测量目标对象
         */
        function measure(target) {
            if (!target) {
                return;
            }
            let width = 0;
            let height = 0;
            let bounds = dou.recyclable(dou2d.Rectangle);
            let count = target.numChildren;
            for (let i = 0; i < count; i++) {
                let layoutElement = (target.getChildAt(i));
                if (!isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                let values = layoutElement.$UIComponent;
                let hCenter = +values[4 /* horizontalCenter */];
                let vCenter = +values[5 /* verticalCenter */];
                let left = +values[0 /* left */];
                let right = +values[1 /* right */];
                let top = +values[2 /* top */];
                let bottom = +values[3 /* bottom */];
                let extX;
                let extY;
                layoutElement.getPreferredBounds(bounds);
                if (!isNaN(left) && !isNaN(right)) {
                    extX = left + right;
                }
                else if (!isNaN(hCenter)) {
                    extX = Math.abs(hCenter) * 2;
                }
                else if (!isNaN(left) || !isNaN(right)) {
                    extX = isNaN(left) ? 0 : left;
                    extX += isNaN(right) ? 0 : right;
                }
                else {
                    extX = bounds.x;
                }
                if (!isNaN(top) && !isNaN(bottom)) {
                    extY = top + bottom;
                }
                else if (!isNaN(vCenter)) {
                    extY = Math.abs(vCenter) * 2;
                }
                else if (!isNaN(top) || !isNaN(bottom)) {
                    extY = isNaN(top) ? 0 : top;
                    extY += isNaN(bottom) ? 0 : bottom;
                }
                else {
                    extY = bounds.y;
                }
                let preferredWidth = bounds.width;
                let preferredHeight = bounds.height;
                width = Math.ceil(Math.max(width, extX + preferredWidth));
                height = Math.ceil(Math.max(height, extY + preferredHeight));
            }
            target.setMeasuredSize(width, height);
        }
        sys.measure = measure;
        /**
         * 使用 BasicLayout 规则布局目标对象
         */
        function updateDisplayList(target, unscaledWidth, unscaledHeight) {
            if (!target) {
                return;
            }
            let count = target.numChildren;
            let maxX = 0;
            let maxY = 0;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (let i = 0; i < count; i++) {
                let layoutElement = (target.getChildAt(i));
                if (!isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                let values = layoutElement.$UIComponent;
                let hCenter = formatRelative(values[4 /* horizontalCenter */], unscaledWidth * 0.5);
                let vCenter = formatRelative(values[5 /* verticalCenter */], unscaledHeight * 0.5);
                let left = formatRelative(values[0 /* left */], unscaledWidth);
                let right = formatRelative(values[1 /* right */], unscaledWidth);
                let top = formatRelative(values[2 /* top */], unscaledHeight);
                let bottom = formatRelative(values[3 /* bottom */], unscaledHeight);
                let percentWidth = values[6 /* percentWidth */];
                let percentHeight = values[7 /* percentHeight */];
                let childWidth = NaN;
                let childHeight = NaN;
                if (!isNaN(left) && !isNaN(right)) {
                    childWidth = unscaledWidth - right - left;
                }
                else if (!isNaN(percentWidth)) {
                    childWidth = Math.round(unscaledWidth * Math.min(percentWidth * 0.01, 1));
                }
                if (!isNaN(top) && !isNaN(bottom)) {
                    childHeight = unscaledHeight - bottom - top;
                }
                else if (!isNaN(percentHeight)) {
                    childHeight = Math.round(unscaledHeight * Math.min(percentHeight * 0.01, 1));
                }
                layoutElement.setLayoutBoundsSize(childWidth, childHeight);
                layoutElement.getLayoutBounds(bounds);
                let elementWidth = bounds.width;
                let elementHeight = bounds.height;
                let childX = NaN;
                let childY = NaN;
                if (!isNaN(hCenter)) {
                    childX = Math.round((unscaledWidth - elementWidth) / 2 + hCenter);
                }
                else if (!isNaN(left)) {
                    childX = left;
                }
                else if (!isNaN(right)) {
                    childX = unscaledWidth - elementWidth - right;
                }
                else {
                    childX = bounds.x;
                }
                if (!isNaN(vCenter)) {
                    childY = Math.round((unscaledHeight - elementHeight) / 2 + vCenter);
                }
                else if (!isNaN(top)) {
                    childY = top;
                }
                else if (!isNaN(bottom)) {
                    childY = unscaledHeight - elementHeight - bottom;
                }
                else {
                    childY = bounds.y;
                }
                layoutElement.setLayoutBoundsPosition(childX, childY);
                maxX = Math.max(maxX, childX + elementWidth);
                maxY = Math.max(maxY, childY + elementHeight);
            }
            bounds.recycle();
            let point = dou.recyclable(dou2d.Point);
            return point.set(maxX, maxY);
        }
        sys.updateDisplayList = updateDisplayList;
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 默认的资源加载实现
     * * 可根据需要编写自己的资源加载器
     * @author wizardc
     */
    class DefaultAssetAdapter {
        getAsset(source, callBack, thisObject) {
            if (dou2d.asset.hasRes(source)) {
                dou2d.asset.loadRes(source, 0, callBack, thisObject);
            }
            else {
                dou.loader.load(source, callBack, thisObject);
            }
        }
    }
    douUI.DefaultAssetAdapter = DefaultAssetAdapter;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 获取资源
     */
    function getAsset(source, callBack, thisObject) {
        let assetAdapter = dou2d.getImplementation("AssetAdapter");
        assetAdapter.getAsset(source, callBack, thisObject);
    }
    douUI.getAsset = getAsset;
    dou2d.registerImplementation("AssetAdapter", new douUI.DefaultAssetAdapter());
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 集合类数据源接
     * @author wizardc
     */
    class ArrayCollection extends dou.EventDispatcher {
        constructor(source) {
            super();
            if (source) {
                this._source = source;
            }
            else {
                this._source = [];
            }
        }
        /**
         * 数据源
         * * 通常情况下请不要直接调用 Array 的方法操作数据源, 否则对应的视图无法收到数据改变的通知, 若对数据源进行了修改, 请手动调用 refresh 方法刷新数据
         */
        set source(value) {
            if (!value) {
                value = [];
            }
            this._source = value;
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 4 /* reset */);
        }
        get source() {
            return this._source;
        }
        /**
         * 此集合中的项目数
         */
        get length() {
            return this._source.length;
        }
        /**
         * 向列表末尾添加指定项目
         * @param item 要被添加的项
         */
        addItem(item) {
            this._source.push(item);
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 0 /* add */, this._source.length - 1, -1, [item]);
        }
        /**
         * 在指定的索引处添加项目
         * @param item 要添加的项
         * @param index 要添加的指定索引位置
         */
        addItemAt(item, index) {
            if (index < 0 || index > this._source.length) {
                console.error(`索引不在范围内`);
            }
            this._source.splice(index, 0, item);
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 0 /* add */, index, -1, [item]);
        }
        /**
         * 获取指定索引处的项目
         */
        getItemAt(index) {
            return this._source[index];
        }
        /**
         * 如果项目位于列表中, 返回该项目的索引, 否则返回 -1
         */
        getItemIndex(item) {
            let length = this._source.length;
            for (let i = 0; i < length; i++) {
                if (this._source[i] === item) {
                    return i;
                }
            }
            return -1;
        }
        /**
         * 通知视图某个项目的属性已更新
         * @param item 视图中需要被更新的项
         */
        itemUpdated(item) {
            let index = this.getItemIndex(item);
            if (index != -1) {
                this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 5 /* update */, index, -1, [item]);
            }
        }
        /**
         * 替换在指定索引处的项目, 并返回该项目
         * @param item 要在指定索引放置的新的项
         * @param index 要被替换的项的索引位置
         * @return 被替换的项目
         */
        replaceItemAt(item, index) {
            if (index < 0 || index >= this._source.length) {
                console.error(`索引不在范围内`);
                return;
            }
            let oldItem = this._source.splice(index, 1, item)[0];
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 3 /* replace */, index, -1, [item], [oldItem]);
            return oldItem;
        }
        /**
         * 用新数据源替换原始数据源, 此方法与直接设置 source 不同, 它不会导致目标视图重置滚动位置
         */
        replaceAll(newSource) {
            if (!newSource) {
                newSource = [];
            }
            let newLength = newSource.length;
            let oldLength = this._source.length;
            for (let i = newLength; i < oldLength; i++) {
                this.removeItemAt(newLength);
            }
            for (let i = 0; i < newLength; i++) {
                if (i >= oldLength) {
                    this.addItemAt(newSource[i], i);
                }
                else {
                    this.replaceItemAt(newSource[i], i);
                }
            }
            this._source = newSource;
        }
        /**
         * 删除指定索引处的项目并返回该项目, 原先位于此索引之后的所有项目的索引现在都向前移动一个位置
         * @param index 要被移除的项的索引
         * @return 被移除的项
         */
        removeItemAt(index) {
            if (index < 0 || index >= this._source.length) {
                console.error(`索引不在范围内`);
                return;
            }
            let item = this._source.splice(index, 1)[0];
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 2 /* remove */, index, -1, [item]);
            return item;
        }
        /**
         * 删除列表中的所有项目
         */
        removeAll() {
            let items = this._source.concat();
            this._source = [];
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 2 /* remove */, 0, -1, items);
        }
        /**
         * 在对数据源进行排序或过滤操作后可以手动调用此方法刷新所有数据, 以更新视图
         * * ArrayCollection 不会自动检原始数据进行了改变, 所以你必须调用该方法去更新显示
         */
        refresh() {
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 1 /* refresh */);
        }
    }
    douUI.ArrayCollection = ArrayCollection;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 失效验证管理器
         * @author wizardc
         */
        class Validator extends dou.EventDispatcher {
            constructor() {
                super(...arguments);
                this._targetLevel = Number.POSITIVE_INFINITY;
                this._invalidatePropertiesFlag = false;
                this._invalidateClientPropertiesFlag = false;
                this._invalidatePropertiesQueue = new DepthQueue();
                this._invalidateSizeFlag = false;
                this._invalidateClientSizeFlag = false;
                this._invalidateSizeQueue = new DepthQueue();
                this._invalidateDisplayListFlag = false;
                this._invalidateDisplayListQueue = new DepthQueue();
                this._eventDisplay = new dou2d.Bitmap();
                /**
                 * 是否已经添加了事件监听
                 */
                this._listenersAttached = false;
            }
            /**
             * 标记组件属性失效
             */
            invalidateProperties(client) {
                if (!this._invalidatePropertiesFlag) {
                    this._invalidatePropertiesFlag = true;
                    if (!this._listenersAttached) {
                        this.attachListeners();
                    }
                }
                if (this._targetLevel <= client.$nestLevel) {
                    this._invalidateClientPropertiesFlag = true;
                }
                this._invalidatePropertiesQueue.insert(client);
            }
            /**
             * 验证失效的属性
             */
            validateProperties() {
                let queue = this._invalidatePropertiesQueue;
                let client = queue.shift();
                while (client) {
                    if (client.stage) {
                        client.validateProperties();
                    }
                    client = queue.shift();
                }
                if (queue.isEmpty()) {
                    this._invalidatePropertiesFlag = false;
                }
            }
            /**
             * 标记需要重新测量尺寸
             */
            invalidateSize(client) {
                if (!this._invalidateSizeFlag) {
                    this._invalidateSizeFlag = true;
                    if (!this._listenersAttached) {
                        this.attachListeners();
                    }
                }
                if (this._targetLevel <= client.$nestLevel) {
                    this._invalidateClientSizeFlag = true;
                }
                this._invalidateSizeQueue.insert(client);
            }
            /**
             * 测量尺寸
             */
            validateSize() {
                let queue = this._invalidateSizeQueue;
                let client = queue.pop();
                while (client) {
                    if (client.stage) {
                        client.validateSize();
                    }
                    client = queue.pop();
                }
                if (queue.isEmpty()) {
                    this._invalidateSizeFlag = false;
                }
            }
            /**
             * 标记需要重新布局
             */
            invalidateDisplayList(client) {
                if (!this._invalidateDisplayListFlag) {
                    this._invalidateDisplayListFlag = true;
                    if (!this._listenersAttached) {
                        this.attachListeners();
                    }
                }
                this._invalidateDisplayListQueue.insert(client);
            }
            /**
             * 重新布局
             */
            validateDisplayList() {
                let queue = this._invalidateDisplayListQueue;
                let client = queue.shift();
                while (client) {
                    if (client.stage) {
                        client.validateDisplayList();
                    }
                    client = queue.shift();
                }
                if (queue.isEmpty()) {
                    this._invalidateDisplayListFlag = false;
                }
            }
            /**
             * 添加事件监听
             */
            attachListeners() {
                this._eventDisplay.on(dou2d.Event2D.ENTER_FRAME, this.doPhasedInstantiationCallBack, this);
                this._eventDisplay.on(dou2d.Event2D.RENDER, this.doPhasedInstantiationCallBack, this);
                dou2d.$2d.stage.invalidate();
                this._listenersAttached = true;
            }
            /**
             * 执行属性应用
             */
            doPhasedInstantiationCallBack(event) {
                this._eventDisplay.off(dou2d.Event2D.ENTER_FRAME, this.doPhasedInstantiationCallBack, this);
                this._eventDisplay.off(dou2d.Event2D.RENDER, this.doPhasedInstantiationCallBack, this);
                this.doPhasedInstantiation();
            }
            doPhasedInstantiation() {
                if (this._invalidatePropertiesFlag) {
                    this.validateProperties();
                }
                if (this._invalidateSizeFlag) {
                    this.validateSize();
                }
                if (this._invalidateDisplayListFlag) {
                    this.validateDisplayList();
                }
                if (this._invalidatePropertiesFlag ||
                    this._invalidateSizeFlag ||
                    this._invalidateDisplayListFlag) {
                    this.attachListeners();
                }
                else {
                    this._listenersAttached = false;
                }
            }
            /**
             * 使大于等于指定组件层级的元素立即应用属性
             * @param target 要立即应用属性的组件
             */
            validateClient(target) {
                let obj;
                let done = false;
                let oldTargetLevel = this._targetLevel;
                if (this._targetLevel === Number.POSITIVE_INFINITY) {
                    this._targetLevel = target.$nestLevel;
                }
                let propertiesQueue = this._invalidatePropertiesQueue;
                let sizeQueue = this._invalidateSizeQueue;
                let displayListQueue = this._invalidateDisplayListQueue;
                while (!done) {
                    done = true;
                    obj = propertiesQueue.removeSmallestChild(target);
                    while (obj) {
                        if (obj.stage) {
                            obj.validateProperties();
                        }
                        obj = propertiesQueue.removeSmallestChild(target);
                    }
                    if (propertiesQueue.isEmpty()) {
                        this._invalidatePropertiesFlag = false;
                    }
                    this._invalidateClientPropertiesFlag = false;
                    obj = sizeQueue.removeLargestChild(target);
                    while (obj) {
                        if (obj.stage) {
                            obj.validateSize();
                        }
                        if (this._invalidateClientPropertiesFlag) {
                            obj = (propertiesQueue.removeSmallestChild(target));
                            if (obj) {
                                propertiesQueue.insert(obj);
                                done = false;
                                break;
                            }
                        }
                        obj = sizeQueue.removeLargestChild(target);
                    }
                    if (sizeQueue.isEmpty()) {
                        this._invalidateSizeFlag = false;
                    }
                    this._invalidateClientPropertiesFlag = false;
                    this._invalidateClientSizeFlag = false;
                    obj = displayListQueue.removeSmallestChild(target);
                    while (obj) {
                        if (obj.stage) {
                            obj.validateDisplayList();
                        }
                        if (this._invalidateClientPropertiesFlag) {
                            obj = propertiesQueue.removeSmallestChild(target);
                            if (obj) {
                                propertiesQueue.insert(obj);
                                done = false;
                                break;
                            }
                        }
                        if (this._invalidateClientSizeFlag) {
                            obj = sizeQueue.removeLargestChild(target);
                            if (obj) {
                                sizeQueue.insert(obj);
                                done = false;
                                break;
                            }
                        }
                        obj = displayListQueue.removeSmallestChild(target);
                    }
                    if (displayListQueue.isEmpty()) {
                        this._invalidateDisplayListFlag = false;
                    }
                }
                if (oldTargetLevel === Number.POSITIVE_INFINITY) {
                    this._targetLevel = Number.POSITIVE_INFINITY;
                }
            }
        }
        sys.Validator = Validator;
        /**
         * 显示列表嵌套深度排序队列
         * @author wizardc
         */
        class DepthQueue {
            constructor() {
                /**
                 * 最小深度
                 */
                this.minDepth = 0;
                /**
                 * 最大深度
                 */
                this.maxDepth = -1;
                this.depthBins = {};
            }
            /**
             * 插入一个元素
             */
            insert(client) {
                let depth = client.$nestLevel;
                if (this.maxDepth < this.minDepth) {
                    this.minDepth = this.maxDepth = depth;
                }
                else {
                    if (depth < this.minDepth) {
                        this.minDepth = depth;
                    }
                    if (depth > this.maxDepth) {
                        this.maxDepth = depth;
                    }
                }
                let bin = this.depthBins[depth];
                if (!bin) {
                    bin = this.depthBins[depth] = new DepthBin();
                }
                bin.insert(client);
            }
            /**
             * 从队列尾弹出深度最大的一个对象
             */
            pop() {
                let client;
                let minDepth = this.minDepth;
                if (minDepth <= this.maxDepth) {
                    let bin = this.depthBins[this.maxDepth];
                    while (!bin || bin.length === 0) {
                        this.maxDepth--;
                        if (this.maxDepth < minDepth) {
                            return null;
                        }
                        bin = this.depthBins[this.maxDepth];
                    }
                    client = bin.pop();
                    while (!bin || bin.length == 0) {
                        this.maxDepth--;
                        if (this.maxDepth < minDepth) {
                            break;
                        }
                        bin = this.depthBins[this.maxDepth];
                    }
                }
                return client;
            }
            /**
             * 从队列首弹出深度最小的一个对象
             */
            shift() {
                let client;
                let maxDepth = this.maxDepth;
                if (this.minDepth <= maxDepth) {
                    let bin = this.depthBins[this.minDepth];
                    while (!bin || bin.length === 0) {
                        this.minDepth++;
                        if (this.minDepth > maxDepth) {
                            return null;
                        }
                        bin = this.depthBins[this.minDepth];
                    }
                    client = bin.pop();
                    while (!bin || bin.length == 0) {
                        this.minDepth++;
                        if (this.minDepth > maxDepth) {
                            break;
                        }
                        bin = this.depthBins[this.minDepth];
                    }
                }
                return client;
            }
            /**
             * 移除大于等于指定组件层级的元素中最大的元素
             */
            removeLargestChild(client) {
                let nestLevel = client.$nestLevel;
                let max = this.maxDepth;
                let min = nestLevel;
                while (min <= max) {
                    let bin = this.depthBins[max];
                    if (bin && bin.length > 0) {
                        if (max === nestLevel) {
                            if (bin.map.has(client)) {
                                bin.remove(client);
                                return client;
                            }
                        }
                        else if (client instanceof dou2d.DisplayObjectContainer) {
                            let items = bin.items;
                            let length = bin.length;
                            for (let i = 0; i < length; i++) {
                                let value = items[i];
                                if (client.contains(value)) {
                                    bin.remove(value);
                                    return value;
                                }
                            }
                        }
                        else {
                            break;
                        }
                        max--;
                    }
                    else {
                        if (max == this.maxDepth) {
                            this.maxDepth--;
                        }
                        max--;
                        if (max < min) {
                            break;
                        }
                    }
                }
                return null;
            }
            /**
             * 移除大于等于指定组件层级的元素中最小的元素
             */
            removeSmallestChild(client) {
                let nestLevel = client.$nestLevel;
                let min = nestLevel;
                let max = this.maxDepth;
                while (min <= max) {
                    let bin = this.depthBins[min];
                    if (bin && bin.length > 0) {
                        if (min === nestLevel) {
                            if (bin.map.has(client)) {
                                bin.remove(client);
                                return client;
                            }
                        }
                        else if (client instanceof dou2d.DisplayObjectContainer) {
                            let items = bin.items;
                            let length = bin.length;
                            for (let i = 0; i < length; i++) {
                                let value = items[i];
                                if (client.contains(value)) {
                                    bin.remove(value);
                                    return value;
                                }
                            }
                        }
                        else {
                            break;
                        }
                        min++;
                    }
                    else {
                        if (min == this.minDepth) {
                            this.minDepth++;
                        }
                        min++;
                        if (min > max) {
                            break;
                        }
                    }
                }
                return null;
            }
            /**
             * 队列是否为空
             */
            isEmpty() {
                return this.minDepth > this.maxDepth;
            }
        }
        /**
         * 列表项
         * @author wizardc
         */
        class DepthBin {
            constructor() {
                this.length = 0;
                this.map = new Map();
                this.items = [];
            }
            insert(client) {
                if (this.map.has(client)) {
                    return;
                }
                this.map.set(client, true);
                this.length++;
                this.items.push(client);
            }
            pop() {
                let client = this.items.pop();
                if (client) {
                    this.length--;
                    if (this.length === 0) {
                        this.map.clear();
                    }
                    else {
                        this.map.set(client, false);
                    }
                }
                return client;
            }
            remove(client) {
                let index = this.items.indexOf(client);
                if (index >= 0) {
                    this.items.splice(index, 1);
                    this.length--;
                    if (this.length === 0) {
                        this.map.clear();
                    }
                    else {
                        this.map.set(client, false);
                    }
                }
            }
        }
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        const validator = new sys.Validator();
        const tempMatrix = new dou2d.Matrix();
        /**
         * UI 组件实现类
         * @author wizardc
         */
        class UIComponentImpl extends dou2d.DisplayObject {
            constructor() {
                super();
                this.__interface_type__ = "douUI.sys.IUIComponent";
                this.initializeUIValues();
            }
            /**
             * 组件宽度
             * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
             */
            $setWidth(value) {
                value = +value;
                let values = this.$UIComponent;
                if (value < 0 || values[10 /* width */] === value && values[8 /* explicitWidth */] === value) {
                    return false;
                }
                values[8 /* explicitWidth */] = value;
                if (isNaN(value)) {
                    this.invalidateSize();
                }
                this.invalidateProperties();
                this.invalidateDisplayList();
                this.invalidateParentLayout();
                return true;
            }
            $getWidth() {
                this.validateSizeNow();
                return this.$UIComponent[10 /* width */];
            }
            /**
             * 组件高度
             * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
             */
            $setHeight(value) {
                value = +value;
                let values = this.$UIComponent;
                if (value < 0 || values[11 /* height */] === value && values[9 /* explicitHeight */] === value) {
                    return false;
                }
                values[9 /* explicitHeight */] = value;
                if (isNaN(value)) {
                    this.invalidateSize();
                }
                this.invalidateProperties();
                this.invalidateDisplayList();
                this.invalidateParentLayout();
                return true;
            }
            $getHeight() {
                this.validateSizeNow();
                return this.$UIComponent[11 /* height */];
            }
            /**
             * 距父级容器离左边距离
             */
            set left(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[0 /* left */] === value) {
                    return;
                }
                values[0 /* left */] = value;
                this.invalidateParentLayout();
            }
            get left() {
                return this.$UIComponent[0 /* left */];
            }
            /**
             * 距父级容器右边距离
             */
            set right(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[1 /* right */] === value) {
                    return;
                }
                values[1 /* right */] = value;
                this.invalidateParentLayout();
            }
            get right() {
                return this.$UIComponent[1 /* right */];
            }
            /**
             * 距父级容器顶部距离
             */
            set top(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[2 /* top */] === value) {
                    return;
                }
                values[2 /* top */] = value;
                this.invalidateParentLayout();
            }
            get top() {
                return this.$UIComponent[2 /* top */];
            }
            /**
             * 距父级容器底部距离
             */
            set bottom(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[3 /* bottom */] == value) {
                    return;
                }
                values[3 /* bottom */] = value;
                this.invalidateParentLayout();
            }
            get bottom() {
                return this.$UIComponent[3 /* bottom */];
            }
            /**
             * 在父级容器中距水平中心位置的距离
             */
            set horizontalCenter(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[4 /* horizontalCenter */] === value) {
                    return;
                }
                values[4 /* horizontalCenter */] = value;
                this.invalidateParentLayout();
            }
            get horizontalCenter() {
                return this.$UIComponent[4 /* horizontalCenter */];
            }
            /**
             * 在父级容器中距竖直中心位置的距离
             */
            set verticalCenter(value) {
                if (!value || typeof value == "number") {
                    value = +value;
                }
                else {
                    value = value.toString().trim();
                }
                let values = this.$UIComponent;
                if (values[5 /* verticalCenter */] === value) {
                    return;
                }
                values[5 /* verticalCenter */] = value;
                this.invalidateParentLayout();
            }
            get verticalCenter() {
                return this.$UIComponent[5 /* verticalCenter */];
            }
            /**
             * 相对父级容器宽度的百分比
             */
            set percentWidth(value) {
                value = +value;
                let values = this.$UIComponent;
                if (values[6 /* percentWidth */] === value) {
                    return;
                }
                values[6 /* percentWidth */] = value;
                this.invalidateParentLayout();
            }
            get percentWidth() {
                return this.$UIComponent[6 /* percentWidth */];
            }
            /**
             * 相对父级容器高度的百分比
             */
            set percentHeight(value) {
                value = +value;
                let values = this.$UIComponent;
                if (values[7 /* percentHeight */] === value) {
                    return;
                }
                values[7 /* percentHeight */] = value;
                this.invalidateParentLayout();
            }
            get percentHeight() {
                return this.$UIComponent[7 /* percentHeight */];
            }
            /**
             * 外部显式指定的宽度
             */
            get explicitWidth() {
                return this.$UIComponent[8 /* explicitWidth */];
            }
            /**
             * 外部显式指定的高度
             */
            get explicitHeight() {
                return this.$UIComponent[9 /* explicitHeight */];
            }
            /**
             * 组件的最小宽度, 此属性设置为大于 maxWidth 的值时无效, 同时影响测量和自动布局的尺寸
             */
            set minWidth(value) {
                value = +value || 0;
                let values = this.$UIComponent;
                if (value < 0 || values[12 /* minWidth */] === value) {
                    return;
                }
                values[12 /* minWidth */] = value;
                this.invalidateSize();
                this.invalidateParentLayout();
            }
            get minWidth() {
                return this.$UIComponent[12 /* minWidth */];
            }
            /**
             * 组件的最大高度, 同时影响测量和自动布局的尺寸
             */
            set maxWidth(value) {
                value = +value || 0;
                let values = this.$UIComponent;
                if (value < 0 || values[13 /* maxWidth */] === value) {
                    return;
                }
                values[13 /* maxWidth */] = value;
                this.invalidateSize();
                this.invalidateParentLayout();
            }
            get maxWidth() {
                return this.$UIComponent[13 /* maxWidth */];
            }
            /**
             * 组件的最小高度, 此属性设置为大于maxHeight的值时无效, 同时影响测量和自动布局的尺寸
             */
            set minHeight(value) {
                value = +value || 0;
                let values = this.$UIComponent;
                if (value < 0 || values[14 /* minHeight */] === value) {
                    return;
                }
                values[14 /* minHeight */] = value;
                this.invalidateSize();
                this.invalidateParentLayout();
            }
            get minHeight() {
                return this.$UIComponent[14 /* minHeight */];
            }
            /**
             * 组件的最大高度, 同时影响测量和自动布局的尺寸
             */
            set maxHeight(value) {
                value = +value || 0;
                let values = this.$UIComponent;
                if (value < 0 || values[15 /* maxHeight */] === value) {
                    return;
                }
                values[15 /* maxHeight */] = value;
                this.invalidateSize();
                this.invalidateParentLayout();
            }
            get maxHeight() {
                return this.$UIComponent[15 /* maxHeight */];
            }
            /**
             * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
             */
            initializeUIValues() {
                this.$UIComponent = {
                    0: NaN,
                    1: NaN,
                    2: NaN,
                    3: NaN,
                    4: NaN,
                    5: NaN,
                    6: NaN,
                    7: NaN,
                    8: NaN,
                    9: NaN,
                    10: 0,
                    11: 0,
                    12: 0,
                    13: 100000,
                    14: 0,
                    15: 100000,
                    16: 0,
                    17: 0,
                    18: NaN,
                    19: NaN,
                    20: 0,
                    21: 0,
                    22: 0,
                    23: 0,
                    24: true,
                    25: true,
                    26: true,
                    27: false,
                    28: false,
                    29: false,
                };
                this.$includeInLayout = true;
                this._touchEnabled = true;
            }
            /**
             * 子类覆盖此方法可以执行一些初始化子项操作, 此方法仅在组件第一次添加到舞台时回调一次
             */
            createChildren() {
            }
            /**
             * 子项创建完成, 此方法在 createChildren() 之后执行
             */
            childrenCreated() {
            }
            /**
             * 提交属性, 子类在调用完 invalidateProperties() 方法后, 应覆盖此方法以应用属性
             */
            commitProperties() {
                let values = this.$UIComponent;
                if (values[22 /* oldWidth */] != values[10 /* width */] || values[23 /* oldHeight */] != values[11 /* height */]) {
                    this.dispatchUIEvent(douUI.UIEvent.RESIZE);
                    values[22 /* oldWidth */] = values[10 /* width */];
                    values[23 /* oldHeight */] = values[11 /* height */];
                }
                if (values[20 /* oldX */] != this.$getX() || values[21 /* oldY */] != this.$getY()) {
                    this.dispatchUIEvent(douUI.UIEvent.MOVE);
                    values[20 /* oldX */] = this.$getX();
                    values[21 /* oldY */] = this.$getY();
                }
            }
            /**
             * 测量组件尺寸
             */
            measure() {
            }
            /**
             * 更新显示列表
             */
            updateDisplayList(unscaledWidth, unscaledHeight) {
            }
            /**
             * 指定此组件是否包含在父容器的布局中, 若为 false, 则父级容器在测量和布局阶段都忽略此组件, 默认值为 true
             * * 注意: visible 属性与此属性不同, 设置 visible 为 false, 父级容器仍会对其布局
             */
            set includeInLayout(value) {
                value = !!value;
                if (this.$includeInLayout === value) {
                    return;
                }
                this.$includeInLayout = true;
                this.invalidateParentLayout();
                this.$includeInLayout = value;
            }
            get includeInLayout() {
                return this.$includeInLayout;
            }
            $onAddToStage(stage, nestLevel) {
                this.$super.$onAddToStage.call(this, stage, nestLevel);
                this.checkInvalidateFlag();
                let values = this.$UIComponent;
                if (!values[29 /* initialized */]) {
                    values[29 /* initialized */] = true;
                    this.createChildren();
                    this.childrenCreated();
                    this.dispatchUIEvent(douUI.UIEvent.CREATION_COMPLETE);
                }
            }
            /**
             * 检查属性失效标记并应用
             */
            checkInvalidateFlag(event) {
                let values = this.$UIComponent;
                if (values[24 /* invalidatePropertiesFlag */]) {
                    validator.invalidateProperties(this);
                }
                if (values[25 /* invalidateSizeFlag */]) {
                    validator.invalidateSize(this);
                }
                if (values[26 /* invalidateDisplayListFlag */]) {
                    validator.invalidateDisplayList(this);
                }
            }
            /**
             * 立即验证自身的尺寸
             */
            validateSizeNow() {
                this.validateSize(true);
                this.updateFinalSize();
            }
            /**
             * 设置测量结果
             * @param width 测量宽度
             * @param height 测量高度
             */
            setMeasuredSize(width, height) {
                let values = this.$UIComponent;
                values[16 /* measuredWidth */] = Math.ceil(+width || 0);
                values[17 /* measuredHeight */] = Math.ceil(+height || 0);
            }
            /**
             * 设置组件的宽高
             * * 此方法不同于直接设置 width, height 属性, 不会影响显式标记尺寸属性
             */
            setActualSize(w, h) {
                let change = false;
                let values = this.$UIComponent;
                if (values[10 /* width */] !== w) {
                    values[10 /* width */] = w;
                    change = true;
                }
                if (values[11 /* height */] !== h) {
                    values[11 /* height */] = h;
                    change = true;
                }
                if (change) {
                    this.invalidateDisplayList();
                    this.dispatchUIEvent(douUI.UIEvent.RESIZE);
                }
            }
            $updateUseTransform() {
                this.$super.$updateUseTransform.call(this);
                this.invalidateParentLayout();
            }
            $setMatrix(matrix, needUpdateProperties = true) {
                this.$super.$setMatrix.call(this, matrix, needUpdateProperties);
                this.invalidateParentLayout();
                return true;
            }
            $setAnchorOffsetX(value) {
                this.$super.$setAnchorOffsetX.call(this, value);
                this.invalidateParentLayout();
                return true;
            }
            $setAnchorOffsetY(value) {
                this.$super.$setAnchorOffsetY.call(this, value);
                this.invalidateParentLayout();
                return true;
            }
            $setX(value) {
                let change = this.$super.$setX.call(this, value);
                if (change) {
                    this.invalidateParentLayout();
                    this.invalidateProperties();
                }
                return change;
            }
            $setY(value) {
                let change = this.$super.$setY.call(this, value);
                if (change) {
                    this.invalidateParentLayout();
                    this.invalidateProperties();
                }
                return change;
            }
            /**
             * 标记属性失效
             */
            invalidateProperties() {
                let values = this.$UIComponent;
                if (!values[24 /* invalidatePropertiesFlag */]) {
                    values[24 /* invalidatePropertiesFlag */] = true;
                    if (this._stage) {
                        validator.invalidateProperties(this);
                    }
                }
            }
            /**
             * 验证组件的属性
             */
            validateProperties() {
                let values = this.$UIComponent;
                if (values[24 /* invalidatePropertiesFlag */]) {
                    this.commitProperties();
                    values[24 /* invalidatePropertiesFlag */] = false;
                }
            }
            /**
             * 标记提交过需要验证组件尺寸
             */
            invalidateSize() {
                let values = this.$UIComponent;
                if (!values[25 /* invalidateSizeFlag */]) {
                    values[25 /* invalidateSizeFlag */] = true;
                    if (this._stage) {
                        validator.invalidateSize(this);
                    }
                }
            }
            /**
             * 验证组件的尺寸
             */
            validateSize(recursive) {
                if (recursive) {
                    let children = this.$children;
                    if (children) {
                        let length = children.length;
                        for (let i = 0; i < length; i++) {
                            let child = children[i];
                            if (sys.isIUIComponent(child)) {
                                child.validateSize(true);
                            }
                        }
                    }
                }
                let values = this.$UIComponent;
                if (values[25 /* invalidateSizeFlag */]) {
                    let changed = this.measureSizes();
                    if (changed) {
                        this.invalidateDisplayList();
                        this.invalidateParentLayout();
                    }
                    values[25 /* invalidateSizeFlag */] = false;
                }
            }
            /**
             * 测量组件尺寸, 返回尺寸是否发生变化
             */
            measureSizes() {
                let changed = false;
                let values = this.$UIComponent;
                if (!values[25 /* invalidateSizeFlag */]) {
                    return changed;
                }
                if (isNaN(values[8 /* explicitWidth */]) || isNaN(values[9 /* explicitHeight */])) {
                    this.measure();
                    if (values[16 /* measuredWidth */] < values[12 /* minWidth */]) {
                        values[16 /* measuredWidth */] = values[12 /* minWidth */];
                    }
                    if (values[16 /* measuredWidth */] > values[13 /* maxWidth */]) {
                        values[16 /* measuredWidth */] = values[13 /* maxWidth */];
                    }
                    if (values[17 /* measuredHeight */] < values[14 /* minHeight */]) {
                        values[17 /* measuredHeight */] = values[14 /* minHeight */];
                    }
                    if (values[17 /* measuredHeight */] > values[15 /* maxHeight */]) {
                        values[17 /* measuredHeight */] = values[15 /* maxHeight */];
                    }
                }
                let preferredW = this.getPreferredUWidth();
                let preferredH = this.getPreferredUHeight();
                if (preferredW !== values[18 /* oldPreferWidth */] || preferredH !== values[19 /* oldPreferHeight */]) {
                    values[18 /* oldPreferWidth */] = preferredW;
                    values[19 /* oldPreferHeight */] = preferredH;
                    changed = true;
                }
                return changed;
            }
            /**
             * 标记需要验证显示列表
             */
            invalidateDisplayList() {
                let values = this.$UIComponent;
                if (!values[26 /* invalidateDisplayListFlag */]) {
                    values[26 /* invalidateDisplayListFlag */] = true;
                    if (this._stage) {
                        validator.invalidateDisplayList(this);
                    }
                }
            }
            /**
             * 验证子项的位置和大小, 并绘制其他可视内容
             */
            validateDisplayList() {
                let values = this.$UIComponent;
                if (values[26 /* invalidateDisplayListFlag */]) {
                    this.updateFinalSize();
                    this.updateDisplayList(values[10 /* width */], values[11 /* height */]);
                    values[26 /* invalidateDisplayListFlag */] = false;
                }
            }
            /**
             * 更新最终的组件宽高
             */
            updateFinalSize() {
                let unscaledWidth = 0;
                let unscaledHeight = 0;
                let values = this.$UIComponent;
                if (values[27 /* layoutWidthExplicitlySet */]) {
                    unscaledWidth = values[10 /* width */];
                }
                else if (!isNaN(values[8 /* explicitWidth */])) {
                    unscaledWidth = values[8 /* explicitWidth */];
                }
                else {
                    unscaledWidth = values[16 /* measuredWidth */];
                }
                if (values[28 /* layoutHeightExplicitlySet */]) {
                    unscaledHeight = values[11 /* height */];
                }
                else if (!isNaN(values[9 /* explicitHeight */])) {
                    unscaledHeight = values[9 /* explicitHeight */];
                }
                else {
                    unscaledHeight = values[17 /* measuredHeight */];
                }
                this.setActualSize(unscaledWidth, unscaledHeight);
            }
            /**
             * 立即应用组件及其子项的所有属性
             */
            validateNow() {
                if (this._stage) {
                    validator.validateClient(this);
                }
            }
            /**
             * 标记父级容器的尺寸和显示列表为失效
             */
            invalidateParentLayout() {
                let parent = this._parent;
                if (!parent || !this.$includeInLayout || !sys.isIUIComponent(parent)) {
                    return;
                }
                parent.invalidateSize();
                parent.invalidateDisplayList();
            }
            /**
             * 设置组件的布局宽高
             */
            setLayoutBoundsSize(layoutWidth, layoutHeight) {
                layoutHeight = +layoutHeight;
                layoutWidth = +layoutWidth;
                if (layoutHeight < 0 || layoutWidth < 0) {
                    return;
                }
                let values = this.$UIComponent;
                let maxWidth = values[13 /* maxWidth */];
                let maxHeight = values[15 /* maxHeight */];
                let minWidth = Math.min(values[12 /* minWidth */], maxWidth);
                let minHeight = Math.min(values[14 /* minHeight */], maxHeight);
                let width;
                let height;
                if (isNaN(layoutWidth)) {
                    values[27 /* layoutWidthExplicitlySet */] = false;
                    width = this.getPreferredUWidth();
                }
                else {
                    values[27 /* layoutWidthExplicitlySet */] = true;
                    width = Math.max(minWidth, Math.min(maxWidth, layoutWidth));
                }
                if (isNaN(layoutHeight)) {
                    values[28 /* layoutHeightExplicitlySet */] = false;
                    height = this.getPreferredUHeight();
                }
                else {
                    values[28 /* layoutHeightExplicitlySet */] = true;
                    height = Math.max(minHeight, Math.min(maxHeight, layoutHeight));
                }
                let matrix = this.getAnchorMatrix();
                if (sys.MatrixUtil.isDeltaIdentity(matrix)) {
                    this.setActualSize(width, height);
                    return;
                }
                let fitSize = sys.MatrixUtil.fitBounds(layoutWidth, layoutHeight, matrix, values[8 /* explicitWidth */], values[9 /* explicitHeight */], this.getPreferredUWidth(), this.getPreferredUHeight(), minWidth, minHeight, maxWidth, maxHeight);
                if (!fitSize) {
                    fitSize = dou.recyclable(dou2d.Point);
                    fitSize.set(minWidth, minHeight);
                }
                this.setActualSize(fitSize.x, fitSize.y);
                fitSize.recycle();
            }
            /**
             * 设置组件的布局位置
             */
            setLayoutBoundsPosition(x, y) {
                let matrix = this.$getMatrix();
                if (!sys.MatrixUtil.isDeltaIdentity(matrix) || this.anchorOffsetX != 0 || this.anchorOffsetY != 0) {
                    let bounds = dou.recyclable(dou2d.Rectangle);
                    this.getLayoutBounds(bounds);
                    x += this.$getX() - bounds.x;
                    y += this.$getY() - bounds.y;
                    bounds.recycle();
                }
                let changed = this.$super.$setX.call(this, x);
                if (this.$super.$setY.call(this, y) || changed) {
                    this.dispatchUIEvent(douUI.UIEvent.MOVE);
                }
            }
            /**
             * 组件的布局尺寸, 常用于父级的 updateDisplayList() 方法中
             * * 按照: 布局尺寸 -> 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
             */
            getLayoutBounds(bounds) {
                let values = this.$UIComponent;
                let w;
                if (values[27 /* layoutWidthExplicitlySet */]) {
                    w = values[10 /* width */];
                }
                else if (!isNaN(values[8 /* explicitWidth */])) {
                    w = values[8 /* explicitWidth */];
                }
                else {
                    w = values[16 /* measuredWidth */];
                }
                let h;
                if (values[28 /* layoutHeightExplicitlySet */]) {
                    h = values[11 /* height */];
                }
                else if (!isNaN(values[9 /* explicitHeight */])) {
                    h = values[9 /* explicitHeight */];
                }
                else {
                    h = values[17 /* measuredHeight */];
                }
                this.applyMatrix(bounds, w, h);
            }
            getPreferredUWidth() {
                let values = this.$UIComponent;
                return isNaN(values[8 /* explicitWidth */]) ? values[16 /* measuredWidth */] : values[8 /* explicitWidth */];
            }
            getPreferredUHeight() {
                let values = this.$UIComponent;
                return isNaN(values[9 /* explicitHeight */]) ? values[17 /* measuredHeight */] : values[9 /* explicitHeight */];
            }
            /**
             * 获取组件的首选尺寸, 常用于父级的 measure() 方法中
             * 按照: 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
             */
            getPreferredBounds(bounds) {
                let w = this.getPreferredUWidth();
                let h = this.getPreferredUHeight();
                this.applyMatrix(bounds, w, h);
            }
            applyMatrix(bounds, w, h) {
                bounds.set(0, 0, w, h);
                let matrix = this.getAnchorMatrix();
                if (sys.MatrixUtil.isDeltaIdentity(matrix)) {
                    bounds.x += matrix.tx;
                    bounds.y += matrix.ty;
                }
                else {
                    matrix.transformBounds(bounds);
                }
            }
            getAnchorMatrix() {
                let matrix = this.$getMatrix();
                let offsetX = this.anchorOffsetX;
                let offsetY = this.anchorOffsetY;
                if (offsetX != 0 || offsetY != 0) {
                    let tempM = tempMatrix;
                    tempM.set(1, 0, 0, 1, -offsetX, -offsetY);
                    tempM.premultiply(matrix);
                    return tempM;
                }
                return matrix;
            }
        }
        sys.UIComponentImpl = UIComponentImpl;
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 可设置外观的 UI 组件基类
     * @author wizardc
     */
    class Component extends dou2d.DisplayObjectContainer {
        constructor() {
            super();
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            this.$Component = {
                0: true,
                1: true,
                2: true,
                3: null,
                4: null,
                5: false,
                6: null,
                7: false,
                8: [] // skinStyle
            };
            this._touchEnabled = true;
        }
        /**
         * 组件是否可以接受用户交互
         */
        set enabled(value) {
            value = !!value;
            let values = this.$Component;
            if (value === values[0 /* enabled */]) {
                return;
            }
            values[0 /* enabled */] = value;
            if (value) {
                this._touchEnabled = values[2 /* explicitTouchEnabled */];
                this._touchChildren = values[1 /* explicitTouchChildren */];
            }
            else {
                this._touchEnabled = false;
                this._touchChildren = false;
            }
            this.invalidateState();
        }
        get enabled() {
            return this.$Component[0 /* enabled */];
        }
        $setTouchChildren(value) {
            value = !!value;
            let values = this.$Component;
            values[1 /* explicitTouchChildren */] = value;
            if (values[0 /* enabled */]) {
                values[1 /* explicitTouchChildren */] = value;
                return super.$setTouchChildren(value);
            }
            return true;
        }
        $setTouchEnabled(value) {
            value = !!value;
            let values = this.$Component;
            values[2 /* explicitTouchEnabled */] = value;
            if (values[0 /* enabled */]) {
                super.$setTouchEnabled(value);
            }
        }
        /**
         * 当前使用的皮肤
         */
        set skin(value) {
            let values = this.$Component;
            if (values[3 /* skin */] == value) {
                return;
            }
            let oldSkin = values[3 /* skin */];
            if (oldSkin) {
                oldSkin.onUnload();
                this.onSkinRemoved();
            }
            values[3 /* skin */] = value;
            if (value) {
                if (this._stage) {
                    value.onCreateSkin();
                    value.onApply();
                    this.onSkinAdded();
                }
                else {
                    values[5 /* skinIsDirty */] = true;
                }
                values[7 /* stateIsDirty */] = true;
                this.invalidateProperties();
            }
        }
        get skin() {
            return this.$Component[3 /* skin */];
        }
        /**
         * 当前使用的皮肤名称
         */
        set skinName(value) {
            let values = this.$Component;
            if (values[4 /* skinName */] == value) {
                return;
            }
            if (!value) {
                return;
            }
            values[4 /* skinName */] = value;
            let skinClass = douUI.Theme.getSkin(value);
            if (!skinClass) {
                throw new Error(`没有注册对应的皮肤类: ${value}`);
            }
            this.skin = new skinClass();
        }
        get skinName() {
            return this.$Component[4 /* skinName */];
        }
        /**
         * 当前的状态
         */
        set currentState(value) {
            let values = this.$Component;
            if (values[6 /* explicitState */] == value) {
                return;
            }
            values[6 /* explicitState */] = value;
            this.invalidateState();
        }
        get currentState() {
            let values = this.$Component;
            return values[6 /* explicitState */] ? values[6 /* explicitState */] : this.getCurrentState();
        }
        /**
         * 标记状态失效
         */
        invalidateState() {
            let values = this.$Component;
            if (values[7 /* stateIsDirty */]) {
                return;
            }
            values[7 /* stateIsDirty */] = true;
            this.invalidateProperties();
        }
        getCurrentState() {
            return "";
        }
        /**
         * 设置皮肤风格
         * * 仅对当前使用的皮肤有效, 皮肤更换后需要重新调用
         */
        setStyle(name, ...args) {
            if (!this.$UIComponent[29 /* initialized */]) {
                let values = this.$Component;
                let styleList = values[8 /* skinStyle */];
                styleList.push([name, args]);
            }
            else {
                if (this.skin && typeof this.skin[name] == "function") {
                    this.skin[name].call(this.skin, ...args);
                }
            }
        }
        /**
         * 皮肤添加成功后调用
         */
        onSkinAdded() {
        }
        /**
         * 皮肤移除成功后调用
         */
        onSkinRemoved() {
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
            let values = this.$Component;
            if (!values[3 /* skin */]) {
                let skinClass = douUI.Theme.getDefaultSkin(this.constructor);
                if (!skinClass) {
                    throw new Error(`没有注册默认的皮肤类: ${this.constructor}`);
                }
                this.skin = new skinClass(this);
            }
            if (values[5 /* skinIsDirty */]) {
                values[5 /* skinIsDirty */] = false;
                let skin = this.skin;
                skin.onCreateSkin();
                skin.onApply();
                this.onSkinAdded();
            }
            let styleList = values[8 /* skinStyle */];
            if (styleList.length > 0) {
                for (let style of styleList) {
                    this.skin[style[0]].call(this.skin, ...style[1]);
                }
                styleList.length = 0;
            }
        }
        childrenCreated() {
        }
        commitProperties() {
            douUI.sys.UIComponentImpl.prototype["commitProperties"].call(this);
            let values = this.$Component;
            if (values[5 /* skinIsDirty */]) {
                values[5 /* skinIsDirty */] = false;
                let skin = this.skin;
                skin.onCreateSkin();
                skin.onApply();
                this.onSkinAdded();
            }
            if (values[7 /* stateIsDirty */]) {
                values[7 /* stateIsDirty */] = false;
                if (values[3 /* skin */]) {
                    values[3 /* skin */].setState(this.currentState);
                }
            }
        }
        measure() {
            douUI.sys.measure(this);
            let skin = this.$Component[3 /* skin */];
            if (!skin) {
                return;
            }
            let values = this.$UIComponent;
            if (!isNaN(skin.width)) {
                values[16 /* measuredWidth */] = skin.width;
            }
            else {
                if (values[16 /* measuredWidth */] < skin.minWidth) {
                    values[16 /* measuredWidth */] = skin.minWidth;
                }
                if (values[16 /* measuredWidth */] > skin.maxWidth) {
                    values[16 /* measuredWidth */] = skin.maxWidth;
                }
            }
            if (!isNaN(skin.height)) {
                values[17 /* measuredHeight */] = skin.height;
            }
            else {
                if (values[17 /* measuredHeight */] < skin.minHeight) {
                    values[17 /* measuredHeight */] = skin.minHeight;
                }
                if (values[17 /* measuredHeight */] > skin.maxHeight) {
                    values[17 /* measuredHeight */] = skin.maxHeight;
                }
            }
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            douUI.sys.updateDisplayList(this, unscaledWidth, unscaledHeight);
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.Component = Component;
    douUI.sys.implementUIComponent(Component, dou2d.DisplayObjectContainer, true);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 缓动动画类
         * @author wizardc
         */
        class Animation {
            constructor(updateFunction, endFunction, thisObject) {
                this._isPlaying = false;
                this._updateFunction = updateFunction;
                this._endFunction = endFunction;
                this._thisObject = thisObject;
            }
            /**
             * 当前是否正在播放动画
             */
            get isPlaying() {
                return this._isPlaying;
            }
            /**
             * 当前的值
             */
            get currentValue() {
                return this._currentValue;
            }
            /**
             * 开始播放动画
             */
            play(duration, from, to, easerFunction = dou.Ease.sineInOut) {
                this._duration = duration;
                this._from = from;
                this._to = to;
                this._easerFunction = easerFunction;
                this.stop();
                this.start();
            }
            start() {
                this._isPlaying = false;
                this._currentValue = 0;
                this._runningTime = 0;
                this.update(0);
                dou2d.$2d.ticker.startTick(this.update, this);
            }
            update(passedTime) {
                this._runningTime += passedTime;
                if (!this._isPlaying) {
                    this._isPlaying = true;
                }
                let duration = this._duration;
                let fraction = duration == 0 ? 1 : Math.min(this._runningTime, duration) / duration;
                if (this._easerFunction) {
                    fraction = this._easerFunction(fraction);
                }
                this._currentValue = this._from + (this._to - this._from) * fraction;
                if (this._updateFunction) {
                    this._updateFunction.call(this._thisObject, this);
                }
                let isEnded = this._runningTime >= duration;
                if (isEnded) {
                    this.stop();
                }
                if (isEnded && this._endFunction) {
                    this._endFunction.call(this._thisObject, this);
                }
                return true;
            }
            /**
             * 停止播放动画
             */
            stop() {
                this._isPlaying = false;
                this._runningTime = 0;
                dou2d.$2d.ticker.stopTick(this.update, this);
            }
        }
        sys.Animation = Animation;
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 范围选取组件, 该组件包含一个值和这个值所允许的最大最小约束范围
     * @author wizardc
     */
    class Range extends douUI.Component {
        constructor() {
            super();
            this.$Range = {
                0: 100,
                1: false,
                2: 0,
                3: false,
                4: 0,
                5: 0,
                6: false,
                7: 1,
                8: false,
                9: false,
            };
        }
        /**
         * 最大有效值
         */
        set maximum(value) {
            value = +value || 0;
            let values = this.$Range;
            if (value === values[0 /* maximum */]) {
                return;
            }
            values[0 /* maximum */] = value;
            values[1 /* maxChanged */] = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        get maximum() {
            return this.$Range[0 /* maximum */];
        }
        /**
         * 最小有效值
         */
        set minimum(value) {
            value = +value || 0;
            let values = this.$Range;
            if (value === values[2 /* minimum */]) {
                return;
            }
            values[2 /* minimum */] = value;
            values[3 /* minChanged */] = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        get minimum() {
            return this.$Range[2 /* minimum */];
        }
        /**
         * 此范围的当前值
         */
        set value(newValue) {
            newValue = +newValue || 0;
            if (newValue === this.value) {
                return;
            }
            let values = this.$Range;
            values[5 /* changedValue */] = newValue;
            values[6 /* valueChanged */] = true;
            this.invalidateProperties();
        }
        get value() {
            let values = this.$Range;
            return values[6 /* valueChanged */] ? values[5 /* changedValue */] : values[4 /* value */];
        }
        /**
         * 步进值
         */
        set snapInterval(value) {
            let values = this.$Range;
            values[9 /* explicitSnapInterval */] = true;
            value = +value || 0;
            if (value === values[7 /* snapInterval */]) {
                return;
            }
            if (isNaN(value)) {
                values[7 /* snapInterval */] = 1;
                values[9 /* explicitSnapInterval */] = false;
            }
            else {
                values[7 /* snapInterval */] = value;
            }
            values[8 /* snapIntervalChanged */] = true;
            this.invalidateProperties();
        }
        get snapInterval() {
            return this.$Range[7 /* snapInterval */];
        }
        commitProperties() {
            super.commitProperties();
            let values = this.$Range;
            if (values[2 /* minimum */] > values[0 /* maximum */]) {
                if (!values[1 /* maxChanged */]) {
                    values[2 /* minimum */] = values[0 /* maximum */];
                }
                else {
                    values[0 /* maximum */] = values[2 /* minimum */];
                }
            }
            if (values[6 /* valueChanged */] || values[1 /* maxChanged */] || values[3 /* minChanged */] || values[8 /* snapIntervalChanged */]) {
                let currentValue = values[6 /* valueChanged */] ? values[5 /* changedValue */] : values[4 /* value */];
                values[6 /* valueChanged */] = false;
                values[1 /* maxChanged */] = false;
                values[3 /* minChanged */] = false;
                values[8 /* snapIntervalChanged */] = false;
                this.setValue(this.nearestValidValue(currentValue, values[7 /* snapInterval */]));
            }
        }
        setValue(value) {
            let values = this.$Range;
            if (values[4 /* value */] === value) {
                return;
            }
            if (values[0 /* maximum */] > values[2 /* minimum */]) {
                values[4 /* value */] = Math.min(values[0 /* maximum */], Math.max(values[2 /* minimum */], value));
            }
            else {
                values[4 /* value */] = value;
            }
            values[6 /* valueChanged */] = false;
            this.invalidateDisplayList();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "value");
        }
        /**
         * 返回最接近的值
         */
        nearestValidValue(value, interval) {
            let values = this.$Range;
            if (interval == 0) {
                return Math.max(values[2 /* minimum */], Math.min(values[0 /* maximum */], value));
            }
            let maxValue = values[0 /* maximum */] - values[2 /* minimum */];
            let scale = 1;
            value -= values[2 /* minimum */];
            if (interval != Math.round(interval)) {
                let parts = ((1 + interval).toString()).split(".");
                scale = Math.pow(10, parts[1].length);
                maxValue *= scale;
                value = Math.round(value * scale);
                interval = Math.round(interval * scale);
            }
            let lower = Math.max(0, Math.floor(value / interval) * interval);
            let upper = Math.min(maxValue, Math.floor((value + interval) / interval) * interval);
            let validValue = ((value - lower) >= ((upper - lower) / 2)) ? upper : lower;
            return (validValue / scale) + values[2 /* minimum */];
        }
        updateDisplayList(w, h) {
            super.updateDisplayList(w, h);
            this.updateSkinDisplayList();
        }
        /**
         * 更新皮肤
         */
        updateSkinDisplayList() {
        }
    }
    douUI.Range = Range;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 滚动条基类
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class ScrollBarBase extends douUI.Component {
        constructor() {
            super(...arguments);
            /**
             * 是否自动显示隐藏
             */
            this.autoVisibility = true;
        }
        set viewport(value) {
            if (value == this._viewport) {
                return;
            }
            let viewport = this._viewport;
            if (viewport) {
                viewport.off(dou.Event.PROPERTY_CHANGE, this.onPropertyChanged, this);
                viewport.off(dou2d.Event2D.RESIZE, this.onViewportResize, this);
            }
            this._viewport = value;
            if (value) {
                value.on(dou.Event.PROPERTY_CHANGE, this.onPropertyChanged, this);
                value.on(dou2d.Event2D.RESIZE, this.onViewportResize, this);
            }
            this.invalidateDisplayList();
        }
        get viewport() {
            return this._viewport;
        }
        onViewportResize(event) {
            this.invalidateDisplayList();
        }
        onPropertyChanged(event) {
        }
    }
    douUI.ScrollBarBase = ScrollBarBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 滑块基类
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class SliderBase extends douUI.Range {
        constructor() {
            super();
            this.$SliderBase = {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: null,
                5: 0,
                6: 0,
                7: true // liveDragging
            };
            this.maximum = 10;
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }
        /**
         * 如果为 true, 则将在沿着轨道拖动滑块时就刷新滑块的值, 否则在释放时刷新
         */
        set liveDragging(value) {
            this.$SliderBase[7 /* liveDragging */] = !!value;
        }
        get liveDragging() {
            return this.$SliderBase[7 /* liveDragging */];
        }
        /**
         * 当前滑块的值
         */
        set pendingValue(value) {
            value = +value || 0;
            let values = this.$SliderBase;
            if (value === values[5 /* pendingValue */]) {
                return;
            }
            values[5 /* pendingValue */] = value;
            this.invalidateDisplayList();
        }
        get pendingValue() {
            return this.$SliderBase[5 /* pendingValue */];
        }
        onSkinAdded() {
            this.thumb.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onThumbTouchBegin, this);
            this.track.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTrackTouchBegin, this);
            this.trackHighlight.touchEnabled = false;
            if (this.trackHighlight instanceof dou2d.DisplayObjectContainer) {
                this.trackHighlight.touchChildren = false;
            }
        }
        onSkinRemoved() {
            this.thumb.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onThumbTouchBegin, this);
            this.track.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onTrackTouchBegin, this);
        }
        onTouchBegin(event) {
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.stageTouchEndHandler, this);
            this.$SliderBase[4 /* touchDownTarget */] = (event.target);
        }
        stageTouchEndHandler(event) {
            let target = event.target;
            let values = this.$SliderBase;
            event.currentTarget.off(dou2d.TouchEvent.TOUCH_END, this.stageTouchEndHandler, this);
            if (values[4 /* touchDownTarget */] != target && this.contains((target))) {
                this.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_TAP, event.stageX, event.stageY, event.touchPointID, false, true, true);
            }
            values[4 /* touchDownTarget */] = null;
        }
        setValue(value) {
            this.$SliderBase[5 /* pendingValue */] = value;
            super.setValue(value);
        }
        /**
         * 将相对于轨道的 x, y 像素位置转换为介于最小值和最大值 (包括两者) 之间的一个值
         */
        pointToValue(x, y) {
            return this.minimum;
        }
        onThumbTouchBegin(event) {
            let values = this.$SliderBase;
            let stage = this._stage;
            stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.onStageTouchMove, this);
            stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            let point = dou.recyclable(dou2d.Point);
            let clickOffset = this.thumb.globalToLocal(event.stageX, event.stageY, point);
            values[0 /* clickOffsetX */] = clickOffset.x;
            values[1 /* clickOffsetY */] = clickOffset.y;
            point.recycle();
            this.dispatchUIEvent(douUI.UIEvent.CHANGE_START);
        }
        onStageTouchMove(event) {
            let values = this.$SliderBase;
            values[2 /* moveStageX */] = event.stageX;
            values[3 /* moveStageY */] = event.stageY;
            let track = this.track;
            if (!track) {
                return;
            }
            let point = dou.recyclable(dou2d.Point);
            let p = track.globalToLocal(values[2 /* moveStageX */], values[3 /* moveStageY */], point);
            let newValue = this.pointToValue(p.x - values[0 /* clickOffsetX */], p.y - values[1 /* clickOffsetY */]);
            point.recycle();
            newValue = this.nearestValidValue(newValue, this.snapInterval);
            this.updateWhenTouchMove(newValue);
            event.updateAfterEvent();
        }
        updateWhenTouchMove(newValue) {
            if (newValue != this.$SliderBase[5 /* pendingValue */]) {
                if (this.liveDragging) {
                    this.setValue(newValue);
                    this.dispatchEvent(dou.Event.CHANGE);
                }
                else {
                    this.pendingValue = newValue;
                }
            }
        }
        onStageTouchEnd(event) {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_MOVE, this.onStageTouchMove, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.dispatchUIEvent(douUI.UIEvent.CHANGE_END);
            let values = this.$SliderBase;
            if (!this.liveDragging && this.value != values[5 /* pendingValue */]) {
                this.setValue(values[5 /* pendingValue */]);
                this.dispatchEvent(dou.Event.CHANGE);
            }
        }
        onTrackTouchBegin(event) {
            let thumbW = this.thumb ? this.thumb.width : 0;
            let thumbH = this.thumb ? this.thumb.height : 0;
            let offsetX = event.stageX - (thumbW / 2);
            let offsetY = event.stageY - (thumbH / 2);
            let point = dou.recyclable(dou2d.Point);
            let p = this.track.globalToLocal(offsetX, offsetY, point);
            let rangeValues = this.$Range;
            let newValue = this.pointToValue(p.x, p.y);
            point.recycle();
            newValue = this.nearestValidValue(newValue, rangeValues[7 /* snapInterval */]);
            let values = this.$SliderBase;
            if (newValue != values[5 /* pendingValue */]) {
                this.setValue(newValue);
                this.dispatchEvent(dou.Event.CHANGE);
            }
        }
    }
    douUI.SliderBase = SliderBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 拖拽后继续滚动的动画模拟类
         * @author wizardc
         */
        class TouchScroll {
            constructor(target, updateFunction, endFunction) {
                /**
                 * 滚动速度系数
                 */
                this.scrollFactor = 1;
                this._started = true;
                this._bounces = true;
                this._updateFunction = updateFunction;
                this._endFunction = endFunction;
                this._target = target;
                this._previousVelocity = [];
                this._animation = new sys.Animation(this.onScrollingUpdate, this.finishScrolling, this);
            }
            /**
             * 是否允许回弹
             */
            set bounces(value) {
                this._bounces = value;
            }
            get bounces() {
                return this._bounces;
            }
            get isStarted() {
                return this._started;
            }
            get isPlaying() {
                return this._animation.isPlaying;
            }
            onScrollingUpdate(animation) {
                this._currentScrollPos = animation.currentValue;
                this._updateFunction.call(this._target, animation.currentValue);
            }
            /**
             * 开始记录位移变化
             */
            start(touchPoint) {
                this._started = true;
                this._velocity = 0;
                this._previousVelocity.length = 0;
                this._previousPosition = this._currentPosition = touchPoint;
                this._offsetPoint = touchPoint;
                dou2d.$2d.ticker.startTick(this.onTick, this);
            }
            onTick(passedTime) {
                let previousVelocity = this._previousVelocity;
                if (previousVelocity.length >= MAX_VELOCITY_COUNT) {
                    previousVelocity.shift();
                }
                this._velocity = (this._currentPosition - this._previousPosition) / passedTime;
                previousVelocity.push(this._velocity);
                this._previousPosition = this._currentPosition;
                return true;
            }
            /**
             * 更新当前移动到的位置
             */
            update(touchPoint, maxScrollValue, scrollValue) {
                maxScrollValue = Math.max(maxScrollValue, 0);
                this._currentPosition = touchPoint;
                this._maxScrollPos = maxScrollValue;
                let disMove = this._offsetPoint - touchPoint;
                let scrollPos = disMove + scrollValue;
                this._offsetPoint = touchPoint;
                if (scrollPos < 0) {
                    if (!this._bounces) {
                        scrollPos = 0;
                    }
                    else {
                        scrollPos -= disMove * 0.5;
                    }
                }
                if (scrollPos > maxScrollValue) {
                    if (!this._bounces) {
                        scrollPos = maxScrollValue;
                    }
                    else {
                        scrollPos -= disMove * 0.5;
                    }
                }
                this._currentScrollPos = scrollPos;
                this._updateFunction.call(this._target, scrollPos);
            }
            /**
             * 停止记录位移变化, 并计算出目标值和继续缓动的时间
             */
            finish(currentScrollPos, maxScrollPos) {
                dou2d.$2d.ticker.stopTick(this.onTick, this);
                this._started = false;
                let sum = this._velocity * CURRENT_VELOCITY_WEIGHT;
                let previousVelocityX = this._previousVelocity;
                let length = previousVelocityX.length;
                let totalWeight = CURRENT_VELOCITY_WEIGHT;
                for (let i = 0; i < length; i++) {
                    let weight = VELOCITY_WEIGHTS[i];
                    sum += previousVelocityX[0] * weight;
                    totalWeight += weight;
                }
                let pixelsPerMS = sum / totalWeight;
                let absPixelsPerMS = Math.abs(pixelsPerMS);
                let duration = 0;
                let posTo = 0;
                if (absPixelsPerMS > MINIMUM_VELOCITY) {
                    posTo = currentScrollPos + (pixelsPerMS - MINIMUM_VELOCITY) / FRICTION_LOG * 2 * this.scrollFactor;
                    if (posTo < 0 || posTo > maxScrollPos) {
                        posTo = currentScrollPos;
                        while (Math.abs(pixelsPerMS) > MINIMUM_VELOCITY) {
                            posTo -= pixelsPerMS;
                            if (posTo < 0 || posTo > maxScrollPos) {
                                pixelsPerMS *= FRICTION * EXTRA_FRICTION;
                            }
                            else {
                                pixelsPerMS *= FRICTION;
                            }
                            duration++;
                        }
                    }
                    else {
                        duration = Math.log(MINIMUM_VELOCITY / absPixelsPerMS) / FRICTION_LOG;
                    }
                }
                else {
                    posTo = currentScrollPos;
                }
                if (duration > 0) {
                    if (!this._bounces) {
                        if (posTo < 0) {
                            posTo = 0;
                        }
                        else if (posTo > maxScrollPos) {
                            posTo = maxScrollPos;
                        }
                    }
                    this.throwTo(posTo, duration);
                }
                else {
                    this.finishScrolling();
                }
            }
            finishScrolling(animation) {
                let hsp = this._currentScrollPos;
                let maxHsp = this._maxScrollPos;
                let hspTo = hsp;
                if (hsp < 0) {
                    hspTo = 0;
                }
                if (hsp > maxHsp) {
                    hspTo = maxHsp;
                }
                this.throwTo(hspTo, 300);
            }
            throwTo(hspTo, duration = 500) {
                let hsp = this._currentScrollPos;
                if (hsp == hspTo) {
                    this._endFunction.call(this._target);
                    return;
                }
                let animation = this._animation;
                animation.play(duration, hsp, hspTo, easeOut);
            }
            /**
             * 停止缓动
             */
            stop() {
                this._started = false;
                this._animation.stop();
                dou2d.$2d.ticker.stopTick(this.onTick, this);
            }
        }
        sys.TouchScroll = TouchScroll;
        /**
         * 需要记录的历史速度的最大次数
         */
        const MAX_VELOCITY_COUNT = 4;
        /**
         * 记录的历史速度的权重列表
         */
        const VELOCITY_WEIGHTS = [1, 1.33, 1.66, 2];
        /**
         * 当前速度所占的权重
         */
        const CURRENT_VELOCITY_WEIGHT = 2.33;
        /**
         * 最小的改变速度，解决浮点数精度问题
         */
        const MINIMUM_VELOCITY = 0.02;
        /**
         * 当容器自动滚动时要应用的摩擦系数
         */
        const FRICTION = 0.998;
        /**
         * 当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数
         */
        const EXTRA_FRICTION = 0.95;
        /**
         * 摩擦系数的自然对数
         */
        const FRICTION_LOG = Math.log(FRICTION);
        /**
         * 缓动方法
         */
        function easeOut(ratio) {
            let invRatio = ratio - 1.0;
            return invRatio * invRatio * invRatio + 1;
        }
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 文本
     * @author wizardc
     */
    class Label extends dou2d.TextField {
        constructor(text) {
            super();
            this._widthConstraint = NaN;
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            this.text = text;
        }
        $invalidateTextField() {
            super.$invalidateTextField();
            this.invalidateSize();
        }
        $setWidth(value) {
            let result1 = super.$setWidth(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setWidth.call(this, value);
            return result1 && result2;
        }
        $setHeight(value) {
            let result1 = super.$setHeight(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setHeight.call(this, value);
            return result1 && result2;
        }
        $setText(value) {
            let result = super.$setText(value);
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "text");
            return result;
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
        }
        childrenCreated() {
        }
        commitProperties() {
        }
        measure() {
            let values = this.$UIComponent;
            let textValues = this.$propertyMap;
            let oldWidth = textValues[3 /* textFieldWidth */];
            let availableWidth = NaN;
            if (!isNaN(this._widthConstraint)) {
                availableWidth = this._widthConstraint;
                this._widthConstraint = NaN;
            }
            else if (!isNaN(values[8 /* explicitWidth */])) {
                availableWidth = values[8 /* explicitWidth */];
            }
            else if (values[13 /* maxWidth */] != 100000) {
                availableWidth = values[13 /* maxWidth */];
            }
            super.$setWidth(availableWidth);
            this.setMeasuredSize(this.textWidth, this.textHeight);
            super.$setWidth(oldWidth);
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.$setWidth(unscaledWidth);
            super.$setHeight(unscaledHeight);
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
            douUI.sys.UIComponentImpl.prototype.setLayoutBoundsSize.call(this, layoutWidth, layoutHeight);
            if (isNaN(layoutWidth) || layoutWidth === this._widthConstraint || layoutWidth == 0) {
                this._widthConstraint = layoutWidth;
                return;
            }
            this._widthConstraint = layoutWidth;
            let values = this.$UIComponent;
            if (!isNaN(values[9 /* explicitHeight */])) {
                return;
            }
            if (layoutWidth == values[16 /* measuredWidth */]) {
                return;
            }
            this.invalidateSize();
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.Label = Label;
    douUI.sys.implementUIComponent(Label, dou2d.TextField);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 位图文本
     * @author wizardc
     */
    class BitmapLabel extends dou2d.BitmapText {
        constructor(text) {
            super();
            this._widthConstraint = NaN;
            this._heightConstraint = NaN;
            this._sourceChanged = false;
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            this.text = text;
        }
        $setWidth(value) {
            let result1 = super.$setWidth(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setWidth.call(this, value);
            return result1 && result2;
        }
        $setHeight(value) {
            let result1 = super.$setHeight(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setHeight.call(this, value);
            return result1 && result2;
        }
        $setText(value) {
            let result = super.$setText(value);
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "text");
            return result;
        }
        set source(value) {
            if (this._source == value) {
                return;
            }
            this._source = value;
            if (this._stage) {
                this.parseFont();
            }
            else {
                this._sourceChanged = true;
                this.invalidateProperties();
            }
        }
        get source() {
            return this._source;
        }
        $invalidateContentBounds() {
            super.$invalidateContentBounds();
            this.invalidateSize();
        }
        parseFont() {
            douUI.getAsset(this._source, (content, sourece) => {
                if (content && this._source == sourece) {
                    this.$setFont(content);
                    this._sourceChanged = false;
                }
            }, this);
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
            if (this._sourceChanged) {
                this.parseFont();
            }
        }
        childrenCreated() {
        }
        commitProperties() {
            douUI.sys.UIComponentImpl.prototype["commitProperties"].call(this);
            if (this._sourceChanged) {
                this.parseFont();
            }
        }
        measure() {
            let values = this.$UIComponent;
            let oldWidth = this._textFieldWidth;
            let oldHeight = this._textFieldHeight;
            let availableWidth = NaN;
            if (!isNaN(this._widthConstraint)) {
                availableWidth = this._widthConstraint;
                this._widthConstraint = NaN;
            }
            else if (!isNaN(values[8 /* explicitWidth */])) {
                availableWidth = values[8 /* explicitWidth */];
            }
            else if (values[13 /* maxWidth */] != 100000) {
                availableWidth = values[13 /* maxWidth */];
            }
            super.$setWidth(availableWidth);
            let availableHeight = NaN;
            if (!isNaN(this._heightConstraint)) {
                availableHeight = this._heightConstraint;
                this._heightConstraint = NaN;
            }
            else if (!isNaN(values[9 /* explicitHeight */])) {
                availableHeight = values[9 /* explicitHeight */];
            }
            else if (values[15 /* maxHeight */] != 100000) {
                availableHeight = values[15 /* maxHeight */];
            }
            super.$setHeight(availableHeight);
            this.setMeasuredSize(this.textWidth, this.textHeight);
            super.$setWidth(oldWidth);
            super.$setHeight(oldHeight);
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.$setWidth(unscaledWidth);
            super.$setHeight(unscaledHeight);
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
            douUI.sys.UIComponentImpl.prototype.setLayoutBoundsSize.call(this, layoutWidth, layoutHeight);
            if (isNaN(layoutWidth) || layoutWidth === this._widthConstraint || layoutWidth == 0) {
                return;
            }
            let values = this.$UIComponent;
            if (!isNaN(values[9 /* explicitHeight */])) {
                return;
            }
            if (layoutWidth == values[16 /* measuredWidth */]) {
                return;
            }
            this._widthConstraint = layoutWidth;
            this._heightConstraint = layoutHeight;
            this.invalidateSize();
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.BitmapLabel = BitmapLabel;
    douUI.sys.implementUIComponent(BitmapLabel, dou2d.BitmapText);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 可编辑文本
     * @author wizardc
     */
    class EditableText extends dou2d.TextField {
        constructor() {
            super();
            this._widthConstraint = NaN;
            this._isShowPrompt = false;
            this._promptColor = 0x666666;
            this._isFocusIn = false;
            this._isTouchCancle = false;
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            this.type = 1 /* input */;
            this.$EditableText = {
                0: null,
                1: 0xffffff,
                2: false // asPassword
            };
        }
        /**
         * 空字符串时要显示的文本内容
         */
        set prompt(value) {
            let values = this.$EditableText;
            let promptText = values[0 /* promptText */];
            if (promptText == value) {
                return;
            }
            values[0 /* promptText */] = value;
            let text = this.text;
            if (!text || text == promptText) {
                this.showPromptText();
            }
        }
        get prompt() {
            return this.$EditableText[0 /* promptText */];
        }
        /**
         * 空字符串时要显示的文本内容的颜色
         */
        set promptColor(value) {
            value = +value | 0;
            if (this._promptColor != value) {
                this._promptColor = value;
                let text = this.text;
                if (!text || text == this.$EditableText[0 /* promptText */]) {
                    this.showPromptText();
                }
            }
        }
        get promptColor() {
            return this._promptColor;
        }
        $invalidateTextField() {
            super.$invalidateTextField();
            this.invalidateSize();
        }
        $setWidth(value) {
            let result1 = super.$setWidth(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setWidth.call(this, value);
            return result1 && result2;
        }
        $setHeight(value) {
            let result1 = super.$setHeight(value);
            let result2 = douUI.sys.UIComponentImpl.prototype.$setHeight.call(this, value);
            return result1 && result2;
        }
        $setText(value) {
            let promptText = this.$EditableText[0 /* promptText */];
            if (promptText != value || promptText == null) {
                this._isShowPrompt = false;
                this.textColor = this.$EditableText[1 /* textColorUser */];
                this.displayAsPassword = this.$EditableText[2 /* asPassword */];
            }
            if (!this._isFocusIn) {
                if (value == "" || value == null) {
                    value = promptText;
                    this._isShowPrompt = true;
                    super.$setTextColor(this._promptColor);
                    super.$setDisplayAsPassword(false);
                }
            }
            let result = super.$setText(value);
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "text");
            return result;
        }
        $getText() {
            let value = super.$getText();
            if (value == this.$EditableText[0 /* promptText */]) {
                value = "";
            }
            return value;
        }
        $onAddToStage(stage, nestLevel) {
            super.$onAddToStage(stage, nestLevel);
            this.on(dou2d.Event2D.FOCUS_IN, this.onfocusIn, this);
            this.on(dou2d.Event2D.FOCUS_OUT, this.onfocusOut, this);
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            this.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            this.off(dou2d.Event2D.FOCUS_IN, this.onfocusIn, this);
            this.off(dou2d.Event2D.FOCUS_OUT, this.onfocusOut, this);
            this.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
            this.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
        }
        onfocusOut() {
            this._isFocusIn = false;
            if (!this.text) {
                this.showPromptText();
            }
        }
        onTouchBegin() {
            this._isTouchCancle = false;
        }
        onTouchCancle() {
            this._isTouchCancle = true;
        }
        onfocusIn() {
            if (!dou2d.Capabilities.isMobile && this._isTouchCancle) {
                this._inputController.hideInput();
                return;
            }
            this._isFocusIn = true;
            this._isShowPrompt = false;
            this.displayAsPassword = this.$EditableText[2 /* asPassword */];
            let values = this.$EditableText;
            let text = this.text;
            if (!text || text == values[0 /* promptText */]) {
                this.textColor = values[1 /* textColorUser */];
                this.text = "";
            }
        }
        showPromptText() {
            let values = this.$EditableText;
            this._isShowPrompt = true;
            super.$setTextColor(this._promptColor);
            super.$setDisplayAsPassword(false);
            this.text = values[0 /* promptText */];
        }
        $setTextColor(value) {
            value = +value | 0;
            this.$EditableText[1 /* textColorUser */] = value;
            if (!this._isShowPrompt) {
                super.$setTextColor(value);
            }
            return true;
        }
        $setDisplayAsPassword(value) {
            this.$EditableText[2 /* asPassword */] = value;
            if (!this._isShowPrompt) {
                super.$setDisplayAsPassword(value);
            }
            return true;
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
            this.onfocusOut();
        }
        childrenCreated() {
        }
        commitProperties() {
        }
        measure() {
            let values = this.$UIComponent;
            let textValues = this.$propertyMap;
            let oldWidth = textValues[3 /* textFieldWidth */];
            let availableWidth = NaN;
            if (!isNaN(this._widthConstraint)) {
                availableWidth = this._widthConstraint;
                this._widthConstraint = NaN;
            }
            else if (!isNaN(values[8 /* explicitWidth */])) {
                availableWidth = values[8 /* explicitWidth */];
            }
            else if (values[13 /* maxWidth */] != 100000) {
                availableWidth = values[13 /* maxWidth */];
            }
            super.$setWidth(availableWidth);
            this.setMeasuredSize(this.textWidth, this.textHeight);
            super.$setWidth(oldWidth);
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.$setWidth(unscaledWidth);
            super.$setHeight(unscaledHeight);
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
            douUI.sys.UIComponentImpl.prototype.setLayoutBoundsSize.call(this, layoutWidth, layoutHeight);
            if (isNaN(layoutWidth) || layoutWidth === this._widthConstraint || layoutWidth == 0) {
                return;
            }
            let values = this.$UIComponent;
            if (!isNaN(values[9 /* explicitHeight */])) {
                return;
            }
            if (layoutWidth == values[16 /* measuredWidth */]) {
                return;
            }
            this._widthConstraint = layoutWidth;
            this.invalidateSize();
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.EditableText = EditableText;
    douUI.sys.implementUIComponent(EditableText, dou2d.TextField);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 图片
     * @author wizardc
     */
    class Image extends dou2d.Bitmap {
        constructor(source) {
            super();
            this._sourceChanged = false;
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            if (source) {
                this.source = source;
            }
        }
        set source(value) {
            if (this._source == value) {
                return;
            }
            this._source = value;
            if (this._stage) {
                this.parseSource();
            }
            else {
                this._sourceChanged = true;
                this.invalidateProperties();
            }
        }
        get source() {
            return this._source;
        }
        $setScale9Grid(value) {
            let result = super.$setScale9Grid(value);
            this.invalidateDisplayList();
            return result;
        }
        $setFillMode(value) {
            let result = super.$setFillMode(value);
            this.invalidateDisplayList();
            return result;
        }
        $setTexture(value) {
            if (this._texture == value) {
                return false;
            }
            let result = super.$setTexture(value);
            this._sourceChanged = false;
            this.invalidateSize();
            this.invalidateDisplayList();
            return result;
        }
        parseSource() {
            if (this._source && typeof this._source == "string") {
                douUI.getAsset(this._source, (content, source) => {
                    if (this._source != source) {
                        return;
                    }
                    if (!content || !(content instanceof dou2d.Texture)) {
                        return;
                    }
                    this.$setTexture(content);
                    this.dispatchEvent(dou.Event.COMPLETE);
                }, this);
            }
            else {
                this.$setTexture(this._source);
            }
        }
        $measureContentBounds(bounds) {
            let image = this._texture;
            if (image) {
                let values = this.$UIComponent;
                let width = values[10 /* width */];
                let height = values[11 /* height */];
                if (isNaN(width) || isNaN(height)) {
                    bounds.clear();
                    return;
                }
                if (this._fillMode == "clip" /* clip */) {
                    if (width > image.$getTextureWidth()) {
                        width = image.$getTextureWidth();
                    }
                    if (height > image.$getTextureHeight()) {
                        height = image.$getTextureHeight();
                    }
                }
                bounds.set(0, 0, width, height);
            }
            else {
                bounds.clear();
            }
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
            if (this._sourceChanged) {
                this.parseSource();
            }
        }
        setActualSize(w, h) {
            douUI.sys.UIComponentImpl.prototype["setActualSize"].call(this, w, h);
            super.$setWidth(w);
            super.$setHeight(h);
        }
        childrenCreated() {
        }
        commitProperties() {
            douUI.sys.UIComponentImpl.prototype["commitProperties"].call(this);
            if (this._sourceChanged) {
                this.parseSource();
            }
        }
        measure() {
            let texture = this._texture;
            if (texture) {
                this.setMeasuredSize(texture.$getTextureWidth(), texture.$getTextureHeight());
            }
            else {
                this.setMeasuredSize(0, 0);
            }
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            this.$renderDirty = true;
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.Image = Image;
    douUI.sys.implementUIComponent(Image, dou2d.Bitmap);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 按钮
     * * 拥有状态: "up", "down", "disabled"
     * @author wizardc
     */
    class Button extends douUI.Component {
        constructor() {
            super();
            this.touchCaptured = false;
            this.touchChildren = false;
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }
        onTouchBegin(event) {
            this._stage.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.touchCaptured = true;
            this.invalidateState();
            event.updateAfterEvent();
        }
        onTouchCancle(event) {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.touchCaptured = false;
            this.invalidateState();
        }
        onStageTouchEnd(event) {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            if (this.contains(event.target)) {
                this.buttonReleased();
            }
            this.touchCaptured = false;
            this.invalidateState();
        }
        buttonReleased() {
        }
        getCurrentState() {
            if (!this.enabled) {
                return "disabled";
            }
            if (this.touchCaptured) {
                return "down";
            }
            return "up";
        }
    }
    douUI.Button = Button;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 切换按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class ToggleButton extends douUI.Button {
        constructor() {
            super(...arguments);
            this._selected = false;
            this._autoSelected = true;
        }
        /**
         * 当前是否处于选中状态
         */
        set selected(value) {
            value = !!value;
            if (value === this._selected) {
                return;
            }
            this._selected = value;
            this.invalidateState();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selected");
        }
        get selected() {
            return this._selected;
        }
        /**
         * 是否根据点击操作自动变换是否选中
         */
        set autoSelected(value) {
            this._autoSelected = value;
        }
        get autoSelected() {
            return this._autoSelected;
        }
        buttonReleased() {
            if (!this._autoSelected) {
                return;
            }
            this.selected = !this._selected;
            this.dispatchEvent(dou.Event.CHANGE);
        }
        getCurrentState() {
            let state = super.getCurrentState();
            if (!this._selected) {
                return state;
            }
            return state + "AndSelected";
        }
    }
    douUI.ToggleButton = ToggleButton;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 复选框
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class CheckBox extends douUI.ToggleButton {
    }
    douUI.CheckBox = CheckBox;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    let automaticRadioButtonGroups = {};
    /**
     * 单选按钮
     * * 拥有状态: "up", "down", "disabled", "upAndSelected", "downAndSelected", "disabledAndSelected"
     * @author wizardc
     */
    class RadioButton extends douUI.ToggleButton {
        constructor(groupName = "radioGroup") {
            super();
            this.$indexNumber = 0;
            this._groupChanged = false;
            this.groupName = groupName;
        }
        set enabled(value) {
            dou.superSetter(RadioButton, this, "enabled", value);
            this.invalidateDisplayList();
        }
        get enabled() {
            if (!this.$Component[0 /* enabled */]) {
                return false;
            }
            return !this.$radioButtonGroup || this.$radioButtonGroup.$enabled;
        }
        set group(value) {
            if (this._group == value) {
                return;
            }
            if (this.$radioButtonGroup) {
                this.$radioButtonGroup.removeRadioButton(this, false);
            }
            this._group = value;
            this._groupName = value ? this.group.$name : "radioGroup";
            this._groupChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        get group() {
            if (!this._group && this._groupName) {
                let group = automaticRadioButtonGroups[this._groupName];
                if (!group) {
                    group = new douUI.RadioButtonGroup();
                    group.$name = this._groupName;
                    automaticRadioButtonGroups[this._groupName] = group;
                }
                this._group = group;
            }
            return this._group;
        }
        set groupName(value) {
            if (!value || value == "") {
                return;
            }
            this._groupName = value;
            if (this.$radioButtonGroup) {
                this.$radioButtonGroup.removeRadioButton(this, false);
            }
            this._group = null;
            this._groupChanged = true;
            this.invalidateProperties();
            this.invalidateDisplayList();
        }
        get groupName() {
            return this._groupName;
        }
        /**
         * 当前组件的值
         */
        set value(value) {
            if (this._value == value) {
                return;
            }
            this._value = value;
            if (this._selected && this.group) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
            }
        }
        get value() {
            return this._value;
        }
        commitProperties() {
            if (this._groupChanged) {
                this.addToGroup();
                this._groupChanged = false;
            }
            super.commitProperties();
        }
        addToGroup() {
            let group = this.group;
            if (group) {
                group.addRadioButton(this);
            }
            return group;
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            if (this.group) {
                if (this._selected) {
                    this._group.$setSelection(this, false);
                }
                else if (this.group.selection == this) {
                    this._group.$setSelection(null, false);
                }
            }
        }
        buttonReleased() {
            if (!this.enabled || this.selected) {
                return;
            }
            if (!this.$radioButtonGroup) {
                this.addToGroup();
            }
            super.buttonReleased();
            this.group.$setSelection(this, true);
        }
    }
    douUI.RadioButton = RadioButton;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    let groupCount = 0;
    /**
     * 单选按钮组
     * @author wizardc
     */
    class RadioButtonGroup extends dou.EventDispatcher {
        constructor(name) {
            super();
            this.$enabled = true;
            this.$name = name || "_radioButtonGroup" + groupCount++;
            this._radioButtons = [];
        }
        set enabled(value) {
            value = !!value;
            if (this.$enabled === value) {
                return;
            }
            this.$enabled = value;
            let buttons = this._radioButtons;
            let length = buttons.length;
            for (let i = 0; i < length; i++) {
                buttons[i].invalidateState();
            }
        }
        get enabled() {
            return this.$enabled;
        }
        set selectedValue(value) {
            this._selectedValue = value;
            if (value == null) {
                this.$setSelection(null, false);
                return;
            }
            let n = this.numRadioButtons;
            for (let i = 0; i < n; i++) {
                let radioButton = this._radioButtons[i];
                if (radioButton.value == value) {
                    this.changeSelection(i, false);
                    this._selectedValue = null;
                    this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
                    break;
                }
            }
        }
        get selectedValue() {
            if (this.selection) {
                return this.selection.value;
            }
            return null;
        }
        set selection(value) {
            if (this._selection == value) {
                return;
            }
            this.$setSelection(value, false);
        }
        get selection() {
            return this._selection;
        }
        $setSelection(value, fireChange) {
            if (this._selection == value) {
                return false;
            }
            if (!value) {
                if (this._selection) {
                    this._selection.selected = false;
                    this._selection = null;
                    if (fireChange) {
                        this.dispatchEvent(dou.Event.CHANGE);
                    }
                }
            }
            else {
                let n = this.numRadioButtons;
                for (let i = 0; i < n; i++) {
                    if (value == this.getRadioButtonAt(i)) {
                        this.changeSelection(i, fireChange);
                        break;
                    }
                }
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedValue");
            return true;
        }
        get numRadioButtons() {
            return this._radioButtons.length;
        }
        getRadioButtonAt(index) {
            return this._radioButtons[index];
        }
        changeSelection(index, fireChange) {
            let rb = this.getRadioButtonAt(index);
            if (rb && rb != this._selection) {
                if (this._selection) {
                    this._selection.selected = false;
                }
                this._selection = rb;
                this._selection.selected = true;
                if (fireChange) {
                    this.dispatchEvent(dou.Event.CHANGE);
                }
            }
        }
        addRadioButton(instance) {
            instance.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.removedHandler, this);
            let buttons = this._radioButtons;
            buttons.push(instance);
            buttons.sort(this.breadthOrderCompare);
            let length = buttons.length;
            for (let i = 0; i < length; i++) {
                buttons[i].$indexNumber = i;
            }
            if (this._selectedValue) {
                this.selectedValue = this._selectedValue;
            }
            if (instance.selected == true) {
                this.selection = instance;
            }
            instance.$radioButtonGroup = this;
            instance.invalidateState();
        }
        removedHandler(event) {
            let rb = event.target;
            if (rb == event.currentTarget) {
                rb.off(dou2d.Event2D.REMOVED_FROM_STAGE, this.removedHandler, this);
                this.removeRadioButton(rb, true);
            }
        }
        breadthOrderCompare(a, b) {
            let aParent = a.parent;
            let bParent = b.parent;
            if (!aParent || !bParent) {
                return 0;
            }
            let aNestLevel = a.$nestLevel;
            let bNestLevel = b.$nestLevel;
            let aIndex = 0;
            let bIndex = 0;
            if (aParent == bParent) {
                aIndex = aParent.getChildIndex(a);
                bIndex = bParent.getChildIndex(b);
            }
            if (aNestLevel > bNestLevel || aIndex > bIndex) {
                return 1;
            }
            if (aNestLevel < bNestLevel || bIndex > aIndex) {
                return -1;
            }
            if (a == b) {
                return 0;
            }
            return this.breadthOrderCompare(aParent, bParent);
        }
        removeRadioButton(instance, addListener) {
            if (instance) {
                let foundInstance = false;
                let buttons = this._radioButtons;
                let length = buttons.length;
                for (let i = 0; i < length; i++) {
                    let rb = buttons[i];
                    if (foundInstance) {
                        rb.$indexNumber = rb.$indexNumber - 1;
                    }
                    else if (rb == instance) {
                        if (addListener) {
                            instance.on(dou2d.Event2D.ADDED_TO_STAGE, this.addedHandler, this);
                        }
                        if (instance == this._selection) {
                            this._selection = null;
                        }
                        instance.$radioButtonGroup = null;
                        instance.invalidateState();
                        this._radioButtons.splice(i, 1);
                        foundInstance = true;
                        i--;
                        length--;
                    }
                }
            }
        }
        addedHandler(event) {
            let rb = event.target;
            if (rb == event.currentTarget) {
                rb.off(dou2d.Event2D.ADDED_TO_STAGE, this.addedHandler, this);
                this.addRadioButton(rb);
            }
        }
    }
    douUI.RadioButtonGroup = RadioButtonGroup;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 自动布局的容器基类
     * @author wizardc
     */
    class Group extends dou2d.DisplayObjectContainer {
        constructor() {
            super();
            this.__interface_type__ = "douUI.sys.IUIComponent";
            this.initializeUIValues();
            this.$Group = {
                0: 0,
                1: 0,
                2: 0,
                3: 0,
                4: false,
                5: false,
            };
        }
        /**
         * 触摸组件的背景透明区域是否可以穿透
         */
        set touchThrough(value) {
            this.$Group[5 /* touchThrough */] = !!value;
        }
        get touchThrough() {
            return this.$Group[5 /* touchThrough */];
        }
        /**
         * 布局元素子项的数量
         */
        get numElements() {
            return this.$children.length;
        }
        /**
         * 此容器的布局对象
         */
        set layout(value) {
            if (this._layout == value) {
                return;
            }
            if (this._layout) {
                this._layout.target = null;
            }
            this._layout = value;
            if (value) {
                value.target = this;
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        get layout() {
            return this._layout;
        }
        /**
         * 是否启用滚动条
         */
        set scrollEnabled(value) {
            value = !!value;
            let values = this.$Group;
            if (value === values[4 /* scrollEnabled */]) {
                return;
            }
            values[4 /* scrollEnabled */] = value;
            this.updateScrollRect();
        }
        get scrollEnabled() {
            return this.$Group[4 /* scrollEnabled */];
        }
        /**
         * 水平方向的滚动数值
         */
        set scrollH(value) {
            value = +value || 0;
            let values = this.$Group;
            if (value === values[2 /* scrollH */]) {
                return;
            }
            values[2 /* scrollH */] = value;
            if (this.updateScrollRect() && this._layout) {
                this._layout.scrollPositionChanged();
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "scrollH");
        }
        get scrollH() {
            return this.$Group[2 /* scrollH */];
        }
        /**
         * 垂直方向的滚动数值
         */
        set scrollV(value) {
            value = +value || 0;
            let values = this.$Group;
            if (value == values[3 /* scrollV */]) {
                return;
            }
            values[3 /* scrollV */] = value;
            if (this.updateScrollRect() && this._layout) {
                this._layout.scrollPositionChanged();
            }
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "scrollV");
        }
        get scrollV() {
            return this.$Group[3 /* scrollV */];
        }
        /**
         * 获取内容宽度
         */
        get contentWidth() {
            return this.$Group[0 /* contentWidth */];
        }
        /**
         * 获取内容高度
         */
        get contentHeight() {
            return this.$Group[1 /* contentHeight */];
        }
        updateScrollRect() {
            let values = this.$Group;
            let hasClip = values[4 /* scrollEnabled */];
            if (hasClip) {
                let uiValues = this.$UIComponent;
                let rect = dou.recyclable(dou2d.Rectangle);
                this.scrollRect = rect.set(values[2 /* scrollH */], values[3 /* scrollV */], uiValues[10 /* width */], uiValues[11 /* height */]);
                rect.recycle();
            }
            else if (this._scrollRect) {
                this.scrollRect = null;
            }
            return hasClip;
        }
        /**
         * 设置内容尺寸, 由引擎内部调用
         */
        setContentSize(width, height) {
            width = Math.ceil(+width || 0);
            height = Math.ceil(+height || 0);
            let values = this.$Group;
            let wChange = (values[0 /* contentWidth */] !== width);
            let hChange = (values[1 /* contentHeight */] !== height);
            if (!wChange && !hChange) {
                return;
            }
            values[0 /* contentWidth */] = width;
            values[1 /* contentHeight */] = height;
            if (wChange) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "contentWidth");
            }
            if (hChange) {
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "contentHeight");
            }
        }
        /**
         * 获取一个布局元素子项
         */
        getElementAt(index) {
            return this.$children[index];
        }
        /**
         * 获取一个虚拟布局元素子项
         */
        getVirtualElementAt(index) {
            return this.getElementAt(index);
        }
        /**
         * 在支持虚拟布局的容器中, 设置容器内可见的子元素索引范围
         */
        setVirtualElementIndicesInView(startIndex, endIndex) {
        }
        $hitTest(stageX, stageY) {
            let target = super.$hitTest(stageX, stageY);
            if (target || this.$Group[5 /* touchThrough */]) {
                return target;
            }
            if (!this._visible || !this.touchEnabled || this.scaleX === 0 || this.scaleY === 0 || this.width === 0 || this.height === 0) {
                return null;
            }
            let point = dou.recyclable(dou2d.Point);
            this.globalToLocal(stageX, stageY, point);
            let values = this.$UIComponent;
            let rect = dou.recyclable(dou2d.Rectangle);
            let bounds = rect.set(0, 0, values[10 /* width */], values[11 /* height */]);
            let scrollRect = this._scrollRect;
            if (scrollRect) {
                bounds.x = scrollRect.x;
                bounds.y = scrollRect.y;
            }
            if (bounds.contains(point.x, point.y)) {
                point.recycle();
                rect.recycle();
                return this;
            }
            point.recycle();
            rect.recycle();
            return null;
        }
        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        initializeUIValues() {
        }
        createChildren() {
            if (!this._layout) {
                this.layout = new douUI.BasicLayout();
            }
        }
        childrenCreated() {
        }
        commitProperties() {
        }
        measure() {
            if (!this._layout) {
                this.setMeasuredSize(0, 0);
                return;
            }
            this._layout.measure();
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            if (this._layout) {
                this._layout.updateDisplayList(unscaledWidth, unscaledHeight);
            }
            this.updateScrollRect();
        }
        invalidateParentLayout() {
        }
        setMeasuredSize(width, height) {
        }
        invalidateProperties() {
        }
        validateProperties() {
        }
        invalidateSize() {
        }
        validateSize(recursive) {
        }
        invalidateDisplayList() {
        }
        validateDisplayList() {
        }
        validateNow() {
        }
        setLayoutBoundsSize(layoutWidth, layoutHeight) {
        }
        setLayoutBoundsPosition(x, y) {
        }
        getLayoutBounds(bounds) {
        }
        getPreferredBounds(bounds) {
        }
    }
    douUI.Group = Group;
    douUI.sys.implementUIComponent(Group, dou2d.DisplayObjectContainer, true);
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 按渲染项排列显示多个数据的容器
     * @author wizardc
     */
    class DataGroup extends douUI.Group {
        constructor() {
            super();
            this._dataProviderChanged = false;
            this.$DataGroup = {
                0: true,
                1: false,
                2: new Map(),
                3: new Map(),
                4: false,
                5: false,
                6: null,
                7: false,
                8: null,
                9: false,
                10: false,
                11: null // typicalItem
            };
            this._indexToRenderer = [];
        }
        set layout(value) {
            if (value == this._layout) {
                return;
            }
            if (this._layout) {
                this._layout.setTypicalSize(0, 0);
                this._layout.off("useVirtualLayoutChanged", this.onUseVirtualLayoutChanged, this);
            }
            if (this._layout && value && (this._layout.useVirtualLayout != value.useVirtualLayout)) {
                this.onUseVirtualLayoutChanged();
            }
            dou.superSetter(DataGroup, this, "layout", value);
            if (value) {
                let rect = this.$DataGroup[8 /* typicalLayoutRect */];
                if (rect) {
                    value.setTypicalSize(rect.width, rect.height);
                }
                value.useVirtualLayout = this.$DataGroup[0 /* useVirtualLayout */];
                value.on("useVirtualLayoutChanged", this.onUseVirtualLayoutChanged, this);
            }
        }
        get layout() {
            return dou.superGetter(DataGroup, this, "layout");
        }
        onUseVirtualLayoutChanged(event) {
            let values = this.$DataGroup;
            values[1 /* useVirtualLayoutChanged */] = true;
            values[9 /* cleanFreeRenderer */] = true;
            this.removeDataProviderListener();
            this.invalidateProperties();
        }
        set useVirtualLayout(value) {
            value = !!value;
            let values = this.$DataGroup;
            if (value === values[0 /* useVirtualLayout */]) {
                return;
            }
            values[0 /* useVirtualLayout */] = value;
            if (this._layout) {
                this._layout.useVirtualLayout = value;
            }
        }
        get useVirtualLayout() {
            return this._layout ? this._layout.useVirtualLayout : this.$DataGroup[0 /* useVirtualLayout */];
        }
        /**
         * 项呈示器类
         */
        set itemRenderer(value) {
            let values = this.$DataGroup;
            if (values[6 /* itemRenderer */] == value) {
                return;
            }
            values[6 /* itemRenderer */] = value;
            values[5 /* itemRendererChanged */] = true;
            values[7 /* typicalItemChanged */] = true;
            values[9 /* cleanFreeRenderer */] = true;
            this.removeDataProviderListener();
            this.invalidateProperties();
        }
        get itemRenderer() {
            return this.$DataGroup[6 /* itemRenderer */];
        }
        /**
         * 数据源
         */
        set dataProvider(value) {
            if (this._dataProvider == value || (value && !value.getItemAt)) {
                return;
            }
            this.removeDataProviderListener();
            this._dataProvider = value;
            this._dataProviderChanged = true;
            this.$DataGroup[9 /* cleanFreeRenderer */] = true;
            this.invalidateProperties();
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        get dataProvider() {
            return this._dataProvider;
        }
        get numElements() {
            if (!this._dataProvider) {
                return 0;
            }
            return this._dataProvider.length;
        }
        getElementAt(index) {
            return this._indexToRenderer[index];
        }
        getVirtualElementAt(index) {
            index = +index | 0;
            if (index < 0 || index >= this._dataProvider.length) {
                return null;
            }
            let renderer = this._indexToRenderer[index];
            if (!renderer) {
                let item = this._dataProvider.getItemAt(index);
                renderer = this.createVirtualRenderer(item);
                this._indexToRenderer[index] = renderer;
                this.updateRenderer(renderer, index, item);
                let values = this.$DataGroup;
                if (values[4 /* createNewRendererFlag */]) {
                    renderer.validateNow();
                    values[4 /* createNewRendererFlag */] = false;
                    this.rendererAdded(renderer, index, item);
                }
            }
            return renderer;
        }
        setVirtualElementIndicesInView(startIndex, endIndex) {
            if (!this._layout || !this._layout.useVirtualLayout) {
                return;
            }
            let indexToRenderer = this._indexToRenderer;
            let keys = Object.keys(indexToRenderer);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let index = +keys[i];
                if (index < startIndex || index > endIndex) {
                    this.freeRendererByIndex(index);
                }
            }
        }
        freeRendererByIndex(index) {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                delete this._indexToRenderer[index];
                this.doFreeRenderer(renderer);
            }
        }
        doFreeRenderer(renderer) {
            let values = this.$DataGroup;
            let rendererClass = values[2 /* rendererToClassMap */].get(renderer);
            if (!values[3 /* freeRenderers */].has(rendererClass)) {
                values[3 /* freeRenderers */].set(rendererClass, []);
            }
            values[3 /* freeRenderers */].get(rendererClass).push(renderer);
            renderer.visible = false;
        }
        invalidateSize() {
            if (!this.$DataGroup[4 /* createNewRendererFlag */]) {
                super.invalidateSize();
            }
        }
        createVirtualRenderer(item) {
            let renderer;
            let rendererClass = this.itemToRendererClass(item);
            let values = this.$DataGroup;
            let freeRenderers = values[3 /* freeRenderers */];
            if (freeRenderers.has(rendererClass) && freeRenderers.get(rendererClass).length > 0) {
                renderer = freeRenderers.get(rendererClass).pop();
                renderer.visible = true;
                this.invalidateDisplayList();
                return renderer;
            }
            values[4 /* createNewRendererFlag */] = true;
            return this.createOneRenderer(rendererClass);
        }
        createOneRenderer(rendererClass) {
            let renderer = (new rendererClass());
            let values = this.$DataGroup;
            values[2 /* rendererToClassMap */].set(renderer, rendererClass);
            this.addChild(renderer);
            return renderer;
        }
        removeDataProviderListener() {
            if (this._dataProvider) {
                this._dataProvider.off(douUI.CollectionEvent.COLLECTION_CHANGE, this.onCollectionChange, this);
            }
        }
        onCollectionChange(event) {
            switch (event.kind) {
                case 0 /* add */:
                    this.itemAddedHandler(event.items, event.location);
                    break;
                case 2 /* remove */:
                    this.itemRemovedHandler(event.items, event.location);
                    break;
                case 5 /* update */:
                case 3 /* replace */:
                    this.itemUpdatedHandler(event.items[0], event.location);
                    break;
                case 4 /* reset */:
                case 1 /* refresh */: {
                    if (this._layout && this._layout.useVirtualLayout) {
                        let indexToRenderer = this._indexToRenderer;
                        let keys = Object.keys(indexToRenderer);
                        let length = keys.length;
                        for (let i = length - 1; i >= 0; i--) {
                            let index = +keys[i];
                            this.freeRendererByIndex(index);
                        }
                    }
                    this._dataProviderChanged = true;
                    this.invalidateProperties();
                    break;
                }
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        itemAddedHandler(items, index) {
            let length = items.length;
            for (let i = 0; i < length; i++) {
                this.itemAdded(items[i], index + i);
            }
            this.resetRenderersIndices();
        }
        itemRemovedHandler(items, location) {
            let length = items.length;
            for (let i = length - 1; i >= 0; i--) {
                this.itemRemoved(items[i], location + i);
            }
            this.resetRenderersIndices();
        }
        itemAdded(item, index) {
            if (this._layout) {
                this._layout.elementAdded(index);
            }
            if (this._layout && this._layout.useVirtualLayout) {
                this._indexToRenderer.splice(index, 0, null);
                return;
            }
            let renderer = this.createVirtualRenderer(item);
            this._indexToRenderer.splice(index, 0, renderer);
            if (renderer) {
                this.updateRenderer(renderer, index, item);
                let values = this.$DataGroup;
                if (values[4 /* createNewRendererFlag */]) {
                    values[4 /* createNewRendererFlag */] = false;
                    this.rendererAdded(renderer, index, item);
                }
            }
        }
        itemRemoved(item, index) {
            if (this._layout) {
                this._layout.elementRemoved(index);
            }
            let oldRenderer = this._indexToRenderer[index];
            if (this._indexToRenderer.length > index) {
                this._indexToRenderer.splice(index, 1);
            }
            if (oldRenderer) {
                if (this._layout && this._layout.useVirtualLayout) {
                    this.doFreeRenderer(oldRenderer);
                }
                else {
                    this.rendererRemoved(oldRenderer, index, item);
                    this.removeChild(oldRenderer);
                }
            }
        }
        resetRenderersIndices() {
            let indexToRenderer = this._indexToRenderer;
            if (indexToRenderer.length == 0) {
                return;
            }
            if (this._layout && this._layout.useVirtualLayout) {
                let keys = Object.keys(indexToRenderer);
                let length = keys.length;
                for (let i = 0; i < length; i++) {
                    let index = +keys[i];
                    this.resetRendererItemIndex(index);
                }
            }
            else {
                let indexToRendererLength = indexToRenderer.length;
                for (let index = 0; index < indexToRendererLength; index++) {
                    this.resetRendererItemIndex(index);
                }
            }
        }
        itemUpdatedHandler(item, location) {
            // 防止无限循环
            if (this.$DataGroup[10 /* renderersBeingUpdated */]) {
                return;
            }
            let renderer = this._indexToRenderer[location];
            if (renderer) {
                this.updateRenderer(renderer, location, item);
            }
        }
        resetRendererItemIndex(index) {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                renderer.itemIndex = index;
            }
        }
        itemToRendererClass(item) {
            let rendererClass;
            let values = this.$DataGroup;
            if (!rendererClass) {
                rendererClass = values[6 /* itemRenderer */];
            }
            if (!rendererClass) {
                rendererClass = douUI.ItemRenderer;
            }
            return rendererClass;
        }
        createChildren() {
            if (!this._layout) {
                let layout = new douUI.VerticalLayout();
                layout.gap = 0;
                layout.horizontalAlign = 11 /* contentJustify */;
                this.layout = layout;
            }
            super.createChildren();
        }
        commitProperties() {
            let values = this.$DataGroup;
            if (values[5 /* itemRendererChanged */] || this._dataProviderChanged || values[1 /* useVirtualLayoutChanged */]) {
                this.removeAllRenderers();
                if (this._layout) {
                    this._layout.clearVirtualLayoutCache();
                }
                this.setTypicalLayoutRect(null);
                values[1 /* useVirtualLayoutChanged */] = false;
                values[5 /* itemRendererChanged */] = false;
                if (this._dataProvider) {
                    this._dataProvider.on(douUI.CollectionEvent.COLLECTION_CHANGE, this.onCollectionChange, this);
                }
                if (this._layout && this._layout.useVirtualLayout) {
                    this.invalidateSize();
                    this.invalidateDisplayList();
                }
                else {
                    this.createRenderers();
                }
                if (this._dataProviderChanged) {
                    this._dataProviderChanged = false;
                    this.scrollV = this.scrollH = 0;
                }
            }
            super.commitProperties();
            if (values[7 /* typicalItemChanged */]) {
                values[7 /* typicalItemChanged */] = false;
                if (this._dataProvider && this._dataProvider.length > 0) {
                    values[11 /* typicalItem */] = this._dataProvider.getItemAt(0);
                    this.measureRendererSize();
                }
            }
        }
        measure() {
            if (this._layout && this._layout.useVirtualLayout) {
                this.ensureTypicalLayoutElement();
            }
            super.measure();
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            let useVirtualLayout = (this._layout && this._layout.useVirtualLayout);
            if (useVirtualLayout) {
                this.ensureTypicalLayoutElement();
            }
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let values = this.$DataGroup;
            if (useVirtualLayout) {
                // 检查索引 0 处的项测量大小是否发生改变, 若改变就重新计算 typicalLayoutRect
                let rect = values[8 /* typicalLayoutRect */];
                if (rect) {
                    let renderer = this._indexToRenderer[0];
                    if (renderer) {
                        let bounds = dou.recyclable(dou2d.Rectangle);
                        renderer.getPreferredBounds(bounds);
                        if (bounds.width != rect.width || bounds.height != rect.height) {
                            values[8 /* typicalLayoutRect */] = null;
                        }
                        bounds.recycle();
                    }
                }
            }
        }
        ensureTypicalLayoutElement() {
            if (this.$DataGroup[8 /* typicalLayoutRect */]) {
                return;
            }
            if (this._dataProvider && this._dataProvider.length > 0) {
                this.$DataGroup[11 /* typicalItem */] = this._dataProvider.getItemAt(0);
                this.measureRendererSize();
            }
        }
        measureRendererSize() {
            let values = this.$DataGroup;
            if (values[11 /* typicalItem */] == undefined) {
                this.setTypicalLayoutRect(null);
                return;
            }
            let typicalRenderer = this.createVirtualRenderer(values[11 /* typicalItem */]);
            if (!typicalRenderer) {
                this.setTypicalLayoutRect(null);
                return;
            }
            this.updateRenderer(typicalRenderer, 0, values[11 /* typicalItem */]);
            typicalRenderer.validateNow();
            let bounds = dou.recyclable(dou2d.Rectangle);
            typicalRenderer.getPreferredBounds(bounds);
            let rect = new dou2d.Rectangle(0, 0, bounds.width, bounds.height);
            bounds.recycle();
            if (this._layout && this._layout.useVirtualLayout) {
                if (values[4 /* createNewRendererFlag */]) {
                    this.rendererAdded(typicalRenderer, 0, values[11 /* typicalItem */]);
                }
                this.doFreeRenderer(typicalRenderer);
            }
            else {
                this.removeChild(typicalRenderer);
            }
            this.setTypicalLayoutRect(rect);
            values[4 /* createNewRendererFlag */] = false;
        }
        setTypicalLayoutRect(rect) {
            this.$DataGroup[8 /* typicalLayoutRect */] = rect;
            if (this._layout) {
                if (rect) {
                    this._layout.setTypicalSize(rect.width, rect.height);
                }
                else {
                    this._layout.setTypicalSize(0, 0);
                }
            }
        }
        removeAllRenderers() {
            let indexToRenderer = this._indexToRenderer;
            let keys = Object.keys(indexToRenderer);
            let length = keys.length;
            for (let i = 0; i < length; i++) {
                let index = keys[i];
                let renderer = indexToRenderer[index];
                if (renderer) {
                    this.rendererRemoved(renderer, renderer.itemIndex, renderer.data);
                    this.removeChild(renderer);
                }
            }
            this._indexToRenderer = [];
            let values = this.$DataGroup;
            if (values[9 /* cleanFreeRenderer */]) {
                let freeRenderers = values[3 /* freeRenderers */];
                let keys = freeRenderers.keys();
                let length = keys.length;
                for (let i = 0; i < length; i++) {
                    let key = keys[i];
                    let list = freeRenderers.get(key);
                    let length = list.length;
                    for (let i = 0; i < length; i++) {
                        let renderer = list[i];
                        this.rendererRemoved(renderer, renderer.itemIndex, renderer.data);
                        this.removeChild(renderer);
                    }
                }
                values[3 /* freeRenderers */].clear();
                values[2 /* rendererToClassMap */].clear();
                values[9 /* cleanFreeRenderer */] = false;
            }
        }
        createRenderers() {
            if (!this._dataProvider) {
                return;
            }
            let index = 0;
            let length = this._dataProvider.length;
            for (let i = 0; i < length; i++) {
                let item = this._dataProvider.getItemAt(i);
                let rendererClass = this.itemToRendererClass(item);
                let renderer = this.createOneRenderer(rendererClass);
                if (!renderer) {
                    continue;
                }
                this._indexToRenderer[index] = renderer;
                this.updateRenderer(renderer, index, item);
                this.rendererAdded(renderer, index, item);
                index++;
            }
        }
        updateRenderer(renderer, itemIndex, data) {
            let values = this.$DataGroup;
            values[10 /* renderersBeingUpdated */] = true;
            renderer.itemIndex = itemIndex;
            if (renderer.parent == this) {
                this.setChildIndex(renderer, itemIndex);
            }
            renderer.data = data;
            values[10 /* renderersBeingUpdated */] = false;
            return renderer;
        }
        rendererAdded(renderer, index, item) {
        }
        rendererRemoved(renderer, index, item) {
        }
    }
    douUI.DataGroup = DataGroup;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 列表控件基类
     * @author wizardc
     */
    class ListBase extends douUI.DataGroup {
        constructor() {
            super();
            this.$ListBase = {
                0: false,
                1: false,
                2: -2,
                3: -1,
                4: false,
                5: undefined,
                6: false,
                7: null,
                8: false // touchCancle
            };
        }
        /**
         * 是否必须存在选中的项
         */
        set requireSelection(value) {
            value = !!value;
            let values = this.$ListBase;
            if (value === values[0 /* requireSelection */]) {
                return;
            }
            values[0 /* requireSelection */] = value;
            if (value) {
                values[1 /* requireSelectionChanged */] = true;
                this.invalidateProperties();
            }
        }
        get requireSelection() {
            return this.$ListBase[0 /* requireSelection */];
        }
        /**
         * 选中项索引
         */
        set selectedIndex(value) {
            value = +value | 0;
            this.setSelectedIndex(value, false);
        }
        get selectedIndex() {
            return this.getSelectedIndex();
        }
        setSelectedIndex(value, dispatchChangeEvent) {
            if (value == this.selectedIndex) {
                return;
            }
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[4 /* dispatchChangeAfterSelection */] = (values[4 /* dispatchChangeAfterSelection */] || dispatchChangeEvent);
            }
            values[2 /* proposedSelectedIndex */] = value;
            this.invalidateProperties();
        }
        getSelectedIndex() {
            let values = this.$ListBase;
            if (values[2 /* proposedSelectedIndex */] != ListBase.NO_PROPOSED_SELECTION) {
                return values[2 /* proposedSelectedIndex */];
            }
            return values[3 /* selectedIndex */];
        }
        /**
         * 选中项数据
         */
        set selectedItem(value) {
            this.setSelectedItem(value, false);
        }
        get selectedItem() {
            return this.getSelectedItem();
        }
        setSelectedItem(value, dispatchChangeEvent = false) {
            if (this.selectedItem === value) {
                return;
            }
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[4 /* dispatchChangeAfterSelection */] = (values[4 /* dispatchChangeAfterSelection */] || dispatchChangeEvent);
            }
            values[5 /* pendingSelectedItem */] = value;
            this.invalidateProperties();
        }
        getSelectedItem() {
            let values = this.$ListBase;
            if (values[5 /* pendingSelectedItem */] !== undefined) {
                return values[5 /* pendingSelectedItem */];
            }
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex == ListBase.NO_SELECTION || this._dataProvider == null) {
                return undefined;
            }
            return this._dataProvider.length > selectedIndex ? this._dataProvider.getItemAt(selectedIndex) : undefined;
        }
        commitProperties() {
            let dataProviderChanged = this._dataProviderChanged;
            super.commitProperties();
            let values = this.$ListBase;
            let selectedIndex = this.getSelectedIndex();
            let dataProvider = this._dataProvider;
            if (dataProviderChanged) {
                if (selectedIndex >= 0 && dataProvider && selectedIndex < dataProvider.length) {
                    this.itemSelected(selectedIndex, true);
                }
                else if (this.requireSelection) {
                    values[2 /* proposedSelectedIndex */] = 0;
                }
                else {
                    this.setSelectedIndex(-1, false);
                }
            }
            if (values[1 /* requireSelectionChanged */]) {
                values[1 /* requireSelectionChanged */] = false;
                if (values[0 /* requireSelection */] && selectedIndex == ListBase.NO_SELECTION && dataProvider && dataProvider.length > 0) {
                    values[2 /* proposedSelectedIndex */] = 0;
                }
            }
            if (values[5 /* pendingSelectedItem */] !== undefined) {
                if (dataProvider) {
                    values[2 /* proposedSelectedIndex */] = dataProvider.getItemIndex(values[5 /* pendingSelectedItem */]);
                }
                else {
                    values[2 /* proposedSelectedIndex */] = ListBase.NO_SELECTION;
                }
                values[5 /* pendingSelectedItem */] = undefined;
            }
            let changedSelection = false;
            if (values[2 /* proposedSelectedIndex */] != ListBase.NO_PROPOSED_SELECTION) {
                changedSelection = this.commitSelection();
            }
            if (values[6 /* selectedIndexAdjusted */]) {
                values[6 /* selectedIndexAdjusted */] = false;
                if (!changedSelection) {
                    this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                }
            }
        }
        updateRenderer(renderer, itemIndex, data) {
            this.itemSelected(itemIndex, this.isItemIndexSelected(itemIndex));
            return super.updateRenderer(renderer, itemIndex, data);
        }
        itemSelected(index, selected) {
            let renderer = this._indexToRenderer[index];
            if (renderer) {
                renderer.selected = selected;
            }
        }
        isItemIndexSelected(index) {
            return index == this.selectedIndex;
        }
        commitSelection(dispatchChangedEvents = true) {
            let dataProvider = this._dataProvider;
            let values = this.$ListBase;
            let maxIndex = dataProvider ? dataProvider.length - 1 : -1;
            let oldSelectedIndex = values[3 /* selectedIndex */];
            let tmpProposedIndex = values[2 /* proposedSelectedIndex */];
            if (tmpProposedIndex < ListBase.NO_SELECTION) {
                tmpProposedIndex = ListBase.NO_SELECTION;
            }
            if (tmpProposedIndex > maxIndex) {
                tmpProposedIndex = maxIndex;
            }
            if (values[0 /* requireSelection */] && tmpProposedIndex == ListBase.NO_SELECTION && dataProvider && dataProvider.length > 0) {
                values[2 /* proposedSelectedIndex */] = ListBase.NO_PROPOSED_SELECTION;
                values[4 /* dispatchChangeAfterSelection */] = false;
                return false;
            }
            if (values[4 /* dispatchChangeAfterSelection */]) {
                let result = this.dispatchEvent(dou.Event.CHANGING, null, true);
                if (!result) {
                    this.itemSelected(values[2 /* proposedSelectedIndex */], false);
                    values[2 /* proposedSelectedIndex */] = ListBase.NO_PROPOSED_SELECTION;
                    values[4 /* dispatchChangeAfterSelection */] = false;
                    return false;
                }
            }
            values[3 /* selectedIndex */] = tmpProposedIndex;
            values[2 /* proposedSelectedIndex */] = ListBase.NO_PROPOSED_SELECTION;
            if (oldSelectedIndex != ListBase.NO_SELECTION) {
                this.itemSelected(oldSelectedIndex, false);
            }
            if (values[3 /* selectedIndex */] != ListBase.NO_SELECTION) {
                this.itemSelected(values[3 /* selectedIndex */], true);
            }
            if (dispatchChangedEvents) {
                if (values[4 /* dispatchChangeAfterSelection */]) {
                    this.dispatchEvent(dou.Event.CHANGE);
                    values[4 /* dispatchChangeAfterSelection */] = false;
                }
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedItem");
            }
            return true;
        }
        adjustSelection(newIndex) {
            let values = this.$ListBase;
            if (values[2 /* proposedSelectedIndex */] != ListBase.NO_PROPOSED_SELECTION) {
                values[2 /* proposedSelectedIndex */] = newIndex;
            }
            else {
                values[3 /* selectedIndex */] = newIndex;
            }
            values[6 /* selectedIndexAdjusted */] = true;
            this.invalidateProperties();
        }
        itemAdded(item, index) {
            super.itemAdded(item, index);
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex == ListBase.NO_SELECTION) {
                if (this.$ListBase[0 /* requireSelection */]) {
                    this.adjustSelection(index);
                }
            }
            else if (index <= selectedIndex) {
                this.adjustSelection(selectedIndex + 1);
            }
        }
        itemRemoved(item, index) {
            super.itemRemoved(item, index);
            if (this.selectedIndex == ListBase.NO_SELECTION) {
                return;
            }
            let selectedIndex = this.getSelectedIndex();
            if (index == selectedIndex) {
                if (this.requireSelection && this._dataProvider && this._dataProvider.length > 0) {
                    if (index == 0) {
                        this.$ListBase[2 /* proposedSelectedIndex */] = 0;
                        this.invalidateProperties();
                    }
                    else {
                        this.setSelectedIndex(0, false);
                    }
                }
                else {
                    this.adjustSelection(-1);
                }
            }
            else if (index < selectedIndex) {
                this.adjustSelection(selectedIndex - 1);
            }
        }
        onCollectionChange(event) {
            super.onCollectionChange(event);
            if (event.kind == 4 /* reset */) {
                if (this._dataProvider.length == 0) {
                    this.setSelectedIndex(ListBase.NO_SELECTION, false);
                }
            }
            else if (event.kind == 1 /* refresh */) {
                this.dataProviderRefreshed();
            }
        }
        dataProviderRefreshed() {
            this.setSelectedIndex(ListBase.NO_SELECTION, false);
        }
        rendererAdded(renderer, index, item) {
            renderer.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onRendererTouchBegin, this);
            renderer.on(dou2d.TouchEvent.TOUCH_END, this.onRendererTouchEnd, this);
            renderer.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onRendererTouchCancle, this);
        }
        rendererRemoved(renderer, index, item) {
            renderer.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onRendererTouchBegin, this);
            renderer.off(dou2d.TouchEvent.TOUCH_END, this.onRendererTouchEnd, this);
            renderer.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onRendererTouchCancle, this);
        }
        onRendererTouchBegin(event) {
            if (!this._stage) {
                return;
            }
            let values = this.$ListBase;
            if (event.$isDefaultPrevented) {
                return;
            }
            values[8 /* touchCancle */] = false;
            values[7 /* touchDownItemRenderer */] = (event.currentTarget);
            this._stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
        }
        onRendererTouchCancle(event) {
            let values = this.$ListBase;
            values[7 /* touchDownItemRenderer */] = null;
            values[8 /* touchCancle */] = true;
            if (this._stage) {
                this._stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            }
        }
        onRendererTouchEnd(event) {
            let values = this.$ListBase;
            let itemRenderer = (event.currentTarget);
            let touchDownItemRenderer = values[7 /* touchDownItemRenderer */];
            if (itemRenderer != touchDownItemRenderer) {
                return;
            }
            if (!values[8 /* touchCancle */]) {
                this.setSelectedIndex(itemRenderer.itemIndex, true);
                this.dispatchEvent2D(dou2d.Event2D.ITEM_TAP, itemRenderer, true);
            }
            values[8 /* touchCancle */] = false;
        }
        onStageTouchEnd(event) {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.$ListBase[7 /* touchDownItemRenderer */] = null;
        }
    }
    /**
     * 未选中任何项时的索引值
     */
    ListBase.NO_SELECTION = -1;
    /**
     * 未设置缓存选中项的值
     */
    ListBase.NO_PROPOSED_SELECTION = -2;
    douUI.ListBase = ListBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 水平滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class HScrollBar extends douUI.ScrollBarBase {
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let thumb = this.thumb;
            let viewport = this._viewport;
            if (!thumb || !viewport) {
                return;
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            thumb.getPreferredBounds(bounds);
            let thumbWidth = bounds.width;
            let thumbY = bounds.y;
            bounds.recycle();
            let hsp = viewport.scrollH;
            let contentWidth = viewport.contentWidth;
            let width = viewport.width;
            if (hsp <= 0) {
                let scaleWidth = thumbWidth * (1 - (-hsp) / (width * 0.5));
                scaleWidth = Math.max(5, Math.round(scaleWidth));
                thumb.setLayoutBoundsSize(scaleWidth, NaN);
                thumb.setLayoutBoundsPosition(0, thumbY);
            }
            else if (hsp >= contentWidth - width) {
                let scaleWidth = thumbWidth * (1 - (hsp - contentWidth + width) / (width * 0.5));
                scaleWidth = Math.max(5, Math.round(scaleWidth));
                thumb.setLayoutBoundsSize(scaleWidth, NaN);
                thumb.setLayoutBoundsPosition(unscaledWidth - scaleWidth, thumbY);
            }
            else {
                let thumbX = (unscaledWidth - thumbWidth) * hsp / (contentWidth - width);
                thumb.setLayoutBoundsSize(NaN, NaN);
                thumb.setLayoutBoundsPosition(thumbX, thumbY);
            }
        }
        onPropertyChanged(event) {
            switch (event.data) {
                case "scrollH":
                case "contentWidth":
                    this.invalidateDisplayList();
                    break;
            }
        }
    }
    douUI.HScrollBar = HScrollBar;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 水平滑块
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class HSlider extends douUI.SliderBase {
        pointToValue(x, y) {
            if (!this.thumb || !this.track) {
                return 0;
            }
            let values = this.$Range;
            let range = values[0 /* maximum */] - values[2 /* minimum */];
            let thumbRange = this.getThumbRange();
            return values[2 /* minimum */] + (thumbRange != 0 ? (x / thumbRange) * range : 0);
        }
        getThumbRange() {
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.track.getLayoutBounds(bounds);
            let thumbRange = bounds.width;
            this.thumb.getLayoutBounds(bounds);
            thumbRange -= bounds.width;
            bounds.recycle();
            return thumbRange;
        }
        updateSkinDisplayList() {
            if (!this.thumb || !this.track) {
                return;
            }
            let values = this.$Range;
            let thumbRange = this.getThumbRange();
            let range = values[0 /* maximum */] - values[2 /* minimum */];
            let thumbPosTrackX = (range > 0) ? ((this.pendingValue - values[2 /* minimum */]) / range) * thumbRange : 0;
            let point = dou.recyclable(dou2d.Point);
            let thumbPos = this.track.localToGlobal(thumbPosTrackX, 0, point);
            let thumbPosX = thumbPos.x;
            let thumbPosY = thumbPos.y;
            let thumbPosParentX = this.thumb.parent.globalToLocal(thumbPosX, thumbPosY, point).x;
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.thumb.getLayoutBounds(bounds);
            this.thumb.setLayoutBoundsPosition(Math.round(thumbPosParentX), bounds.y);
            bounds.recycle();
            if (this.trackHighlight && this.trackHighlight.parent) {
                let trackHighlightX = this.trackHighlight.parent.globalToLocal(thumbPosX, thumbPosY, point).x - thumbPosTrackX;
                this.trackHighlight.x = Math.round(trackHighlightX);
                this.trackHighlight.width = Math.round(thumbPosTrackX);
            }
            point.recycle();
        }
    }
    douUI.HSlider = HSlider;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 列表类组件的项呈示器
     * @author wizardc
     */
    class ItemRenderer extends douUI.Component {
        constructor() {
            super();
            this._itemIndex = -1;
            this._selected = false;
            this._touchCaptured = false;
            this.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this);
        }
        set data(value) {
            this._data = value;
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "data");
            this.dataChanged();
        }
        get data() {
            return this._data;
        }
        set itemIndex(value) {
            this._itemIndex = value;
        }
        get itemIndex() {
            return this._itemIndex;
        }
        set selected(value) {
            if (this._selected == value) {
                return;
            }
            this._selected = value;
            this.invalidateState();
        }
        get selected() {
            return this._selected;
        }
        dataChanged() {
        }
        onTouchBegin(event) {
            if (!this.stage) {
                return;
            }
            this.stage.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            this.stage.on(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this._touchCaptured = true;
            this.invalidateState();
            event.updateAfterEvent();
        }
        onTouchCancle(event) {
            this._touchCaptured = false;
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this.invalidateState();
        }
        onStageTouchEnd(event) {
            let stage = event.currentTarget;
            stage.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onStageTouchEnd, this);
            this._touchCaptured = false;
            this.invalidateState();
        }
        getCurrentState() {
            let state = "up";
            if (!this.enabled) {
                state = "disabled";
            }
            if (this._touchCaptured) {
                state = "down";
            }
            if (this._selected) {
                return state + "AndSelected";
            }
            return state;
        }
    }
    douUI.ItemRenderer = ItemRenderer;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 富文本
     * @author wizardc
     */
    class RichLabel extends douUI.Group {
        constructor() {
            super();
            this._text = "";
            this._textInvalid = false;
            this._styleInvalid = false;
            this._lastWidth = 0;
            this._lastHeight = 0;
            this._label = new douUI.Label();
            this._label.multiline = true;
            this._label.wordWrap = true;
            this._label.percentWidth = 100;
            this._imageList = [];
        }
        get label() {
            return this._label;
        }
        set fontFamily(value) {
            if (this._label.fontFamily == value) {
                return;
            }
            this._label.fontFamily = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get fontFamily() {
            return this._label.fontFamily;
        }
        set size(value) {
            if (this._label.size == value) {
                return;
            }
            this._label.size = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get size() {
            return this._label.size;
        }
        set bold(value) {
            if (this._label.bold == value) {
                return;
            }
            this._label.bold = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get bold() {
            return this._label.bold;
        }
        set italic(value) {
            if (this._label.italic == value) {
                return;
            }
            this._label.italic = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get italic() {
            return this._label.italic;
        }
        set textAlign(value) {
            if (this._label.textAlign == value) {
                return;
            }
            this._label.textAlign = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get textAlign() {
            return this._label.textAlign;
        }
        set verticalAlign(value) {
            if (this._label.verticalAlign == value) {
                return;
            }
            this._label.verticalAlign = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get verticalAlign() {
            return this._label.verticalAlign;
        }
        set lineSpacing(value) {
            if (this._label.lineSpacing == value) {
                return;
            }
            this._label.lineSpacing = value;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get lineSpacing() {
            return this._label.lineSpacing;
        }
        set textColor(value) {
            this._label.textColor = value;
        }
        get textColor() {
            return this._label.textColor;
        }
        set text(value) {
            if (this._text == value) {
                return;
            }
            this._text = value;
            this._textInvalid = true;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        get text() {
            return this._text;
        }
        set strokeColor(value) {
            this._label.strokeColor = value;
        }
        get strokeColor() {
            return this._label.strokeColor;
        }
        set stroke(value) {
            this._label.stroke = value;
        }
        get stroke() {
            return this._label.stroke;
        }
        get numLines() {
            return this._label.numLines;
        }
        get textWidth() {
            return this._label.textWidth;
        }
        get textHeight() {
            return this._label.textHeight;
        }
        /**
         * 需要添加 g 标签
         * 表情获取如下：label.pickup = /#\d{2}#/g;
         */
        set pickup(value) {
            this._pickup = value;
        }
        get pickup() {
            return this._pickup;
        }
        /**
         * @param result 为获取的匹配结果
         * @returns 对应的图片路径
         */
        set sourceFunc(value) {
            this._sourceFunc = value;
        }
        get sourceFunc() {
            return this._sourceFunc;
        }
        /**
         * @param result 为获取的匹配结果, 设置为空表示缩放为 1
         * @returns 对应的图片缩放值
         */
        set scaleFunc(value) {
            this._scaleFunc = value;
        }
        get scaleFunc() {
            return this._scaleFunc;
        }
        set linkPreventTap(value) {
            this._label.linkPreventTap = value;
        }
        get linkPreventTap() {
            return this._label.linkPreventTap;
        }
        createChildren() {
            super.createChildren();
            this.on(dou2d.Event2D.RESIZE, this.onResize, this);
            this.addChild(this._label);
        }
        onResize(event) {
            dou2d.callLaterUnique(this.$onResize, this);
        }
        $onResize() {
            let width = this.width;
            let height = this.height;
            if (this._lastWidth != width || this._lastHeight != height) {
                this._lastWidth = width;
                this._lastHeight = height;
                this._styleInvalid = true;
                this.onRender();
            }
        }
        onRender() {
            if (this._textInvalid) {
                this._textInvalid = false;
                for (let image of this._imageList) {
                    image.icon.off(dou.Event.COMPLETE, this.onImageLoad, this);
                    image.icon.recycle();
                }
                this._imageList.length = 0;
                let regExp = new RegExp(this._pickup);
                let result;
                while (result = regExp.exec(this._text)) {
                    let source = this._sourceFunc(result);
                    let icon = dou.recyclable(douUI.Image);
                    let scale = 1;
                    if (this._scaleFunc) {
                        scale = this._scaleFunc(result);
                    }
                    let sign = result[0];
                    icon.on(dou.Event.COMPLETE, this.onImageLoad, this);
                    icon.source = source;
                    icon.scaleX = icon.scaleY = scale;
                    icon.smoothing = true;
                    this._imageList.push({ sign, icon, x: 0, y: 0, scale });
                }
            }
            if (this._styleInvalid) {
                this._styleInvalid = false;
                let text = this._text;
                for (let image of this._imageList) {
                    let size = Math.max(image.icon.width, image.icon.height, 5);
                    text = text.replace(image.sign, `<font size = "${~~(size * image.scale)}">　</font>`);
                }
                this._label.textFlow = dou2d.HtmlTextParser.parse(text);
                let textWidth = this._label.textWidth;
                // 修复宽高为 0 的 bug
                if (textWidth == 0) {
                    this._label.$propertyMap[18 /* textLinesChanged */] = true;
                    this._label.$propertyMap[3 /* textFieldWidth */] = this._label.$propertyMap[4 /* textFieldHeight */] = NaN;
                    textWidth = this._label.textWidth;
                }
                textWidth = Math.max(this._label.width, textWidth);
                this._label.$propertyMap[3 /* textFieldWidth */] = textWidth > this.maxWidth ? this.maxWidth : textWidth;
                // 使用下面的代码避免抖动
                this._label.height = this._label.textHeight;
                dou2d.callLaterUnique(this.onTextRender, this);
            }
        }
        onImageLoad(event) {
            let image = event.target;
            image.width = image.texture.textureWidth;
            image.height = image.texture.textureHeight;
            this._styleInvalid = true;
            dou2d.callLaterUnique(this.onRender, this);
        }
        onTextRender() {
            let lines = this._label.$getLinesArr();
            let index = 0, offsetX = 0, offsetY = 0;
            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
                let line = lines[lineIndex];
                if (this._label.textAlign == 0 /* left */) {
                    offsetX = 0;
                }
                else if (this._label.textAlign == 2 /* right */) {
                    offsetX = this._label.width - line.width;
                }
                else if (this._label.textAlign == 1 /* center */) {
                    offsetX = this._label.width - line.width >> 1;
                }
                for (let element of line.elements) {
                    if (element.text == "　") {
                        let image = this._imageList[index++];
                        if (image) {
                            image.x = offsetX;
                            image.y = offsetY;
                        }
                    }
                    offsetX += element.width;
                }
                offsetY += line.height;
            }
            for (let image of this._imageList) {
                let icon = image.icon;
                icon.x = this._label.x + image.x;
                icon.y = this._label.y + image.y;
                this.addChild(icon);
            }
            this.dispatchEvent2D(dou2d.Event2D.RICH_TEXT_CHANGE, null, true);
        }
        clear() {
            for (let image of this._imageList) {
                image.icon.off(dou.Event.COMPLETE, this.onImageLoad, this);
                image.icon.recycle();
            }
            this._imageList.length = 0;
        }
    }
    douUI.RichLabel = RichLabel;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 列表控件, 可以选择一个或多个项目
     * @author wizardc
     */
    class List extends douUI.ListBase {
        constructor() {
            super();
            this._allowMultipleSelection = false;
            this._selectedIndices = [];
        }
        set selectedIndex(value) {
            this.setSelectedIndex(value);
        }
        get selectedIndex() {
            if (this._proposedSelectedIndices) {
                if (this._proposedSelectedIndices.length > 0) {
                    return this._proposedSelectedIndices[0];
                }
                return -1;
            }
            return this.getSelectedIndex();
        }
        /**
         * 是否允许同时选中多项
         */
        set allowMultipleSelection(value) {
            this._allowMultipleSelection = value;
        }
        get allowMultipleSelection() {
            return this._allowMultipleSelection;
        }
        /**
         * 选定数据项的列表
         */
        set selectedItems(value) {
            let indices = [];
            if (value) {
                let count = value.length;
                for (let i = 0; i < count; i++) {
                    let index = this._dataProvider.getItemIndex(value[i]);
                    if (index != -1) {
                        indices.splice(0, 0, index);
                    }
                    if (index == -1) {
                        indices = [];
                        break;
                    }
                }
            }
            this.setSelectedIndices(indices, false);
        }
        get selectedItems() {
            let result = [];
            let list = this.selectedIndices;
            if (list) {
                let count = list.length;
                for (let i = 0; i < count; i++) {
                    result[i] = this._dataProvider.getItemAt(list[i]);
                }
            }
            return result;
        }
        /**
         * 选定数据项的索引列表
         */
        set selectedIndices(value) {
            this.setSelectedIndices(value, false);
        }
        get selectedIndices() {
            if (this._proposedSelectedIndices) {
                return this._proposedSelectedIndices;
            }
            return this._selectedIndices;
        }
        setSelectedIndices(value, dispatchChangeEvent) {
            let values = this.$ListBase;
            if (dispatchChangeEvent) {
                values[4 /* dispatchChangeAfterSelection */] = (values[4 /* dispatchChangeAfterSelection */] || dispatchChangeEvent);
            }
            if (value) {
                this._proposedSelectedIndices = value;
            }
            else {
                this._proposedSelectedIndices = [];
            }
            this.invalidateProperties();
        }
        commitProperties() {
            super.commitProperties();
            if (this._proposedSelectedIndices) {
                this.commitSelection();
            }
        }
        commitSelection(dispatchChangedEvents = true) {
            let values = this.$ListBase;
            let oldSelectedIndex = values[3 /* selectedIndex */];
            if (this._proposedSelectedIndices) {
                this._proposedSelectedIndices = this._proposedSelectedIndices.filter(this.isValidIndex, this);
                if (!this._allowMultipleSelection && this._proposedSelectedIndices.length > 0) {
                    let temp = [];
                    temp.push(this._proposedSelectedIndices[0]);
                    this._proposedSelectedIndices = temp;
                }
                if (this._proposedSelectedIndices.length > 0) {
                    values[2 /* proposedSelectedIndex */] = this._proposedSelectedIndices[0];
                }
                else {
                    values[2 /* proposedSelectedIndex */] = -1;
                }
            }
            let retVal = super.commitSelection(false);
            if (!retVal) {
                this._proposedSelectedIndices = null;
                return false;
            }
            let selectedIndex = this.getSelectedIndex();
            if (selectedIndex > douUI.ListBase.NO_SELECTION) {
                if (this._proposedSelectedIndices) {
                    if (this._proposedSelectedIndices.indexOf(selectedIndex) == -1) {
                        this._proposedSelectedIndices.push(selectedIndex);
                    }
                }
                else {
                    this._proposedSelectedIndices = [selectedIndex];
                }
            }
            if (this._proposedSelectedIndices) {
                if (this._proposedSelectedIndices.indexOf(oldSelectedIndex) != -1) {
                    this.itemSelected(oldSelectedIndex, true);
                }
                this.commitMultipleSelection();
            }
            if (dispatchChangedEvents && retVal) {
                if (values[4 /* dispatchChangeAfterSelection */]) {
                    this.dispatchEvent(dou.Event.CHANGE);
                    values[4 /* dispatchChangeAfterSelection */] = false;
                }
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
                this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedItem");
            }
            return retVal;
        }
        isValidIndex(item, index, v) {
            return this._dataProvider && (item >= 0) && (item < this._dataProvider.length) && item % 1 == 0;
        }
        commitMultipleSelection() {
            let removedItems = [];
            let addedItems = [];
            let i;
            let count;
            let selectedIndices = this._selectedIndices;
            let proposedSelectedIndices = this._proposedSelectedIndices;
            if (selectedIndices.length > 0 && proposedSelectedIndices.length > 0) {
                count = proposedSelectedIndices.length;
                for (i = 0; i < count; i++) {
                    if (selectedIndices.indexOf(proposedSelectedIndices[i]) == -1) {
                        addedItems.push(proposedSelectedIndices[i]);
                    }
                }
                count = selectedIndices.length;
                for (i = 0; i < count; i++) {
                    if (proposedSelectedIndices.indexOf(selectedIndices[i]) == -1) {
                        removedItems.push(selectedIndices[i]);
                    }
                }
            }
            else if (selectedIndices.length > 0) {
                removedItems = selectedIndices;
            }
            else if (proposedSelectedIndices.length > 0) {
                addedItems = proposedSelectedIndices;
            }
            this._selectedIndices = proposedSelectedIndices;
            if (removedItems.length > 0) {
                count = removedItems.length;
                for (i = 0; i < count; i++) {
                    this.itemSelected(removedItems[i], false);
                }
            }
            if (addedItems.length > 0) {
                count = addedItems.length;
                for (i = 0; i < count; i++) {
                    this.itemSelected(addedItems[i], true);
                }
            }
            this._proposedSelectedIndices = null;
        }
        isItemIndexSelected(index) {
            if (this._allowMultipleSelection) {
                return this._selectedIndices.indexOf(index) != -1;
            }
            return super.isItemIndexSelected(index);
        }
        dataProviderRefreshed() {
            if (this._allowMultipleSelection) {
                return;
            }
            super.dataProviderRefreshed();
        }
        calculateSelectedIndices(index) {
            let interval = [];
            let selectedIndices = this._selectedIndices;
            let length = selectedIndices.length;
            if (length > 0) {
                if (length == 1 && (selectedIndices[0] == index)) {
                    if (!this.$ListBase[0 /* requireSelection */]) {
                        return interval;
                    }
                    interval.splice(0, 0, selectedIndices[0]);
                    return interval;
                }
                else {
                    let found = false;
                    for (let i = 0; i < length; i++) {
                        if (selectedIndices[i] == index) {
                            found = true;
                        }
                        else if (selectedIndices[i] != index) {
                            interval.splice(0, 0, selectedIndices[i]);
                        }
                    }
                    if (!found) {
                        interval.splice(0, 0, index);
                    }
                    return interval;
                }
            }
            else {
                interval.splice(0, 0, index);
                return interval;
            }
        }
        onRendererTouchEnd(event) {
            if (this._allowMultipleSelection) {
                let itemRenderer = (event.currentTarget);
                let touchDownItemRenderer = this.$ListBase[7 /* touchDownItemRenderer */];
                if (itemRenderer != touchDownItemRenderer) {
                    return;
                }
                this.setSelectedIndices(this.calculateSelectedIndices(itemRenderer.itemIndex), true);
                this.dispatchEvent2D(dou2d.Event2D.ITEM_TAP, itemRenderer, true);
            }
            else {
                super.onRendererTouchEnd(event);
            }
        }
    }
    douUI.List = List;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 进度条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: "labelDisplay"
     * @author wizardc
     */
    class ProgressBar extends douUI.Range {
        constructor() {
            super(...arguments);
            this._direction = 0 /* ltr */;
            this._thumbInitX = 0;
            this._thumbInitY = 0;
        }
        /**
         * 进度条文本格式化回调函数
         */
        set labelFunction(value) {
            if (this._labelFunction == value) {
                return;
            }
            this._labelFunction = value;
            this.invalidateDisplayList();
        }
        get labelFunction() {
            return this._labelFunction;
        }
        /**
         * 进度条增长方向
         */
        set direction(value) {
            if (this._direction == value) {
                return;
            }
            if (this.thumb) {
                this.thumb.x = this._thumbInitX;
            }
            if (this.thumb) {
                this.thumb.y = this._thumbInitY;
            }
            this._direction = value;
            this.invalidateDisplayList();
        }
        get direction() {
            return this._direction;
        }
        updateSkinDisplayList() {
            let currentValue = this.value;
            let maxValue = this.maximum;
            let thumb = this.thumb;
            if (thumb) {
                let thumbWidth = thumb.width;
                let thumbHeight = thumb.height;
                let clipWidth = Math.round((currentValue / maxValue) * thumbWidth);
                if (clipWidth < 0 || clipWidth === Infinity) {
                    clipWidth = 0;
                }
                let clipHeight = Math.round((currentValue / maxValue) * thumbHeight);
                if (clipHeight < 0 || clipHeight === Infinity) {
                    clipHeight = 0;
                }
                let rect = thumb.scrollRect;
                if (!rect) {
                    rect = new dou2d.Rectangle();
                }
                rect.set(0, 0, thumbWidth, thumbHeight);
                let thumbPosX = thumb.x - rect.x;
                let thumbPosY = thumb.y - rect.y;
                switch (this._direction) {
                    case 0 /* ltr */:
                        rect.width = clipWidth;
                        thumb.x = thumbPosX;
                        break;
                    case 1 /* rtl */:
                        rect.width = clipWidth;
                        rect.x = thumbWidth - clipWidth;
                        thumb.x = rect.x;
                        break;
                    case 2 /* ttb */:
                        rect.height = clipHeight;
                        thumb.y = thumbPosY;
                        break;
                    case 3 /* btt */:
                        rect.height = clipHeight;
                        rect.y = thumbHeight - clipHeight;
                        thumb.y = rect.y;
                        break;
                }
                thumb.scrollRect = rect;
            }
            if (this.labelDisplay) {
                this.labelDisplay.text = this.valueToLabel(currentValue, maxValue);
            }
        }
        valueToLabel(value, maximum) {
            if (this.labelFunction != null) {
                return this._labelFunction(value, maximum);
            }
            return value + "/" + maximum;
        }
    }
    douUI.ProgressBar = ProgressBar;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 矩形绘图组件
     * @author wizardc
     */
    class Rect extends douUI.Component {
        constructor(width, height, fillColor) {
            super();
            this._fillColor = 0x000000;
            this._fillAlpha = 1;
            this._strokeColor = 0x444444;
            this._strokeAlpha = 1;
            this._strokeWeight = 0;
            this._ellipseWidth = 0;
            this._ellipseHeight = 0;
            this.touchChildren = false;
            this._graphics = new dou2d.Graphics();
            this._graphics.$setTarget(this);
            this.width = width;
            this.height = height;
            this.fillColor = fillColor;
        }
        get graphics() {
            return this._graphics;
        }
        /**
         * 填充颜色
         */
        set fillColor(value) {
            if (value == undefined || this._fillColor == value) {
                return;
            }
            this._fillColor = value;
            this.invalidateDisplayList();
        }
        get fillColor() {
            return this._fillColor;
        }
        /**
         * 填充透明度
         */
        set fillAlpha(value) {
            if (this._fillAlpha == value) {
                return;
            }
            this._fillAlpha = value;
            this.invalidateDisplayList();
        }
        get fillAlpha() {
            return this._fillAlpha;
        }
        /**
         * 边框颜色
         */
        set strokeColor(value) {
            if (this._strokeColor == value) {
                return;
            }
            this._strokeColor = value;
            this.invalidateDisplayList();
        }
        get strokeColor() {
            return this._strokeColor;
        }
        /**
         * 边框透明度
         */
        set strokeAlpha(value) {
            if (this._strokeAlpha == value) {
                return;
            }
            this._strokeAlpha = value;
            this.invalidateDisplayList();
        }
        get strokeAlpha() {
            return this._strokeAlpha;
        }
        /**
         * 边框粗细, 为 0 时不显示边框
         */
        set strokeWeight(value) {
            if (this._strokeWeight == value) {
                return;
            }
            this._strokeWeight = value;
            this.invalidateDisplayList();
        }
        get strokeWeight() {
            return this._strokeWeight;
        }
        /**
         * 用于绘制圆角的椭圆的宽度
         */
        set ellipseWidth(value) {
            if (this._ellipseWidth == value) {
                return;
            }
            this._ellipseWidth = value;
            this.invalidateDisplayList();
        }
        get ellipseWidth() {
            return this._ellipseWidth;
        }
        /**
         * 用于绘制圆角的椭圆的高度
         */
        set ellipseHeight(value) {
            if (this._ellipseHeight == value) {
                return;
            }
            this._ellipseHeight = value;
            this.invalidateDisplayList();
        }
        get ellipseHeight() {
            return this._ellipseHeight;
        }
        $measureContentBounds(bounds) {
            if (this._graphics) {
                bounds.set(0, 0, this.width, this.height);
            }
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            let g = this.graphics;
            g.clear();
            if (this._strokeWeight > 0) {
                g.beginFill(this._fillColor, 0);
                g.lineStyle(this._strokeWeight, this._strokeColor, this._strokeAlpha, "square" /* square */, "miter" /* miter */);
                if (this._ellipseWidth == 0 && this._ellipseHeight == 0) {
                    g.drawRect(this._strokeWeight / 2, this._strokeWeight / 2, unscaledWidth - this._strokeWeight, unscaledHeight - this._strokeWeight);
                }
                else {
                    g.drawRoundRect(this._strokeWeight / 2, this._strokeWeight / 2, unscaledWidth - this._strokeWeight, unscaledHeight - this._strokeWeight, this._ellipseWidth, this._ellipseHeight);
                }
                g.endFill();
            }
            g.beginFill(this._fillColor, this._fillAlpha);
            g.lineStyle(this._strokeWeight, this._strokeColor, 0, "square" /* square */, "miter" /* miter */);
            if (this._ellipseWidth == 0 && this._ellipseHeight == 0) {
                g.drawRect(this._strokeWeight, this._strokeWeight, unscaledWidth - this._strokeWeight * 2, unscaledHeight - this._strokeWeight * 2);
            }
            else {
                g.drawRoundRect(this._strokeWeight, this._strokeWeight, unscaledWidth - this._strokeWeight * 2, unscaledHeight - this._strokeWeight * 2, this._ellipseWidth, this._ellipseHeight);
            }
            g.endFill();
        }
        $onRemoveFromStage() {
            super.$onRemoveFromStage();
            if (this._graphics) {
                this._graphics.$onRemoveFromStage();
            }
        }
    }
    douUI.Rect = Rect;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 可滚动组件
     * * 当 viewport 指向的组件大于自己的尺寸时会裁剪 viewport 组件并可进行拖拽
     * * 需要将 viewport 组件作为 Scroller 组件的子项添加到显示列表, 如果不是则在设定 viewport 属性是会自动作为子项添加
     * * 本组件的 touchChildren 属性会被内部逻辑使用, 请保留默认值不要再外部手动设置
     * * 皮肤必须子项: 无
     * * 皮肤可选子项: "horizontalScrollBar", "verticalScrollBar"
     * @author wizardc
     */
    class Scroller extends douUI.Component {
        constructor() {
            super();
            this._bounces = true;
            let touchScrollH = new douUI.sys.TouchScroll(this, this.horizontalUpdateHandler, this.horizontalEndHandler);
            let touchScrollV = new douUI.sys.TouchScroll(this, this.verticalUpdateHandler, this.verticalEndHanlder);
            this.$Scroller = {
                0: 0 /* auto */,
                1: 0 /* auto */,
                2: null,
                3: 0,
                4: 0,
                5: false,
                6: false,
                7: false,
                8: touchScrollH,
                9: touchScrollV,
                10: null,
                11: false // viewprotRemovedEvent
            };
        }
        /**
         * 是否启用回弹
         */
        set bounces(value) {
            this._bounces = !!value;
            let touchScrollH = this.$Scroller[8 /* touchScrollH */];
            if (touchScrollH) {
                touchScrollH.bounces = this._bounces;
            }
            let touchScrollV = this.$Scroller[9 /* touchScrollV */];
            if (touchScrollV) {
                touchScrollV.bounces = this._bounces;
            }
        }
        get bounces() {
            return this._bounces;
        }
        /**
         * 调节滑动结束时滚出的速度, 等于 0 时没有滚动动画
         */
        set throwSpeed(value) {
            value = +value;
            if (value < 0) {
                value = 0;
            }
            this.$Scroller[8 /* touchScrollH */].scrollFactor = value;
            this.$Scroller[9 /* touchScrollV */].scrollFactor = value;
        }
        get throwSpeed() {
            return this.$Scroller[8 /* touchScrollH */].scrollFactor;
        }
        /**
         * 垂直滑动条显示策略
         */
        set scrollPolicyV(value) {
            let values = this.$Scroller;
            if (values[0 /* scrollPolicyV */] == value) {
                return;
            }
            values[0 /* scrollPolicyV */] = value;
            this.checkScrollPolicy();
        }
        get scrollPolicyV() {
            return this.$Scroller[0 /* scrollPolicyV */];
        }
        /**
         * 水平滑动条显示策略
         */
        set scrollPolicyH(value) {
            let values = this.$Scroller;
            if (values[1 /* scrollPolicyH */] == value) {
                return;
            }
            values[1 /* scrollPolicyH */] = value;
            this.checkScrollPolicy();
        }
        get scrollPolicyH() {
            return this.$Scroller[1 /* scrollPolicyH */];
        }
        /**
         * 要滚动的视域组件
         */
        set viewport(value) {
            let values = this.$Scroller;
            if (value == values[10 /* viewport */]) {
                return;
            }
            this.uninstallViewport();
            values[10 /* viewport */] = value;
            values[11 /* viewprotRemovedEvent */] = false;
            this.installViewport();
        }
        get viewport() {
            return this.$Scroller[10 /* viewport */];
        }
        uninstallViewport() {
            if (this.horizontalScrollBar) {
                this.horizontalScrollBar.viewport = null;
            }
            if (this.verticalScrollBar) {
                this.verticalScrollBar.viewport = null;
            }
            let viewport = this.viewport;
            if (viewport) {
                viewport.scrollEnabled = false;
                viewport.off(dou2d.TouchEvent.TOUCH_BEGIN, this.onViewportTouchBegin, this);
                viewport.off(dou2d.Event2D.REMOVED, this.onViewPortRemove, this);
                if (this.$Scroller[11 /* viewprotRemovedEvent */] == false) {
                    this.removeChild(viewport);
                }
            }
        }
        installViewport() {
            let viewport = this.viewport;
            if (viewport) {
                this.addChildAt(viewport, 0);
                viewport.scrollEnabled = true;
                viewport.on(dou2d.TouchEvent.TOUCH_BEGIN, this.onViewportTouchBegin, this);
                viewport.on(dou2d.Event2D.REMOVED, this.onViewPortRemove, this);
            }
            if (this.horizontalScrollBar) {
                this.horizontalScrollBar.viewport = viewport;
            }
            if (this.verticalScrollBar) {
                this.verticalScrollBar.viewport = viewport;
            }
        }
        onViewportTouchBegin(event) {
            if (!this._stage) {
                return;
            }
            let canScroll = this.checkScrollPolicy();
            if (!canScroll) {
                return;
            }
            this.onTouchBegin(event);
        }
        onViewPortRemove(event) {
            if (event.target == this.viewport) {
                this.$Scroller[11 /* viewprotRemovedEvent */] = true;
                this.viewport = null;
            }
        }
        checkScrollPolicy() {
            let values = this.$Scroller;
            let viewport = values[10 /* viewport */];
            if (!viewport) {
                return false;
            }
            let hCanScroll;
            let uiValues = viewport.$UIComponent;
            switch (values[1 /* scrollPolicyH */]) {
                case 0 /* auto */:
                    if (viewport.contentWidth > uiValues[10 /* width */] || viewport.scrollH !== 0) {
                        hCanScroll = true;
                    }
                    else {
                        hCanScroll = false;
                    }
                    break;
                case 2 /* on */:
                    hCanScroll = true;
                    break;
                case 1 /* off */:
                    hCanScroll = false;
                    break;
            }
            values[6 /* horizontalCanScroll */] = hCanScroll;
            let vCanScroll;
            switch (values[0 /* scrollPolicyV */]) {
                case 0 /* auto */:
                    if (viewport.contentHeight > uiValues[11 /* height */] || viewport.scrollV !== 0) {
                        vCanScroll = true;
                    }
                    else {
                        vCanScroll = false;
                    }
                    break;
                case 2 /* on */:
                    vCanScroll = true;
                    break;
                case 1 /* off */:
                    vCanScroll = false;
                    break;
            }
            values[7 /* verticalCanScroll */] = vCanScroll;
            return hCanScroll || vCanScroll;
        }
        onTouchBegin(event) {
            if (event.$isDefaultPrevented()) {
                return;
            }
            if (!this.checkScrollPolicy()) {
                return;
            }
            this._downTarget = event.target;
            let values = this.$Scroller;
            this.stopAnimation();
            values[3 /* touchStartX */] = event.stageX;
            values[4 /* touchStartY */] = event.stageY;
            if (values[6 /* horizontalCanScroll */]) {
                values[8 /* touchScrollH */].start(event.stageX);
            }
            if (values[7 /* verticalCanScroll */]) {
                values[9 /* touchScrollV */].start(event.stageY);
            }
            let stage = this._stage;
            this.on(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.on(dou2d.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            this.on(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
        }
        onTouchMove(event) {
            if (event.$isDefaultPrevented()) {
                return;
            }
            let values = this.$Scroller;
            if (!values[5 /* touchMoved */]) {
                let outX;
                if (Math.abs(values[3 /* touchStartX */] - event.stageX) < Scroller.scrollThreshold) {
                    outX = false;
                }
                else {
                    outX = true;
                }
                let outY;
                if (Math.abs(values[4 /* touchStartY */] - event.stageY) < Scroller.scrollThreshold) {
                    outY = false;
                }
                else {
                    outY = true;
                }
                if (!outX && !outY) {
                    return;
                }
                if (!outY && outX && values[1 /* scrollPolicyH */] == 1 /* off */) {
                    return;
                }
                if (!outX && outY && values[0 /* scrollPolicyV */] == 1 /* off */) {
                    return;
                }
                // 标记开始滚动
                values[5 /* touchMoved */] = true;
                this.touchChildren = false;
                this._downTarget.dispatchTouchEvent(dou2d.TouchEvent.TOUCH_CANCEL, event.stageX, event.stageY, event.touchPointID, event.touchDown, true, true);
                let horizontalBar = this.horizontalScrollBar;
                let verticalBar = this.verticalScrollBar;
                if (horizontalBar && horizontalBar.autoVisibility && values[6 /* horizontalCanScroll */]) {
                    horizontalBar.visible = true;
                }
                if (verticalBar && verticalBar.autoVisibility && values[7 /* verticalCanScroll */]) {
                    verticalBar.visible = true;
                }
                if (values[2 /* autoHideTimer */]) {
                    values[2 /* autoHideTimer */].reset();
                }
                this.dispatchUIEvent(douUI.UIEvent.CHANGE_START);
                this._stage.on(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            }
            event.preventDefault();
            let viewport = values[10 /* viewport */];
            let uiValues = viewport.$UIComponent;
            if (values[6 /* horizontalCanScroll */]) {
                values[8 /* touchScrollH */].update(event.stageX, viewport.contentWidth - uiValues[10 /* width */], viewport.scrollH);
            }
            if (values[7 /* verticalCanScroll */]) {
                values[9 /* touchScrollV */].update(event.stageY, viewport.contentHeight - uiValues[11 /* height */], viewport.scrollV);
            }
        }
        onTouchCancel(event) {
            if (!this.$Scroller[5 /* touchMoved */]) {
                this.onRemoveListeners();
            }
        }
        onTouchEnd(event) {
            let values = this.$Scroller;
            values[5 /* touchMoved */] = false;
            this.touchChildren = true;
            this.onRemoveListeners();
            let viewport = values[10 /* viewport */];
            let uiValues = viewport.$UIComponent;
            if (values[8 /* touchScrollH */].isStarted) {
                values[8 /* touchScrollH */].finish(viewport.scrollH, viewport.contentWidth - uiValues[10 /* width */]);
            }
            if (values[9 /* touchScrollV */].isStarted) {
                values[9 /* touchScrollV */].finish(viewport.scrollV, viewport.contentHeight - uiValues[11 /* height */]);
            }
        }
        onRemoveListeners() {
            let stage = dou2d.$2d.stage;
            this.off(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            stage.off(dou2d.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            stage.off(dou2d.TouchEvent.TOUCH_MOVE, this.onTouchMove, this);
            this.off(dou2d.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.off(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveListeners, this);
        }
        horizontalUpdateHandler(scrollPos) {
            const viewport = this.$Scroller[10 /* viewport */];
            if (viewport) {
                viewport.scrollH = scrollPos;
            }
            this.dispatchEvent(dou.Event.CHANGE);
        }
        verticalUpdateHandler(scrollPos) {
            const viewport = this.$Scroller[10 /* viewport */];
            if (viewport) {
                viewport.scrollV = scrollPos;
            }
            this.dispatchEvent(dou.Event.CHANGE);
        }
        horizontalEndHandler() {
            if (!this.$Scroller[9 /* touchScrollV */].isPlaying) {
                this.onChangeEnd();
            }
        }
        verticalEndHanlder() {
            if (!this.$Scroller[8 /* touchScrollH */].isPlaying) {
                this.onChangeEnd();
            }
        }
        onChangeEnd() {
            let values = this.$Scroller;
            let horizontalBar = this.horizontalScrollBar;
            let verticalBar = this.verticalScrollBar;
            if (horizontalBar && horizontalBar.visible || verticalBar && verticalBar.visible) {
                if (!values[2 /* autoHideTimer */]) {
                    values[2 /* autoHideTimer */] = new dou2d.Timer(200, 1);
                    values[2 /* autoHideTimer */].on(dou2d.TimerEvent.TIMER_COMPLETE, this.onAutoHideTimer, this);
                }
                values[2 /* autoHideTimer */].reset();
                values[2 /* autoHideTimer */].start();
            }
            this.dispatchUIEvent(douUI.UIEvent.CHANGE_END);
        }
        onAutoHideTimer(event) {
            let horizontalBar = this.horizontalScrollBar;
            let verticalBar = this.verticalScrollBar;
            if (horizontalBar && horizontalBar.autoVisibility) {
                horizontalBar.visible = false;
            }
            if (verticalBar && verticalBar.autoVisibility) {
                verticalBar.visible = false;
            }
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let viewport = this.viewport;
            if (viewport) {
                viewport.setLayoutBoundsSize(unscaledWidth, unscaledHeight);
                viewport.setLayoutBoundsPosition(0, 0);
            }
        }
        onSkinAdded() {
            this.horizontalScrollBar.touchChildren = false;
            this.horizontalScrollBar.touchEnabled = false;
            this.horizontalScrollBar.viewport = this.viewport;
            if (this.horizontalScrollBar.autoVisibility) {
                this.horizontalScrollBar.visible = false;
            }
            this.verticalScrollBar.touchChildren = false;
            this.verticalScrollBar.touchEnabled = false;
            this.verticalScrollBar.viewport = this.viewport;
            if (this.verticalScrollBar.autoVisibility) {
                this.verticalScrollBar.visible = false;
            }
        }
        /**
         * 停止滚动的动画
         */
        stopAnimation() {
            let values = this.$Scroller;
            let scrollV = values[9 /* touchScrollV */];
            let scrollH = values[8 /* touchScrollH */];
            if (scrollV.isPlaying) {
                this.dispatchUIEvent(douUI.UIEvent.CHANGE_END);
            }
            else if (scrollH.isPlaying) {
                this.dispatchUIEvent(douUI.UIEvent.CHANGE_END);
            }
            scrollV.stop();
            scrollH.stop();
            let verticalBar = this.verticalScrollBar;
            let horizontalBar = this.horizontalScrollBar;
            if (verticalBar && verticalBar.autoVisibility) {
                verticalBar.visible = false;
            }
            if (horizontalBar && horizontalBar.autoVisibility) {
                horizontalBar.visible = false;
            }
        }
    }
    /**
     * 开始触发滚动的阈值, 当触摸点偏离初始触摸点的距离超过这个值时才会触发滚动
     */
    Scroller.scrollThreshold = 5;
    douUI.Scroller = Scroller;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 选项卡
     * @author wizardc
     */
    class TabBar extends douUI.ListBase {
        constructor() {
            super();
            this._indexBeingUpdated = false;
            this.requireSelection = true;
            this.useVirtualLayout = false;
        }
        set dataProvider(value) {
            let dp = this._dataProvider;
            if (dp && dp instanceof douUI.ViewStack) {
                dp.off(dou.Event.PROPERTY_CHANGE, this.onViewStackIndexChange, this);
                this.off(dou.Event.CHANGE, this.onIndexChanged, this);
            }
            if (value && value instanceof douUI.ViewStack) {
                value.on(dou.Event.PROPERTY_CHANGE, this.onViewStackIndexChange, this);
                this.on(dou.Event.CHANGE, this.onIndexChanged, this);
            }
            dou.superSetter(TabBar, this, "dataProvider", value);
        }
        get dataProvider() {
            return dou.superGetter(TabBar, this, "dataProvider");
        }
        createChildren() {
            if (!this._layout) {
                let layout = new douUI.HorizontalLayout();
                layout.gap = 0;
                layout.horizontalAlign = 10 /* justify */;
                layout.verticalAlign = 11 /* contentJustify */;
                this.layout = layout;
            }
            super.createChildren();
        }
        onIndexChanged(event) {
            this._indexBeingUpdated = true;
            (this._dataProvider).selectedIndex = this.selectedIndex;
            this._indexBeingUpdated = false;
        }
        onViewStackIndexChange(event) {
            if (event.data == "selectedIndex" && !this._indexBeingUpdated) {
                this.setSelectedIndex((this._dataProvider).selectedIndex, false);
            }
        }
    }
    douUI.TabBar = TabBar;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 树形组件
     * @author wizardc
     */
    class Tree extends douUI.Group {
        constructor() {
            super();
            this._showRoot = false;
            this._keepStatus = true;
            this._justOpenOne = false;
            this._allowClose = true;
            this._itemChangedFlag = false;
            this._sizeChangedFlag = false;
            this._itemPool = [];
        }
        /**
         * 项目渲染列表
         * * 分别对应各深度项目的渲染器类
         * * 如果不需要显示顶级深度项目则数组第一个元素为空即可
         */
        set itemRenderers(value) {
            this._itemRenderers = value;
        }
        get itemRenderers() {
            return this._itemRenderers;
        }
        /**
         * 是否显示顶级深度项目
         */
        set showRoot(value) {
            this._showRoot = value;
        }
        get showRoot() {
            return this._showRoot;
        }
        /**
         * 数据源发生变化后, 是否保持之前打开状态
         * * 要求新数据源的父级节点对象仍然是之前的对象
         */
        set keepStatus(value) {
            this._keepStatus = value;
        }
        get keepStatus() {
            return this._keepStatus;
        }
        /**
         * 是否只能展开一个项目
         * * 如果为 true, 展开一个项目之后会关闭其它已经展开的项目
         */
        set justOpenOne(value) {
            this._justOpenOne = value;
        }
        get justOpenOne() {
            return this._justOpenOne;
        }
        /**
         * 展开的项目点击其父级项目是否会收起展开
         */
        set allowClose(value) {
            this._allowClose = value;
        }
        get allowClose() {
            return this._allowClose;
        }
        /**
         * 设置数据源, 子项的字段名为 children 且必须是数组
         * * 无论源数据是否改变, 重新设置都会触发刷新
         */
        set dataProvider(value) {
            let oldDataProvider = this._treeDataProvider;
            this._dataProvider = value;
            let treeDataProvider = douUI.TreeUtil.getTree(this._dataProvider);
            if (this._keepStatus && oldDataProvider) {
                let expandList = [];
                douUI.TreeUtil.forEach(oldDataProvider, false, (data) => {
                    if (data.expand) {
                        expandList.push(data.data);
                    }
                });
                douUI.TreeUtil.forEach(treeDataProvider, false, (data) => {
                    if (expandList.indexOf(data.data) != -1) {
                        data.expand = true;
                    }
                });
            }
            this._treeDataProvider = treeDataProvider;
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        get dataProvider() {
            return this._dataProvider;
        }
        /**
         * 当前选择的项目
         * * 设定之后会展开到当前选择的项目
         */
        set selectedItem(value) {
            if (this._selectedItem == value) {
                return;
            }
            this._selectedItem = value;
            if (this._justOpenOne) {
                douUI.TreeUtil.forEach(this._treeDataProvider, false, (data) => {
                    data.expand = false;
                });
            }
            let treeData = douUI.TreeUtil.getTreeData(this._treeDataProvider, this._selectedItem);
            douUI.TreeUtil.expand(treeData);
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        get selectedItem() {
            return this._selectedItem;
        }
        commitProperties() {
            super.commitProperties();
            if (this._itemChangedFlag) {
                this._itemChangedFlag = false;
                if (this._selectedRenderer) {
                    this._selectedRenderer.selected = false;
                    this._selectedRenderer = undefined;
                }
                let dataList = [];
                // 如果不显示顶级节点, 需要把顶级节点设置为开启状态
                if (!this._showRoot) {
                    this._treeDataProvider.expand = true;
                }
                douUI.TreeUtil.forEach(this._treeDataProvider, true, (data) => {
                    dataList.push(data);
                });
                if (!this._showRoot) {
                    dataList.shift();
                }
                let indexList = [];
                for (let i = 0; i < this._itemRenderers.length; i++) {
                    indexList.push(0);
                }
                let pool = this._itemPool;
                for (let item of dataList) {
                    let depth = item.depth;
                    if (!pool[depth]) {
                        pool[depth] = [];
                    }
                    let list = pool[depth];
                    let index = indexList[depth];
                    let renderer;
                    if (list[index]) {
                        renderer = list[index];
                        if (renderer.parent) {
                            this.setChildIndex(renderer, this.numChildren - 1);
                        }
                        else {
                            this.addChild(renderer);
                        }
                    }
                    else {
                        let itemClass = this._itemRenderers[depth];
                        renderer = new itemClass();
                        renderer.on(dou2d.TouchEvent.TOUCH_TAP, this.onTap, this);
                        list.push(renderer);
                        this.addChild(renderer);
                    }
                    renderer.data = item;
                    indexList[depth]++;
                    if (item.children) {
                        renderer.selected = item.expand;
                    }
                    else if (this._selectedItem === item.data) {
                        renderer.selected = true;
                        this._selectedRenderer = renderer;
                    }
                }
                for (let i = 0; i < pool.length; i++) {
                    let poolList = pool[i];
                    let poolIndex = indexList[i];
                    if (poolList && poolIndex < poolList.length) {
                        for (let j = poolIndex; j < poolList.length; j++) {
                            let item = poolList[j];
                            item.removeSelf();
                        }
                    }
                }
                this._sizeChangedFlag = true;
            }
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            if (this._sizeChangedFlag) {
                this._sizeChangedFlag = false;
                dou2d.callLater(() => {
                    if (this.scrollH + this.scrollRect.width > this.contentWidth) {
                        this.scrollH = Math.max(0, this.contentWidth - this.scrollRect.width);
                    }
                    if (this.scrollV + this.scrollRect.height > this.contentHeight) {
                        this.scrollV = Math.max(0, this.contentHeight - this.scrollRect.height);
                    }
                }, this);
            }
        }
        onTap(event) {
            let data = event.currentTarget.data;
            if (this.dispatchEvent(dou.Event.CHANGING, data, true)) {
                if (data.children) {
                    if (!data.expand) {
                        if (this._justOpenOne) {
                            douUI.TreeUtil.forEach(this._treeDataProvider, false, (data) => {
                                data.expand = false;
                            });
                            douUI.TreeUtil.expand(data);
                        }
                        else {
                            data.expand = true;
                        }
                    }
                    else if (this._allowClose) {
                        data.expand = false;
                    }
                    this._itemChangedFlag = true;
                    this.invalidateProperties();
                    // 没有选择项或者选中项不是当前项目的子项时, 需要重新设定选中项
                    if (!this._selectedItem || !this.checkIsSelected(data)) {
                        this.selectedItem = data.data;
                        this.dispatchEvent(dou.Event.CHANGE, data, true);
                    }
                }
                else {
                    if (this._selectedItem !== data.data) {
                        this.selectedItem = data.data;
                        this.dispatchEvent(dou.Event.CHANGE, data, true);
                    }
                }
            }
        }
        checkIsSelected(data) {
            let selectedItem = this._selectedItem;
            if (!selectedItem) {
                return false;
            }
            if (selectedItem === data.data) {
                return true;
            }
            let selected = douUI.TreeUtil.getTreeData(this._treeDataProvider, selectedItem);
            while (selected.parent) {
                selected = selected.parent;
                if (selected === data) {
                    return true;
                }
            }
            return false;
        }
        getVirtualElementAt(index) {
            let child = this.getElementAt(index);
            if (child) {
                child.visible = true;
                return child;
            }
            return undefined;
        }
        setVirtualElementIndicesInView(startIndex, endIndex) {
            for (let i = 0, len = this.numElements; i < len; i++) {
                let child = this.getElementAt(i);
                if (i < startIndex || i > endIndex) {
                    child.visible = false;
                }
            }
        }
        /**
         * 展开指定项目但并不选中该项目
         */
        expandItem(item) {
            let treeData = douUI.TreeUtil.getTreeData(this._treeDataProvider, item);
            douUI.TreeUtil.expand(treeData);
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        /**
         * 关闭指定项目如果该项目已经展开
         */
        closeItem(item, closeChildren) {
            let treeData = douUI.TreeUtil.getTreeData(this._treeDataProvider, item);
            if (closeChildren) {
                douUI.TreeUtil.forEach(treeData, false, (data) => {
                    data.expand = false;
                });
            }
            else {
                treeData.expand = false;
            }
            this._itemChangedFlag = true;
            this.invalidateProperties();
        }
        updateRenderListByDepth(depth) {
            let list = this._itemPool[depth];
            if (list) {
                for (let render of list) {
                    render.data = render.data;
                }
            }
        }
    }
    douUI.Tree = Tree;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 当舞台尺寸发生改变时会跟随舞台尺寸改变的容器, 通常都将它作为 UI 显示列表的根节点
     * @author wizardc
     */
    class UILayer extends douUI.Group {
        constructor() {
            super();
            this.on(dou2d.Event2D.ADDED_TO_STAGE, this.onAddToStage, this);
            this.on(dou2d.Event2D.REMOVED_FROM_STAGE, this.onRemoveFromStage, this);
        }
        onAddToStage(event) {
            this._stage.on(dou2d.Event2D.RESIZE, this.onResize, this);
            this.onResize();
        }
        onRemoveFromStage(event) {
            this._stage.off(dou2d.Event2D.RESIZE, this.onResize, this);
        }
        onResize(event) {
            let stage = this._stage;
            this.$setWidth(stage.stageWidth);
            this.$setHeight(stage.stageHeight);
        }
    }
    douUI.UILayer = UILayer;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 同一时间只显示一个子项的容器
     * @author wizardc
     */
    class ViewStack extends douUI.Group {
        constructor() {
            super(...arguments);
            this._proposedSelectedIndex = douUI.ListBase.NO_PROPOSED_SELECTION;
            this._selectedIndex = -1;
        }
        get length() {
            return this.$children.length;
        }
        /**
         * 当前可见的子项
         */
        set selectedChild(value) {
            let index = this.getChildIndex(value);
            if (index >= 0 && index < this.numChildren) {
                this.setSelectedIndex(index);
            }
        }
        get selectedChild() {
            let index = this.selectedIndex;
            if (index >= 0 && index < this.numChildren) {
                return this.getChildAt(index);
            }
            return null;
        }
        /**
         * 当前选择的可见子项的索引
         */
        set selectedIndex(value) {
            value = +value | 0;
            this.setSelectedIndex(value);
        }
        get selectedIndex() {
            return this._proposedSelectedIndex != douUI.ListBase.NO_PROPOSED_SELECTION ? this._proposedSelectedIndex : this._selectedIndex;
        }
        /**
         * 设置选中项索引
         */
        setSelectedIndex(value) {
            if (value == this.selectedIndex) {
                return;
            }
            this._proposedSelectedIndex = value;
            this.invalidateProperties();
            this.dispatchEvent(dou.Event.PROPERTY_CHANGE, "selectedIndex");
        }
        $childAdded(child, index) {
            super.$childAdded(child, index);
            this.showOrHide(child, false);
            let selectedIndex = this.selectedIndex;
            if (selectedIndex == -1) {
                this.setSelectedIndex(index);
            }
            else if (index <= this.selectedIndex && this._stage) {
                this.setSelectedIndex(selectedIndex + 1);
            }
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 0 /* add */, index, -1, [child, name]);
        }
        $childRemoved(child, index) {
            super.$childRemoved(child, index);
            this.showOrHide(child, true);
            let selectedIndex = this.selectedIndex;
            if (index == selectedIndex) {
                if (this.numChildren > 0) {
                    if (index == 0) {
                        this._proposedSelectedIndex = 0;
                        this.invalidateProperties();
                    }
                    else {
                        this.setSelectedIndex(0);
                    }
                }
                else {
                    this.setSelectedIndex(-1);
                }
            }
            else if (index < selectedIndex) {
                this.setSelectedIndex(selectedIndex - 1);
            }
            this.dispatchCollectionEvent(douUI.CollectionEvent.COLLECTION_CHANGE, 2 /* remove */, index, -1, [child.name]);
        }
        commitProperties() {
            super.commitProperties();
            if (this._proposedSelectedIndex != douUI.ListBase.NO_PROPOSED_SELECTION) {
                this.commitSelection(this._proposedSelectedIndex);
                this._proposedSelectedIndex = douUI.ListBase.NO_PROPOSED_SELECTION;
            }
        }
        commitSelection(newIndex) {
            if (newIndex >= 0 && newIndex < this.numChildren) {
                this._selectedIndex = newIndex;
                if (this._selectedChild) {
                    this.showOrHide(this._selectedChild, false);
                }
                this._selectedChild = this.getElementAt(this._selectedIndex);
                this.showOrHide(this._selectedChild, true);
            }
            else {
                this._selectedChild = null;
                this._selectedIndex = -1;
            }
            this.invalidateSize();
            this.invalidateDisplayList();
        }
        showOrHide(child, visible) {
            if (douUI.sys.isIUIComponent(child)) {
                child.includeInLayout = visible;
            }
            child.visible = visible;
        }
        getItemAt(index) {
            let element = this.$children[index];
            return element ? element.name : "";
        }
        getItemIndex(item) {
            let list = this.$children;
            let length = list.length;
            for (let i = 0; i < length; i++) {
                if (list[i].name == item) {
                    return i;
                }
            }
            return -1;
        }
    }
    douUI.ViewStack = ViewStack;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 垂直滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class VScrollBar extends douUI.ScrollBarBase {
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let thumb = this.thumb;
            let viewport = this._viewport;
            if (!thumb || !viewport) {
                return;
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            thumb.getPreferredBounds(bounds);
            let thumbHeight = bounds.height;
            let thumbX = bounds.x;
            bounds.recycle();
            let vsp = viewport.scrollV;
            let contentHeight = viewport.contentHeight;
            let height = viewport.height;
            if (vsp <= 0) {
                let scaleHeight = thumbHeight * (1 - (-vsp) / (height * 0.5));
                scaleHeight = Math.max(5, Math.round(scaleHeight));
                thumb.setLayoutBoundsSize(NaN, scaleHeight);
                thumb.setLayoutBoundsPosition(thumbX, 0);
            }
            else if (vsp >= contentHeight - height) {
                let scaleHeight = thumbHeight * (1 - (vsp - contentHeight + height) / (height * 0.5));
                scaleHeight = Math.max(5, Math.round(scaleHeight));
                thumb.setLayoutBoundsSize(NaN, scaleHeight);
                thumb.setLayoutBoundsPosition(thumbX, unscaledHeight - scaleHeight);
            }
            else {
                let thumbY = (unscaledHeight - thumbHeight) * vsp / (contentHeight - height);
                thumb.setLayoutBoundsSize(NaN, NaN);
                thumb.setLayoutBoundsPosition(thumbX, thumbY);
            }
        }
        onPropertyChanged(event) {
            switch (event.data) {
                case "scrollV":
                case "contentHeight":
                    this.invalidateDisplayList();
                    break;
            }
        }
    }
    douUI.VScrollBar = VScrollBar;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 垂直滑块
     * * 皮肤必须子项: "track", "trackHighlight", "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    class VSlider extends douUI.SliderBase {
        pointToValue(x, y) {
            if (!this.thumb || !this.track) {
                return 0;
            }
            let values = this.$Range;
            let range = values[0 /* maximum */] - values[2 /* minimum */];
            let thumbRange = this.getThumbRange();
            return values[2 /* minimum */] + ((thumbRange != 0) ? ((thumbRange - y) / thumbRange) * range : 0);
        }
        getThumbRange() {
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.track.getLayoutBounds(bounds);
            let thumbRange = bounds.height;
            this.thumb.getLayoutBounds(bounds);
            thumbRange -= bounds.height;
            bounds.recycle();
            return thumbRange;
        }
        updateSkinDisplayList() {
            if (!this.thumb || !this.track) {
                return;
            }
            let values = this.$Range;
            let thumbRange = this.getThumbRange();
            let range = values[0 /* maximum */] - values[2 /* minimum */];
            let thumbPosTrackY = (range > 0) ? thumbRange - (((this.pendingValue - values[2 /* minimum */]) / range) * thumbRange) : 0;
            let point = dou.recyclable(dou2d.Point);
            let thumbPos = this.track.localToGlobal(0, thumbPosTrackY, point);
            let thumbPosX = thumbPos.x;
            let thumbPosY = thumbPos.y;
            let thumbPosParentY = this.thumb.parent.globalToLocal(thumbPosX, thumbPosY, point).y;
            let bounds = dou.recyclable(dou2d.Rectangle);
            let thumbHeight = bounds.height;
            this.thumb.getLayoutBounds(bounds);
            this.thumb.setLayoutBoundsPosition(bounds.x, Math.round(thumbPosParentY));
            bounds.recycle();
            if (this.trackHighlight) {
                let trackHighlightY = this.trackHighlight.parent.globalToLocal(thumbPosX, thumbPosY, point).y;
                this.trackHighlight.y = Math.round(trackHighlightY + thumbHeight);
                this.trackHighlight.height = Math.round(thumbRange - trackHighlightY);
            }
            point.recycle();
        }
    }
    douUI.VSlider = VSlider;
})(douUI || (douUI = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchCollectionEvent: {
            value: function (type, kind, location, oldLocation, items, oldItems, cancelable) {
                let event = dou.recyclable(douUI.CollectionEvent);
                event.$initCollectionEvent(type, cancelable, kind, location, oldLocation, items, oldItems);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var douUI;
(function (douUI) {
    /**
     * 集合数据改变事件
     * @author wizardc
     */
    class CollectionEvent extends dou.Event {
        /**
         * 发生的事件类型
         */
        get kind() {
            return this._kind;
        }
        /**
         * 如果 kind 值为 CollectionEventKind.ADD, CollectionEventKind.REMOVE, CollectionEventKind.REPLACE, CollectionEventKind.UPDATE,
         * 则此属性为 items 属性中指定的项目集合中零号元素的的索引
         */
        get location() {
            return this._location;
        }
        /**
         * 此属性为 items 属性中指定的项目在目标集合中原来位置的从零开始的索引
         */
        get oldLocation() {
            return this._oldLocation;
        }
        /**
         * 受事件影响的项目的列表
         */
        get items() {
            return this._items;
        }
        /**
         * 仅当 kind 的值为 CollectionEventKind.REPLACE 时, 表示替换前的项目列表
         */
        get oldItems() {
            return this._oldItems;
        }
        $initCollectionEvent(type, cancelable, kind, location, oldLocation, items, oldItems) {
            this.$initEvent(type, null, cancelable);
            this._kind = kind;
            this._location = +location | 0;
            this._oldLocation = +oldLocation | 0;
            this._items = items || [];
            this._oldItems = oldItems || [];
        }
        onRecycle() {
            super.onRecycle();
            this._kind = null;
            this._location = NaN;
            this._oldLocation = NaN;
            this._items = null;
            this._oldItems = null;
        }
    }
    CollectionEvent.COLLECTION_CHANGE = "collectionChange";
    douUI.CollectionEvent = CollectionEvent;
})(douUI || (douUI = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchItemTapEvent: {
            value: function (type, itemRenderer) {
                let event = dou.recyclable(douUI.ItemTapEvent);
                event.$initItemTapEvent(type, itemRenderer);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var douUI;
(function (douUI) {
    /**
     * 列表项触碰事件
     * @author wizardc
     */
    class ItemTapEvent extends dou2d.Event2D {
        /**
         * 触发触摸事件的项呈示器数据源项
         */
        get item() {
            return this._item;
        }
        /**
         * 触发触摸事件的项呈示器
         */
        get itemRenderer() {
            return this._itemRenderer;
        }
        /**
         * 触发触摸事件的项索引
         */
        get itemIndex() {
            return this._itemIndex;
        }
        $initItemTapEvent(type, itemRenderer) {
            super.$initEvent2D(type);
            this._item = itemRenderer.data;
            this._itemRenderer = itemRenderer;
            this._itemIndex = itemRenderer.itemIndex;
        }
        onRecycle() {
            super.onRecycle();
            this._item = null;
            this._itemRenderer = null;
            this._itemIndex = NaN;
        }
    }
    /**
     * 列表项触碰
     */
    ItemTapEvent.ITEM_TAP = "itemTap";
    douUI.ItemTapEvent = ItemTapEvent;
})(douUI || (douUI = {}));
(function () {
    Object.defineProperties(dou.EventDispatcher.prototype, {
        dispatchUIEvent: {
            value: function (type, bubbles, cancelable) {
                let event = dou.recyclable(douUI.UIEvent);
                event.$initUIEvent(type, bubbles, cancelable);
                let result = this.dispatch(event);
                event.recycle();
                return result;
            },
            enumerable: false
        }
    });
})();
var douUI;
(function (douUI) {
    /**
     * UI 事件
     * @author wizardc
     */
    class UIEvent extends dou2d.Event2D {
        $initUIEvent(type, bubbles, cancelable) {
            this.$initEvent2D(type, null, bubbles, cancelable);
        }
    }
    /**
     * 组件创建完成
     */
    UIEvent.CREATION_COMPLETE = "creationComplete";
    /**
     * UI组件在父级容器中的坐标发生改变事件
     */
    UIEvent.MOVE = "move";
    /**
     * 改变开始
     */
    UIEvent.CHANGE_START = "changeStart";
    /**
     * 改变结束
     */
    UIEvent.CHANGE_END = "changeEnd";
    /**
     * 即将关闭面板事件
     */
    UIEvent.CLOSING = "closing";
    douUI.UIEvent = UIEvent;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 布局基类
     * @author wizardc
     */
    class LayoutBase extends dou.EventDispatcher {
        constructor() {
            super(...arguments);
            this._useVirtualLayout = false;
            this._typicalWidth = 20;
            this._typicalHeight = 20;
        }
        /**
         * 此布局将测量其元素, 调整其元素的大小并定位其元素的 Group 容器
         */
        set target(value) {
            if (this._target === value) {
                return;
            }
            this._target = value;
            this.clearVirtualLayoutCache();
        }
        get target() {
            return this._target;
        }
        /**
         * 是否使用虚拟布局
         */
        set useVirtualLayout(value) {
            value = !!value;
            if (this._useVirtualLayout == value) {
                return;
            }
            this._useVirtualLayout = value;
            this.dispatchEvent("useVirtualLayoutChanged");
            if (this._useVirtualLayout && !value) {
                this.clearVirtualLayoutCache();
            }
            if (this.target) {
                this.target.invalidateDisplayList();
            }
        }
        get useVirtualLayout() {
            return this._useVirtualLayout;
        }
        /**
         * 设置一个典型元素的大小
         */
        setTypicalSize(width, height) {
            width = +width || 20;
            height = +height || 20;
            if (width !== this._typicalWidth || height !== this._typicalHeight) {
                this._typicalWidth = width;
                this._typicalHeight = height;
                if (this._target) {
                    this._target.invalidateSize();
                }
            }
        }
        scrollPositionChanged() {
        }
        clearVirtualLayoutCache() {
        }
        elementAdded(index) {
        }
        elementRemoved(index) {
        }
        getElementIndicesInView() {
            return null;
        }
        /**
         * 基于目标的内容测量其默认大小
         */
        measure() {
        }
        /**
         * 调整目标的元素的大小并定位这些元素
         */
        updateDisplayList(width, height) {
        }
    }
    douUI.LayoutBase = LayoutBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 线性布局基类
     * @author wizardc
     */
    class LinearLayoutBase extends douUI.LayoutBase {
        constructor() {
            super();
            this._horizontalAlign = 0 /* left */;
            this._verticalAlign = 0 /* top */;
            this._gap = 6;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._paddingTop = 0;
            this._paddingBottom = 0;
            /**
             * 虚拟布局使用的当前视图中的第一个元素索引
             */
            this._startIndex = -1;
            /**
             * 虚拟布局使用的当前视图中的最后一个元素的索引
             */
            this._endIndex = -1;
            /**
             * 视图的第一个和最后一个元素的索引值已经计算好的标志
             */
            this._indexInViewCalculated = false;
            /**
             * 子元素最大的尺寸
             */
            this._maxElementSize = 0;
            this._elementSizeTable = [];
        }
        /**
         * 布局元素的水平对齐策略
         */
        set horizontalAlign(value) {
            if (this._horizontalAlign == value) {
                return;
            }
            this._horizontalAlign = value;
            if (this._target) {
                this._target.invalidateDisplayList();
            }
        }
        get horizontalAlign() {
            return this._horizontalAlign;
        }
        /**
         * 布局元素的垂直对齐策略
         */
        set verticalAlign(value) {
            if (this._verticalAlign == value) {
                return;
            }
            this._verticalAlign = value;
            if (this._target) {
                this._target.invalidateDisplayList();
            }
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        /**
         * 布局元素之间的间隔
         */
        set gap(value) {
            value = +value || 0;
            if (this._gap === value) {
                return;
            }
            this._gap = value;
            this.invalidateTargetLayout();
        }
        get gap() {
            return this._gap;
        }
        /**
         * 容器的左边缘与第一个布局元素的左边缘之间的像素数
         */
        set paddingLeft(value) {
            value = +value || 0;
            if (this._paddingLeft === value) {
                return;
            }
            this._paddingLeft = value;
            this.invalidateTargetLayout();
        }
        get paddingLeft() {
            return this._paddingLeft;
        }
        /**
         * 容器的右边缘与最后一个布局元素的右边缘之间的像素数
         */
        set paddingRight(value) {
            value = +value || 0;
            if (this._paddingRight === value) {
                return;
            }
            this._paddingRight = value;
            this.invalidateTargetLayout();
        }
        get paddingRight() {
            return this._paddingRight;
        }
        /**
         * 容器的顶边缘与所有容器的布局元素的顶边缘之间的最少像素数
         */
        set paddingTop(value) {
            value = +value || 0;
            if (this._paddingTop === value) {
                return;
            }
            this._paddingTop = value;
            this.invalidateTargetLayout();
        }
        get paddingTop() {
            return this._paddingTop;
        }
        /**
         * 容器的底边缘与所有容器的布局元素的底边缘之间的最少像素数
         */
        set paddingBottom(value) {
            value = +value || 0;
            if (this._paddingBottom === value) {
                return;
            }
            this._paddingBottom = value;
            this.invalidateTargetLayout();
        }
        get paddingBottom() {
            return this._paddingBottom;
        }
        /**
         * 失效目标容器的尺寸和显示列表的简便方法
         */
        invalidateTargetLayout() {
            let target = this._target;
            if (target) {
                target.invalidateSize();
                target.invalidateDisplayList();
            }
        }
        measure() {
            if (!this._target) {
                return;
            }
            if (this._useVirtualLayout) {
                this.measureVirtual();
            }
            else {
                this.measureReal();
            }
        }
        /**
         * 计算目标容器 measuredWidth 和 measuredHeight 的精确值
         */
        measureReal() {
        }
        /**
         * 计算目标容器 measuredWidth 和 measuredHeight 的近似值
         */
        measureVirtual() {
        }
        updateDisplayList(width, height) {
            let target = this._target;
            if (!target) {
                return;
            }
            if (target.numElements == 0) {
                target.setContentSize(Math.ceil(this._paddingLeft + this._paddingRight), Math.ceil(this._paddingTop + this._paddingBottom));
                return;
            }
            if (this._useVirtualLayout) {
                this.updateDisplayListVirtual(width, height);
            }
            else {
                this.updateDisplayListReal(width, height);
            }
        }
        /**
         * 获取指定索引元素的起始位置
         */
        getStartPosition(index) {
            return 0;
        }
        /**
         * 获取指定索引元素的尺寸
         */
        getElementSize(index) {
            return 0;
        }
        /**
         * 获取缓存的子对象尺寸总和
         */
        getElementTotalSize() {
            return 0;
        }
        elementRemoved(index) {
            if (!this._useVirtualLayout) {
                return;
            }
            super.elementRemoved(index);
            this._elementSizeTable.splice(index, 1);
        }
        clearVirtualLayoutCache() {
            if (!this._useVirtualLayout) {
                return;
            }
            this._elementSizeTable = [];
            this._maxElementSize = 0;
        }
        /**
         * 折半查找法寻找指定位置的显示对象索引
         */
        findIndexAt(x, i0, i1) {
            let index = ((i0 + i1) * 0.5) | 0;
            let elementX = this.getStartPosition(index);
            let elementWidth = this.getElementSize(index);
            if ((x >= elementX) && (x < elementX + elementWidth + this._gap)) {
                return index;
            }
            else if (i0 == i1) {
                return -1;
            }
            else if (x < elementX) {
                return this.findIndexAt(x, i0, Math.max(i0, index - 1));
            }
            return this.findIndexAt(x, Math.min(index + 1, i1), i1);
        }
        scrollPositionChanged() {
            super.scrollPositionChanged();
            if (this._useVirtualLayout) {
                let changed = this.getIndexInView();
                if (changed) {
                    this._indexInViewCalculated = true;
                    this.target.invalidateDisplayList();
                }
            }
        }
        /**
         * 获取视图中第一个和最后一个元素的索引, 返回是否发生改变
         */
        getIndexInView() {
            return false;
        }
        /**
         * 更新虚拟布局的显示列表
         */
        updateDisplayListVirtual(width, height) {
        }
        /**
         * 更新真实布局的显示列表
         */
        updateDisplayListReal(width, height) {
        }
        /**
         * 为每个可变尺寸的子项分配空白区域
         */
        flexChildrenProportionally(spaceForChildren, spaceToDistribute, totalPercent, childInfoArray) {
            let numElements = childInfoArray.length;
            let done;
            do {
                done = true;
                let unused = spaceToDistribute - (spaceForChildren * totalPercent / 100);
                if (unused > 0) {
                    spaceToDistribute -= unused;
                }
                else {
                    unused = 0;
                }
                let spacePerPercent = spaceToDistribute / totalPercent;
                for (let i = 0; i < numElements; i++) {
                    let childInfo = childInfoArray[i];
                    let size = childInfo.percent * spacePerPercent;
                    if (size < childInfo.min) {
                        let min = childInfo.min;
                        childInfo.size = min;
                        childInfoArray[i] = childInfoArray[--numElements];
                        childInfoArray[numElements] = childInfo;
                        totalPercent -= childInfo.percent;
                        if (unused >= min) {
                            unused -= min;
                        }
                        else {
                            spaceToDistribute -= min - unused;
                            unused = 0;
                        }
                        done = false;
                        break;
                    }
                    else if (size > childInfo.max) {
                        let max = childInfo.max;
                        childInfo.size = max;
                        childInfoArray[i] = childInfoArray[--numElements];
                        childInfoArray[numElements] = childInfo;
                        totalPercent -= childInfo.percent;
                        if (unused >= max) {
                            unused -= max;
                        }
                        else {
                            spaceToDistribute -= max - unused;
                            unused = 0;
                        }
                        done = false;
                        break;
                    }
                    else {
                        childInfo.size = size;
                    }
                }
            } while (!done);
        }
    }
    douUI.LinearLayoutBase = LinearLayoutBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 子项信息
         * @author wizardc
         */
        class ChildInfo {
            constructor() {
                this.size = 0;
            }
        }
        sys.ChildInfo = ChildInfo;
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 基础布局类, 子项可以任意布局
     * @author wizardc
     */
    class BasicLayout extends douUI.LayoutBase {
        measure() {
            super.measure();
            douUI.sys.measure(this._target);
        }
        updateDisplayList(unscaledWidth, unscaledHeight) {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let target = this._target;
            let pos = douUI.sys.updateDisplayList(target, unscaledWidth, unscaledHeight);
            target.setContentSize(Math.ceil(pos.x), Math.ceil(pos.y));
        }
    }
    douUI.BasicLayout = BasicLayout;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 水平布局类
     * @author wizardc
     */
    class HorizontalLayout extends douUI.LinearLayoutBase {
        measureReal() {
            let target = this._target;
            let count = target.numElements;
            let numElements = count;
            let measuredWidth = 0;
            let measuredHeight = 0;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (let i = 0; i < count; i++) {
                let layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    numElements--;
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                measuredWidth += bounds.width;
                measuredHeight = Math.max(measuredHeight, bounds.height);
            }
            bounds.recycle();
            measuredWidth += (numElements - 1) * this._gap;
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
        }
        measureVirtual() {
            let target = this._target;
            let typicalWidth = this._typicalWidth;
            let measuredWidth = this.getElementTotalSize();
            let measuredHeight = Math.max(this._maxElementSize, this._typicalHeight);
            let bounds = dou.recyclable(dou2d.Rectangle);
            let endIndex = this._endIndex;
            let elementSizeTable = this._elementSizeTable;
            for (let index = this._startIndex; index < endIndex; index++) {
                let layoutElement = (target.getElementAt(index));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                measuredWidth += bounds.width;
                measuredWidth -= isNaN(elementSizeTable[index]) ? typicalWidth : elementSizeTable[index];
                measuredHeight = Math.max(measuredHeight, bounds.height);
            }
            bounds.recycle();
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
        }
        updateDisplayListReal(width, height) {
            let target = this._target;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let gap = this._gap;
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let hJustify = this._horizontalAlign == 10 /* justify */;
            let vJustify = this._verticalAlign == 10 /* justify */ || this._verticalAlign == 11 /* contentJustify */;
            let vAlign = 0;
            if (!vJustify) {
                if (this._verticalAlign == 1 /* middle */) {
                    vAlign = 0.5;
                }
                else if (this._verticalAlign == 2 /* bottom */) {
                    vAlign = 1;
                }
            }
            let count = target.numElements;
            let numElements = count;
            let x = paddingL;
            let y = paddingT;
            let i;
            let layoutElement;
            let totalPreferredWidth = 0;
            let totalPercentWidth = 0;
            let childInfoArray = [];
            let childInfo;
            let widthToDistribute = targetWidth;
            let maxElementHeight = this._maxElementSize;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (i = 0; i < count; i++) {
                let layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    numElements--;
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                maxElementHeight = Math.max(maxElementHeight, bounds.height);
                if (hJustify) {
                    totalPreferredWidth += bounds.width;
                }
                else {
                    let values = layoutElement.$UIComponent;
                    if (!isNaN(values[6 /* percentWidth */])) {
                        totalPercentWidth += values[6 /* percentWidth */];
                        childInfo = new douUI.sys.ChildInfo();
                        childInfo.layoutElement = layoutElement;
                        childInfo.percent = values[6 /* percentWidth */];
                        childInfo.min = values[12 /* minWidth */];
                        childInfo.max = values[13 /* maxWidth */];
                        childInfoArray.push(childInfo);
                    }
                    else {
                        widthToDistribute -= bounds.width;
                    }
                }
            }
            widthToDistribute -= gap * (numElements - 1);
            widthToDistribute = widthToDistribute > 0 ? widthToDistribute : 0;
            let excessSpace = targetWidth - totalPreferredWidth - gap * (numElements - 1);
            let averageWidth;
            let largeChildrenCount = numElements;
            let widthDic = new Map();
            if (hJustify) {
                if (excessSpace < 0) {
                    averageWidth = widthToDistribute / numElements;
                    for (i = 0; i < count; i++) {
                        layoutElement = (target.getElementAt(i));
                        if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                            continue;
                        }
                        layoutElement.getPreferredBounds(bounds);
                        if (bounds.width <= averageWidth) {
                            widthToDistribute -= bounds.width;
                            largeChildrenCount--;
                            continue;
                        }
                    }
                    widthToDistribute = widthToDistribute > 0 ? widthToDistribute : 0;
                }
            }
            else {
                if (totalPercentWidth > 0) {
                    this.flexChildrenProportionally(targetWidth, widthToDistribute, totalPercentWidth, childInfoArray);
                    let roundOff = 0;
                    let length = childInfoArray.length;
                    for (i = 0; i < length; i++) {
                        childInfo = childInfoArray[i];
                        let childSize = Math.round(childInfo.size + roundOff);
                        roundOff += childInfo.size - childSize;
                        widthDic.set(childInfo.layoutElement, childSize);
                        widthToDistribute -= childSize;
                    }
                    widthToDistribute = widthToDistribute > 0 ? widthToDistribute : 0;
                }
            }
            if (this._horizontalAlign == 1 /* center */) {
                x = paddingL + widthToDistribute * 0.5;
            }
            else if (this._horizontalAlign == 2 /* right */) {
                x = paddingL + widthToDistribute;
            }
            let maxX = paddingL;
            let maxY = paddingT;
            let dx = 0;
            let dy = 0;
            let justifyHeight = Math.ceil(targetHeight);
            if (this._verticalAlign == 11 /* contentJustify */) {
                justifyHeight = Math.ceil(Math.max(targetHeight, maxElementHeight));
            }
            let roundOff = 0;
            let layoutElementWidth;
            let childWidth;
            for (i = 0; i < count; i++) {
                let exceesHeight = 0;
                layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                layoutElementWidth = NaN;
                if (hJustify) {
                    childWidth = NaN;
                    if (excessSpace > 0) {
                        childWidth = widthToDistribute * bounds.width / totalPreferredWidth;
                    }
                    else if (excessSpace < 0 && bounds.width > averageWidth) {
                        childWidth = widthToDistribute / largeChildrenCount;
                    }
                    if (!isNaN(childWidth)) {
                        layoutElementWidth = Math.round(childWidth + roundOff);
                        roundOff += childWidth - layoutElementWidth;
                    }
                }
                else {
                    layoutElementWidth = widthDic.get(layoutElement);
                }
                if (vJustify) {
                    y = paddingT;
                    layoutElement.setLayoutBoundsSize(layoutElementWidth, justifyHeight);
                    layoutElement.getLayoutBounds(bounds);
                }
                else {
                    let layoutElementHeight = NaN;
                    let values = layoutElement.$UIComponent;
                    if (!isNaN(layoutElement.percentHeight)) {
                        let percent = Math.min(100, values[7 /* percentHeight */]);
                        layoutElementHeight = Math.round(targetHeight * percent * 0.01);
                    }
                    layoutElement.setLayoutBoundsSize(layoutElementWidth, layoutElementHeight);
                    layoutElement.getLayoutBounds(bounds);
                    exceesHeight = (targetHeight - bounds.height) * vAlign;
                    exceesHeight = exceesHeight > 0 ? exceesHeight : 0;
                    y = paddingT + exceesHeight;
                }
                layoutElement.setLayoutBoundsPosition(Math.round(x), Math.round(y));
                dx = Math.ceil(bounds.width);
                dy = Math.ceil(bounds.height);
                maxX = Math.max(maxX, x + dx);
                maxY = Math.max(maxY, y + dy);
                x += dx + gap;
            }
            this._maxElementSize = maxElementHeight;
            target.setContentSize(maxX + paddingR, maxY + paddingB);
        }
        updateDisplayListVirtual(width, height) {
            let target = this._target;
            if (this._indexInViewCalculated) {
                this._indexInViewCalculated = false;
            }
            else {
                this.getIndexInView();
            }
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let gap = this._gap;
            let contentWidth;
            let numElements = target.numElements;
            if (this._startIndex == -1 || this._endIndex == -1) {
                contentWidth = this.getStartPosition(numElements) - gap + paddingR;
                target.setContentSize(contentWidth, target.contentHeight);
                return;
            }
            let endIndex = this._endIndex;
            target.setVirtualElementIndicesInView(this._startIndex, endIndex);
            // 获取垂直布局参数
            let justify = this._verticalAlign == 10 /* justify */ || this._verticalAlign == 11 /* contentJustify */;
            let contentJustify = this._verticalAlign == 11 /* contentJustify */;
            let vAlign = 0;
            if (!justify) {
                if (this._verticalAlign == 1 /* middle */) {
                    vAlign = 0.5;
                }
                else if (this._verticalAlign == 2 /* bottom */) {
                    vAlign = 1;
                }
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let justifyHeight = Math.ceil(targetHeight);
            let layoutElement;
            let typicalHeight = this._typicalHeight;
            let typicalWidth = this._typicalWidth;
            let maxElementHeight = this._maxElementSize;
            let oldMaxH = Math.max(typicalHeight, this._maxElementSize);
            if (contentJustify) {
                for (let index = this._startIndex; index <= endIndex; index++) {
                    layoutElement = (target.getVirtualElementAt(index));
                    if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                        continue;
                    }
                    layoutElement.getPreferredBounds(bounds);
                    maxElementHeight = Math.max(maxElementHeight, bounds.height);
                }
                justifyHeight = Math.ceil(Math.max(targetHeight, maxElementHeight));
            }
            let x = 0;
            let y = 0;
            let contentHeight = 0;
            let oldElementSize;
            let needInvalidateSize = false;
            let elementSizeTable = this._elementSizeTable;
            // 对可见区域进行布局
            for (let i = this._startIndex; i <= endIndex; i++) {
                let exceesHeight = 0;
                layoutElement = (target.getVirtualElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                if (!contentJustify) {
                    maxElementHeight = Math.max(maxElementHeight, bounds.height);
                }
                if (justify) {
                    y = paddingT;
                    layoutElement.setLayoutBoundsSize(NaN, justifyHeight);
                    layoutElement.getLayoutBounds(bounds);
                }
                else {
                    layoutElement.getLayoutBounds(bounds);
                    exceesHeight = (targetHeight - bounds.height) * vAlign;
                    exceesHeight = exceesHeight > 0 ? exceesHeight : 0;
                    y = paddingT + exceesHeight;
                }
                contentHeight = Math.max(contentHeight, bounds.height);
                if (!needInvalidateSize) {
                    oldElementSize = isNaN(elementSizeTable[i]) ? typicalWidth : elementSizeTable[i];
                    if (oldElementSize != bounds.width) {
                        needInvalidateSize = true;
                    }
                }
                elementSizeTable[i] = bounds.width;
                x = this.getStartPosition(i);
                layoutElement.setLayoutBoundsPosition(Math.round(x), Math.round(y));
            }
            bounds.recycle();
            contentHeight += paddingT + paddingB;
            contentWidth = this.getStartPosition(numElements) - gap + paddingR;
            this._maxElementSize = maxElementHeight;
            target.setContentSize(contentWidth, contentHeight);
            if (needInvalidateSize || oldMaxH < this._maxElementSize) {
                target.invalidateSize();
            }
        }
        getStartPosition(index) {
            if (!this._useVirtualLayout) {
                if (this._target) {
                    let element = this._target.getElementAt(index);
                    if (element) {
                        return element.x;
                    }
                }
            }
            let typicalWidth = this._typicalWidth;
            let startPos = this._paddingLeft;
            let gap = this._gap;
            let elementSizeTable = this._elementSizeTable;
            for (let i = 0; i < index; i++) {
                let w = elementSizeTable[i];
                if (isNaN(w)) {
                    w = typicalWidth;
                }
                startPos += w + gap;
            }
            return startPos;
        }
        getElementSize(index) {
            if (this._useVirtualLayout) {
                let size = this._elementSizeTable[index];
                if (isNaN(size)) {
                    size = this._typicalWidth;
                }
                return size;
            }
            if (this._target) {
                return this._target.getElementAt(index).width;
            }
            return 0;
        }
        getElementTotalSize() {
            let typicalWidth = this._typicalWidth;
            let gap = this._gap;
            let totalSize = 0;
            let length = this._target.numElements;
            let elementSizeTable = this._elementSizeTable;
            for (let i = 0; i < length; i++) {
                let w = elementSizeTable[i];
                if (isNaN(w)) {
                    w = typicalWidth;
                }
                totalSize += w + gap;
            }
            totalSize -= gap;
            return totalSize;
        }
        elementAdded(index) {
            if (!this.useVirtualLayout) {
                return;
            }
            super.elementAdded(index);
            this._elementSizeTable.splice(index, 0, this._typicalWidth);
        }
        getIndexInView() {
            let target = this._target;
            if (!target || target.numElements == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let values = target.$UIComponent;
            if (values[10 /* width */] <= 0 || values[11 /* height */] <= 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let numElements = target.numElements;
            let contentWidth = this.getStartPosition(numElements - 1) + this._elementSizeTable[numElements - 1] + this._paddingRight;
            let minVisibleX = target.scrollH;
            if (minVisibleX > contentWidth - this._paddingRight) {
                this._startIndex = -1;
                this._endIndex = -1;
                return false;
            }
            let maxVisibleX = target.scrollH + values[10 /* width */];
            if (maxVisibleX < this._paddingLeft) {
                this._startIndex = -1;
                this._endIndex = -1;
                return false;
            }
            let oldStartIndex = this._startIndex;
            let oldEndIndex = this._endIndex;
            this._startIndex = this.findIndexAt(minVisibleX, 0, numElements - 1);
            if (this._startIndex == -1) {
                this._startIndex = 0;
            }
            this._endIndex = this.findIndexAt(maxVisibleX, 0, numElements - 1);
            if (this._endIndex == -1) {
                this._endIndex = numElements - 1;
            }
            return oldStartIndex != this._startIndex || oldEndIndex != this._endIndex;
        }
    }
    douUI.HorizontalLayout = HorizontalLayout;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 垂直布局类
     * @author wizardc
     */
    class VerticalLayout extends douUI.LinearLayoutBase {
        measureReal() {
            let target = this._target;
            let count = target.numElements;
            let numElements = count;
            let measuredWidth = 0;
            let measuredHeight = 0;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (let i = 0; i < count; i++) {
                let layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    numElements--;
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                measuredHeight += bounds.height;
                measuredWidth = Math.max(measuredWidth, bounds.width);
            }
            bounds.recycle();
            measuredHeight += (numElements - 1) * this._gap;
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
        }
        measureVirtual() {
            let target = this._target;
            let typicalHeight = this._typicalHeight;
            let measuredHeight = this.getElementTotalSize();
            let measuredWidth = Math.max(this._maxElementSize, this._typicalWidth);
            let bounds = dou.recyclable(dou2d.Rectangle);
            let endIndex = this._endIndex;
            let elementSizeTable = this._elementSizeTable;
            for (let index = this._startIndex; index < endIndex; index++) {
                let layoutElement = (target.getElementAt(index));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                measuredHeight += bounds.height;
                measuredHeight -= isNaN(elementSizeTable[index]) ? typicalHeight : elementSizeTable[index];
                measuredWidth = Math.max(measuredWidth, bounds.width);
            }
            bounds.recycle();
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
        }
        updateDisplayListReal(width, height) {
            let target = this._target;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let gap = this._gap;
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let vJustify = this._verticalAlign == 10 /* justify */;
            let hJustify = this._horizontalAlign == 10 /* justify */ || this._horizontalAlign == 11 /* contentJustify */;
            let hAlign = 0;
            if (!hJustify) {
                if (this._horizontalAlign == 1 /* center */) {
                    hAlign = 0.5;
                }
                else if (this._horizontalAlign == 2 /* right */) {
                    hAlign = 1;
                }
            }
            let count = target.numElements;
            let numElements = count;
            let x = paddingL;
            let y = paddingT;
            let i;
            let layoutElement;
            let totalPreferredHeight = 0;
            let totalPercentHeight = 0;
            let childInfoArray = [];
            let childInfo;
            let heightToDistribute = targetHeight;
            let maxElementWidth = this._maxElementSize;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (i = 0; i < count; i++) {
                let layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    numElements--;
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                maxElementWidth = Math.max(maxElementWidth, bounds.width);
                if (vJustify) {
                    totalPreferredHeight += bounds.height;
                }
                else {
                    let values = layoutElement.$UIComponent;
                    if (!isNaN(values[7 /* percentHeight */])) {
                        totalPercentHeight += values[7 /* percentHeight */];
                        childInfo = new douUI.sys.ChildInfo();
                        childInfo.layoutElement = layoutElement;
                        childInfo.percent = values[7 /* percentHeight */];
                        childInfo.min = values[14 /* minHeight */];
                        childInfo.max = values[15 /* maxHeight */];
                        childInfoArray.push(childInfo);
                    }
                    else {
                        heightToDistribute -= bounds.height;
                    }
                }
            }
            heightToDistribute -= gap * (numElements - 1);
            heightToDistribute = heightToDistribute > 0 ? heightToDistribute : 0;
            let excessSpace = targetHeight - totalPreferredHeight - gap * (numElements - 1);
            let averageHeight;
            let largeChildrenCount = numElements;
            let heightDic = new Map();
            if (vJustify) {
                if (excessSpace < 0) {
                    averageHeight = heightToDistribute / numElements;
                    for (i = 0; i < count; i++) {
                        layoutElement = (target.getElementAt(i));
                        if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                            continue;
                        }
                        layoutElement.getPreferredBounds(bounds);
                        if (bounds.height <= averageHeight) {
                            heightToDistribute -= bounds.height;
                            largeChildrenCount--;
                            continue;
                        }
                    }
                    heightToDistribute = heightToDistribute > 0 ? heightToDistribute : 0;
                }
            }
            else {
                if (totalPercentHeight > 0) {
                    this.flexChildrenProportionally(targetHeight, heightToDistribute, totalPercentHeight, childInfoArray);
                    let roundOff = 0;
                    let length = childInfoArray.length;
                    for (i = 0; i < length; i++) {
                        childInfo = childInfoArray[i];
                        let childSize = Math.round(childInfo.size + roundOff);
                        roundOff += childInfo.size - childSize;
                        heightDic.set(childInfo.layoutElement, childSize);
                        heightToDistribute -= childSize;
                    }
                    heightToDistribute = heightToDistribute > 0 ? heightToDistribute : 0;
                }
            }
            if (this._verticalAlign == 1 /* middle */) {
                y = paddingT + heightToDistribute * 0.5;
            }
            else if (this._verticalAlign == 2 /* bottom */) {
                y = paddingT + heightToDistribute;
            }
            let maxX = paddingL;
            let maxY = paddingT;
            let dx = 0;
            let dy = 0;
            let justifyWidth = Math.ceil(targetWidth);
            if (this._horizontalAlign == 11 /* contentJustify */) {
                justifyWidth = Math.ceil(Math.max(targetWidth, maxElementWidth));
            }
            let roundOff = 0;
            let layoutElementHeight;
            let childHeight;
            for (i = 0; i < count; i++) {
                let exceesWidth = 0;
                layoutElement = (target.getElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                layoutElementHeight = NaN;
                if (vJustify) {
                    childHeight = NaN;
                    if (excessSpace > 0) {
                        childHeight = heightToDistribute * bounds.height / totalPreferredHeight;
                    }
                    else if (excessSpace < 0 && bounds.height > averageHeight) {
                        childHeight = heightToDistribute / largeChildrenCount;
                    }
                    if (!isNaN(childHeight)) {
                        layoutElementHeight = Math.round(childHeight + roundOff);
                        roundOff += childHeight - layoutElementHeight;
                    }
                }
                else {
                    layoutElementHeight = heightDic.get(layoutElement);
                }
                if (hJustify) {
                    x = paddingL;
                    layoutElement.setLayoutBoundsSize(justifyWidth, layoutElementHeight);
                    layoutElement.getLayoutBounds(bounds);
                }
                else {
                    let layoutElementWidth = NaN;
                    let values = layoutElement.$UIComponent;
                    if (!isNaN(values[6 /* percentWidth */])) {
                        let percent = Math.min(100, values[6 /* percentWidth */]);
                        layoutElementWidth = Math.round(targetWidth * percent * 0.01);
                    }
                    layoutElement.setLayoutBoundsSize(layoutElementWidth, layoutElementHeight);
                    layoutElement.getLayoutBounds(bounds);
                    exceesWidth = (targetWidth - bounds.width) * hAlign;
                    exceesWidth = exceesWidth > 0 ? exceesWidth : 0;
                    x = paddingL + exceesWidth;
                }
                layoutElement.setLayoutBoundsPosition(Math.round(x), Math.round(y));
                dx = Math.ceil(bounds.width);
                dy = Math.ceil(bounds.height);
                maxX = Math.max(maxX, x + dx);
                maxY = Math.max(maxY, y + dy);
                y += dy + gap;
            }
            this._maxElementSize = maxElementWidth;
            target.setContentSize(maxX + paddingR, maxY + paddingB);
        }
        updateDisplayListVirtual(width, height) {
            let target = this._target;
            if (this._indexInViewCalculated) {
                this._indexInViewCalculated = false;
            }
            else {
                this.getIndexInView();
            }
            let paddingB = this._paddingBottom;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let gap = this._gap;
            let contentHeight;
            let numElements = target.numElements;
            if (this._startIndex == -1 || this._endIndex == -1) {
                contentHeight = this.getStartPosition(numElements) - gap + paddingB;
                target.setContentSize(target.contentWidth, contentHeight);
                return;
            }
            let endIndex = this._endIndex;
            target.setVirtualElementIndicesInView(this._startIndex, endIndex);
            // 获取垂直布局参数
            let justify = this._horizontalAlign == 10 /* justify */ || this._horizontalAlign == 11 /* contentJustify */;
            let contentJustify = this._horizontalAlign == 11 /* contentJustify */;
            let hAlign = 0;
            if (!justify) {
                if (this._horizontalAlign == 1 /* center */) {
                    hAlign = 0.5;
                }
                else if (this._horizontalAlign == 2 /* right */) {
                    hAlign = 1;
                }
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let justifyWidth = Math.ceil(targetWidth);
            let layoutElement;
            let typicalHeight = this._typicalHeight;
            let typicalWidth = this._typicalWidth;
            let maxElementWidth = this._maxElementSize;
            let oldMaxW = Math.max(typicalWidth, this._maxElementSize);
            if (contentJustify) {
                for (let index = this._startIndex; index <= endIndex; index++) {
                    layoutElement = (target.getVirtualElementAt(index));
                    if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                        continue;
                    }
                    layoutElement.getPreferredBounds(bounds);
                    maxElementWidth = Math.max(maxElementWidth, bounds.width);
                }
                justifyWidth = Math.ceil(Math.max(targetWidth, maxElementWidth));
            }
            let x = 0;
            let y = 0;
            let contentWidth = 0;
            let oldElementSize;
            let needInvalidateSize = false;
            let elementSizeTable = this._elementSizeTable;
            // 对可见区域进行布局
            for (let i = this._startIndex; i <= endIndex; i++) {
                let exceesWidth = 0;
                layoutElement = (target.getVirtualElementAt(i));
                if (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                    continue;
                }
                layoutElement.getPreferredBounds(bounds);
                if (!contentJustify) {
                    maxElementWidth = Math.max(maxElementWidth, bounds.width);
                }
                if (justify) {
                    x = paddingL;
                    layoutElement.setLayoutBoundsSize(justifyWidth, NaN);
                    layoutElement.getLayoutBounds(bounds);
                }
                else {
                    layoutElement.getLayoutBounds(bounds);
                    exceesWidth = (targetWidth - bounds.width) * hAlign;
                    exceesWidth = exceesWidth > 0 ? exceesWidth : 0;
                    x = paddingL + exceesWidth;
                }
                contentWidth = Math.max(contentWidth, bounds.width);
                if (!needInvalidateSize) {
                    oldElementSize = isNaN(elementSizeTable[i]) ? typicalHeight : elementSizeTable[i];
                    if (oldElementSize != bounds.height) {
                        needInvalidateSize = true;
                    }
                }
                elementSizeTable[i] = bounds.height;
                y = this.getStartPosition(i);
                layoutElement.setLayoutBoundsPosition(Math.round(x), Math.round(y));
            }
            bounds.recycle();
            contentWidth += paddingL + paddingR;
            contentHeight = this.getStartPosition(numElements) - gap + paddingB;
            this._maxElementSize = maxElementWidth;
            target.setContentSize(contentWidth, contentHeight);
            if (needInvalidateSize || oldMaxW < this._maxElementSize) {
                target.invalidateSize();
            }
        }
        getStartPosition(index) {
            if (!this._useVirtualLayout) {
                if (this._target) {
                    let element = this._target.getElementAt(index);
                    if (element) {
                        return element.y;
                    }
                }
            }
            let typicalHeight = this._typicalHeight;
            let startPos = this._paddingTop;
            let gap = this._gap;
            let elementSizeTable = this._elementSizeTable;
            for (let i = 0; i < index; i++) {
                let h = elementSizeTable[i];
                if (isNaN(h)) {
                    h = typicalHeight;
                }
                startPos += h + gap;
            }
            return startPos;
        }
        getElementSize(index) {
            if (this._useVirtualLayout) {
                let size = this._elementSizeTable[index];
                if (isNaN(size)) {
                    size = this._typicalHeight;
                }
                return size;
            }
            if (this._target) {
                return this._target.getElementAt(index).height;
            }
            return 0;
        }
        getElementTotalSize() {
            let typicalHeight = this._typicalHeight;
            let gap = this._gap;
            let totalSize = 0;
            let length = this._target.numElements;
            let elementSizeTable = this._elementSizeTable;
            for (let i = 0; i < length; i++) {
                let h = elementSizeTable[i];
                if (isNaN(h)) {
                    h = typicalHeight;
                }
                totalSize += h + gap;
            }
            totalSize -= gap;
            return totalSize;
        }
        elementAdded(index) {
            if (!this._useVirtualLayout) {
                return;
            }
            super.elementAdded(index);
            this._elementSizeTable.splice(index, 0, this._typicalHeight);
        }
        getIndexInView() {
            let target = this._target;
            if (!target || target.numElements == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let values = target.$UIComponent;
            if (values[10 /* width */] == 0 || values[11 /* height */] == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let numElements = target.numElements;
            let contentHeight = this.getStartPosition(numElements - 1) + this._elementSizeTable[numElements - 1] + this._paddingBottom;
            let minVisibleY = target.scrollV;
            if (minVisibleY > contentHeight - this._paddingBottom) {
                this._startIndex = -1;
                this._endIndex = -1;
                return false;
            }
            let maxVisibleY = target.scrollV + values[11 /* height */];
            if (maxVisibleY < this._paddingTop) {
                this._startIndex = -1;
                this._endIndex = -1;
                return false;
            }
            let oldStartIndex = this._startIndex;
            let oldEndIndex = this._endIndex;
            this._startIndex = this.findIndexAt(minVisibleY, 0, numElements - 1);
            if (this._startIndex == -1) {
                this._startIndex = 0;
            }
            this._endIndex = this.findIndexAt(maxVisibleY, 0, numElements - 1);
            if (this._endIndex == -1) {
                this._endIndex = numElements - 1;
            }
            return oldStartIndex != this._startIndex || oldEndIndex != this._endIndex;
        }
    }
    douUI.VerticalLayout = VerticalLayout;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 单元格布局类
     * @author wizardc
     */
    class TileLayout extends douUI.LayoutBase {
        constructor() {
            super(...arguments);
            this._explicitHorizontalGap = NaN;
            this._horizontalGap = 6;
            this._explicitVerticalGap = NaN;
            this._verticalGap = 6;
            this._columnCount = -1;
            this._requestedColumnCount = 0;
            this._rowCount = -1;
            this._requestedRowCount = 0;
            this._explicitColumnWidth = NaN;
            this._columnWidth = NaN;
            this._explicitRowHeight = NaN;
            this._rowHeight = NaN;
            this._paddingLeft = 0;
            this._paddingRight = 0;
            this._paddingTop = 0;
            this._paddingBottom = 0;
            this._horizontalAlign = 10 /* justify */;
            this._verticalAlign = 10 /* justify */;
            this._columnAlign = 0 /* left */;
            this._rowAlign = 0 /* top */;
            this._orientation = 0 /* rows */;
            /**
             * 当前视图中的第一个元素索引
             */
            this._startIndex = -1;
            /**
             * 当前视图中的最后一个元素的索引
             */
            this._endIndex = -1;
            /**
             * 视图的第一个和最后一个元素的索引值已经计算好的标志
             */
            this._indexInViewCalculated = false;
            /**
             * 缓存的最大子对象宽度
             */
            this._maxElementWidth = 0;
            /**
             * 缓存的最大子对象高度
             */
            this._maxElementHeight = 0;
        }
        /**
         * 列之间的水平空间
         */
        set horizontalGap(value) {
            value = +value;
            if (value === this._horizontalGap) {
                return;
            }
            this._explicitHorizontalGap = value;
            this._horizontalGap = value;
            this.invalidateTargetLayout();
        }
        get horizontalGap() {
            return this._horizontalGap;
        }
        /**
         * 行之间的垂直空间
         */
        set verticalGap(value) {
            value = +value;
            if (value === this._verticalGap) {
                return;
            }
            this._explicitVerticalGap = value;
            this._verticalGap = value;
            this.invalidateTargetLayout();
        }
        get verticalGap() {
            return this._verticalGap;
        }
        /**
         *  列计数
         */
        get columnCount() {
            return this._columnCount;
        }
        /**
         * 要显示的列数
         * * 设置为 0 会允许 TileLayout 自动确定列计数
         */
        set requestedColumnCount(value) {
            value = +value || 0;
            if (this._requestedColumnCount === value) {
                return;
            }
            this._requestedColumnCount = value;
            this._columnCount = value;
            this.invalidateTargetLayout();
        }
        get requestedColumnCount() {
            return this._requestedColumnCount;
        }
        /**
         *  行计数
         */
        get rowCount() {
            return this._rowCount;
        }
        /**
         * 要显示的行数
         * * 设置为 -1 会删除显式覆盖并允许 TileLayout 自动确定行计数
         */
        set requestedRowCount(value) {
            value = +value || 0;
            if (this._requestedRowCount == value) {
                return;
            }
            this._requestedRowCount = value;
            this._rowCount = value;
            this.invalidateTargetLayout();
        }
        get requestedRowCount() {
            return this._requestedRowCount;
        }
        /**
         * 列宽
         */
        set columnWidth(value) {
            value = +value;
            if (value === this._columnWidth) {
                return;
            }
            this._explicitColumnWidth = value;
            this._columnWidth = value;
            this.invalidateTargetLayout();
        }
        get columnWidth() {
            return this._columnWidth;
        }
        /**
         * 行高
         */
        set rowHeight(value) {
            value = +value;
            if (value === this._rowHeight) {
                return;
            }
            this._explicitRowHeight = value;
            this._rowHeight = value;
            this.invalidateTargetLayout();
        }
        get rowHeight() {
            return this._rowHeight;
        }
        set paddingTop(value) {
            value = +value || 0;
            if (this._paddingTop == value) {
                return;
            }
            this._paddingTop = value;
            this.invalidateTargetLayout();
        }
        get paddingTop() {
            return this._paddingTop;
        }
        set paddingBottom(value) {
            value = +value || 0;
            if (this._paddingBottom === value) {
                return;
            }
            this._paddingBottom = value;
            this.invalidateTargetLayout();
        }
        get paddingBottom() {
            return this._paddingBottom;
        }
        set paddingLeft(value) {
            value = +value || 0;
            if (this._paddingLeft == value) {
                return;
            }
            this._paddingLeft = value;
            this.invalidateTargetLayout();
        }
        get paddingLeft() {
            return this._paddingLeft;
        }
        set paddingRight(value) {
            value = +value || 0;
            if (this._paddingRight === value) {
                return;
            }
            this._paddingRight = value;
            this.invalidateTargetLayout();
        }
        get paddingRight() {
            return this._paddingRight;
        }
        /**
         * 指定如何在水平方向上对齐单元格内的元素
         */
        set horizontalAlign(value) {
            if (this._horizontalAlign == value) {
                return;
            }
            this._horizontalAlign = value;
            this.invalidateTargetLayout();
        }
        get horizontalAlign() {
            return this._horizontalAlign;
        }
        /**
         * 指定如何在垂直方向上对齐单元格内的元素
         */
        set verticalAlign(value) {
            if (this._verticalAlign == value) {
                return;
            }
            this._verticalAlign = value;
            this.invalidateTargetLayout();
        }
        get verticalAlign() {
            return this._verticalAlign;
        }
        /**
         * 指定如何将完全可见列与容器宽度对齐
         */
        set columnAlign(value) {
            if (this._columnAlign == value) {
                return;
            }
            this._columnAlign = value;
            this.invalidateTargetLayout();
        }
        get columnAlign() {
            return this._columnAlign;
        }
        /**
         * 指定如何将完全可见行与容器高度对齐
         */
        set rowAlign(value) {
            if (this._rowAlign == value) {
                return;
            }
            this._rowAlign = value;
            this.invalidateTargetLayout();
        }
        get rowAlign() {
            return this._rowAlign;
        }
        /**
         * 指定是逐行还是逐列排列元素
         */
        set orientation(value) {
            if (this._orientation == value) {
                return;
            }
            this._orientation = value;
            this.invalidateTargetLayout();
        }
        get orientation() {
            return this._orientation;
        }
        /**
         * 标记目标容器的尺寸和显示列表失效
         */
        invalidateTargetLayout() {
            let target = this._target;
            if (target) {
                target.invalidateSize();
                target.invalidateDisplayList();
            }
        }
        measure() {
            let target = this._target;
            if (!target) {
                return;
            }
            let savedColumnCount = this._columnCount;
            let savedRowCount = this._rowCount;
            let savedColumnWidth = this._columnWidth;
            let savedRowHeight = this._rowHeight;
            let measuredWidth = 0;
            let measuredHeight = 0;
            let values = target.$UIComponent;
            this.calculateRowAndColumn(values[8 /* explicitWidth */], values[9 /* explicitHeight */]);
            let columnCount = this._requestedColumnCount > 0 ? this._requestedColumnCount : this._columnCount;
            let rowCount = this._requestedRowCount > 0 ? this._requestedRowCount : this._rowCount;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            if (columnCount > 0) {
                measuredWidth = columnCount * (this._columnWidth + horizontalGap) - horizontalGap;
            }
            if (rowCount > 0) {
                measuredHeight = rowCount * (this._rowHeight + verticalGap) - verticalGap;
            }
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
            this._columnCount = savedColumnCount;
            this._rowCount = savedRowCount;
            this._columnWidth = savedColumnWidth;
            this._rowHeight = savedRowHeight;
        }
        /**
         * 计算行和列的尺寸及数量
         */
        calculateRowAndColumn(explicitWidth, explicitHeight) {
            let target = this._target;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            this._rowCount = this._columnCount = -1;
            let numElements = target.numElements;
            let count = numElements;
            for (let index = 0; index < count; index++) {
                let layoutElement = (target.getElementAt(index));
                if (layoutElement && (!douUI.sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout)) {
                    numElements--;
                    continue;
                }
            }
            if (numElements == 0) {
                this._rowCount = this._columnCount = 0;
                return;
            }
            if (isNaN(this._explicitColumnWidth) || isNaN(this._explicitRowHeight)) {
                this.updateMaxElementSize();
            }
            if (isNaN(this._explicitColumnWidth)) {
                this._columnWidth = this._maxElementWidth;
            }
            else {
                this._columnWidth = this._explicitColumnWidth;
            }
            if (isNaN(this._explicitRowHeight)) {
                this._rowHeight = this._maxElementHeight;
            }
            else {
                this._rowHeight = this._explicitRowHeight;
            }
            let itemWidth = this._columnWidth + horizontalGap;
            // 防止出现除数为零的情况
            if (itemWidth <= 0) {
                itemWidth = 1;
            }
            let itemHeight = this._rowHeight + verticalGap;
            if (itemHeight <= 0) {
                itemHeight = 1;
            }
            let orientedByColumns = (this._orientation == 1 /* columns */);
            let widthHasSet = !isNaN(explicitWidth);
            let heightHasSet = !isNaN(explicitHeight);
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            if (this._requestedColumnCount > 0 || this._requestedRowCount > 0) {
                if (this._requestedRowCount > 0) {
                    this._rowCount = Math.min(this._requestedRowCount, numElements);
                }
                if (this._requestedColumnCount > 0) {
                    this._columnCount = Math.min(this._requestedColumnCount, numElements);
                }
            }
            else if (!widthHasSet && !heightHasSet) {
                let side = Math.sqrt(numElements * itemWidth * itemHeight);
                if (orientedByColumns) {
                    this._rowCount = Math.max(1, Math.round(side / itemHeight));
                }
                else {
                    this._columnCount = Math.max(1, Math.round(side / itemWidth));
                }
            }
            else if (widthHasSet && (!heightHasSet || !orientedByColumns)) {
                let targetWidth = Math.max(0, explicitWidth - paddingL - paddingR);
                this._columnCount = Math.floor((targetWidth + horizontalGap) / itemWidth);
                this._columnCount = Math.max(1, Math.min(this._columnCount, numElements));
            }
            else {
                let targetHeight = Math.max(0, explicitHeight - paddingT - paddingB);
                this._rowCount = Math.floor((targetHeight + verticalGap) / itemHeight);
                this._rowCount = Math.max(1, Math.min(this._rowCount, numElements));
            }
            if (this._rowCount == -1) {
                this._rowCount = Math.max(1, Math.ceil(numElements / this._columnCount));
            }
            if (this._columnCount == -1) {
                this._columnCount = Math.max(1, Math.ceil(numElements / this._rowCount));
            }
            if (this._requestedColumnCount > 0 && this._requestedRowCount > 0) {
                if (this._orientation == 0 /* rows */) {
                    this._rowCount = Math.max(1, Math.ceil(numElements / this._requestedColumnCount));
                }
                else {
                    this._columnCount = Math.max(1, Math.ceil(numElements / this._requestedRowCount));
                }
            }
        }
        /**
         * 更新最大子对象尺寸
         */
        updateMaxElementSize() {
            if (!this._target) {
                return;
            }
            if (this._useVirtualLayout) {
                this._maxElementWidth = Math.max(this._maxElementWidth, this._typicalWidth);
                this._maxElementHeight = Math.max(this._maxElementHeight, this._typicalHeight);
                this.doUpdateMaxElementSize(this._startIndex, this._endIndex);
            }
            else {
                this.doUpdateMaxElementSize(0, this._target.numElements - 1);
            }
        }
        /**
         * 更新虚拟布局的最大子对象尺寸
         */
        doUpdateMaxElementSize(startIndex, endIndex) {
            let maxElementWidth = this._maxElementWidth;
            let maxElementHeight = this._maxElementHeight;
            let bounds = dou.recyclable(dou2d.Rectangle);
            let target = this._target;
            if ((startIndex != -1) && (endIndex != -1)) {
                for (let index = startIndex; index <= endIndex; index++) {
                    let elt = target.getVirtualElementAt(index);
                    if (!douUI.sys.isIUIComponent(elt) || !elt.includeInLayout) {
                        continue;
                    }
                    elt.getPreferredBounds(bounds);
                    maxElementWidth = Math.max(maxElementWidth, bounds.width);
                    maxElementHeight = Math.max(maxElementHeight, bounds.height);
                }
            }
            this._maxElementWidth = maxElementWidth;
            this._maxElementHeight = maxElementHeight;
            bounds.recycle();
        }
        clearVirtualLayoutCache() {
            super.clearVirtualLayoutCache();
            this._maxElementWidth = 0;
            this._maxElementHeight = 0;
        }
        scrollPositionChanged() {
            if (this._useVirtualLayout) {
                let changed = this.getIndexInView();
                if (changed) {
                    this._indexInViewCalculated = true;
                    this._target.invalidateDisplayList();
                }
            }
        }
        /**
         * 获取视图中第一个和最后一个元素的索引, 返回是否发生改变
         */
        getIndexInView() {
            if (!this._target || this._target.numElements == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let target = this._target;
            let numElements = target.numElements;
            if (!this._useVirtualLayout) {
                this._startIndex = 0;
                this._endIndex = numElements - 1;
                return false;
            }
            let values = target.$UIComponent;
            if (values[10 /* width */] == 0 || values[11 /* height */] == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let oldStartIndex = this._startIndex;
            let oldEndIndex = this._endIndex;
            let paddingL = this._paddingLeft;
            let paddingT = this._paddingTop;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            if (this._orientation == 1 /* columns */) {
                let itemWidth = this._columnWidth + horizontalGap;
                if (itemWidth <= 0) {
                    this._startIndex = 0;
                    this._endIndex = numElements - 1;
                    return false;
                }
                let minVisibleX = target.scrollH;
                let maxVisibleX = minVisibleX + values[10 /* width */];
                let startColumn = Math.floor((minVisibleX - paddingL) / itemWidth);
                if (startColumn < 0) {
                    startColumn = 0;
                }
                let endColumn = Math.ceil((maxVisibleX - paddingL) / itemWidth);
                if (endColumn < 0) {
                    endColumn = 0;
                }
                this._startIndex = Math.min(numElements - 1, Math.max(0, startColumn * this._rowCount));
                this._endIndex = Math.min(numElements - 1, Math.max(0, endColumn * this._rowCount - 1));
            }
            else {
                let itemHeight = this._rowHeight + verticalGap;
                if (itemHeight <= 0) {
                    this._startIndex = 0;
                    this._endIndex = numElements - 1;
                    return false;
                }
                let minVisibleY = target.scrollV;
                let maxVisibleY = minVisibleY + values[11 /* height */];
                let startRow = Math.floor((minVisibleY - paddingT) / itemHeight);
                if (startRow < 0) {
                    startRow = 0;
                }
                let endRow = Math.ceil((maxVisibleY - paddingT) / itemHeight);
                if (endRow < 0) {
                    endRow = 0;
                }
                this._startIndex = Math.min(numElements - 1, Math.max(0, startRow * this._columnCount));
                this._endIndex = Math.min(numElements - 1, Math.max(0, endRow * this._columnCount - 1));
            }
            return this._startIndex != oldStartIndex || this._endIndex != oldEndIndex;
        }
        updateDisplayList(width, height) {
            super.updateDisplayList(width, height);
            if (!this._target) {
                return;
            }
            let target = this._target;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            if (this._indexInViewCalculated) {
                this._indexInViewCalculated = false;
            }
            else {
                this.calculateRowAndColumn(width, height);
                if (this._rowCount == 0 || this._columnCount == 0) {
                    target.setContentSize(paddingL + paddingR, paddingT + paddingB);
                    return;
                }
                this.adjustForJustify(width, height);
                this.getIndexInView();
            }
            if (this._useVirtualLayout) {
                this.calculateRowAndColumn(width, height);
                this.adjustForJustify(width, height);
            }
            if (this._startIndex == -1 || this._endIndex == -1) {
                target.setContentSize(0, 0);
                return;
            }
            let endIndex = this._endIndex;
            target.setVirtualElementIndicesInView(this._startIndex, endIndex);
            let elt;
            let x;
            let y;
            let columnIndex;
            let rowIndex;
            let orientedByColumns = (this._orientation == 1 /* columns */);
            let index = this._startIndex;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            let rowCount = this._rowCount;
            let columnCount = this._columnCount;
            let columnWidth = this._columnWidth;
            let rowHeight = this._rowHeight;
            for (let i = this._startIndex; i <= endIndex; i++) {
                if (this._useVirtualLayout) {
                    elt = (this.target.getVirtualElementAt(i));
                }
                else {
                    elt = (this.target.getElementAt(i));
                }
                if (!douUI.sys.isIUIComponent(elt) || !elt.includeInLayout) {
                    continue;
                }
                if (orientedByColumns) {
                    columnIndex = Math.ceil((index + 1) / rowCount) - 1;
                    rowIndex = Math.ceil((index + 1) % rowCount) - 1;
                    if (rowIndex == -1) {
                        rowIndex = rowCount - 1;
                    }
                }
                else {
                    columnIndex = Math.ceil((index + 1) % columnCount) - 1;
                    if (columnIndex == -1) {
                        columnIndex = columnCount - 1;
                    }
                    rowIndex = Math.ceil((index + 1) / columnCount) - 1;
                }
                switch (this._horizontalAlign) {
                    case 2 /* right */:
                        x = width - (columnIndex + 1) * (columnWidth + horizontalGap) + horizontalGap - paddingR;
                        break;
                    case 0 /* left */:
                        x = columnIndex * (columnWidth + horizontalGap) + paddingL;
                        break;
                    default:
                        x = columnIndex * (columnWidth + horizontalGap) + paddingL;
                }
                switch (this._verticalAlign) {
                    case 0 /* top */:
                        y = rowIndex * (rowHeight + verticalGap) + paddingT;
                        break;
                    case 2 /* bottom */:
                        y = height - (rowIndex + 1) * (rowHeight + verticalGap) + verticalGap - paddingB;
                        break;
                    default:
                        y = rowIndex * (rowHeight + verticalGap) + paddingT;
                }
                this.sizeAndPositionElement(elt, x, y, columnWidth, rowHeight);
                index++;
            }
            let hPadding = paddingL + paddingR;
            let vPadding = paddingT + paddingB;
            let contentWidth = (columnWidth + horizontalGap) * columnCount - horizontalGap;
            let contentHeight = (rowHeight + verticalGap) * rowCount - verticalGap;
            target.setContentSize(contentWidth + hPadding, contentHeight + vPadding);
        }
        /**
         * 为单个元素布局
         */
        sizeAndPositionElement(element, cellX, cellY, cellWidth, cellHeight) {
            let elementWidth = NaN;
            let elementHeight = NaN;
            let values = element.$UIComponent;
            if (this._horizontalAlign == 10 /* justify */) {
                elementWidth = cellWidth;
            }
            else if (!isNaN(values[6 /* percentWidth */])) {
                elementWidth = cellWidth * values[6 /* percentWidth */] * 0.01;
            }
            if (this._verticalAlign == 10 /* justify */) {
                elementHeight = cellHeight;
            }
            else if (!isNaN(values[7 /* percentHeight */])) {
                elementHeight = cellHeight * values[7 /* percentHeight */] * 0.01;
            }
            element.setLayoutBoundsSize(Math.round(elementWidth), Math.round(elementHeight));
            let x = cellX;
            let bounds = dou.recyclable(dou2d.Rectangle);
            element.getLayoutBounds(bounds);
            switch (this._horizontalAlign) {
                case 2 /* right */:
                    x += cellWidth - bounds.width;
                    break;
                case 1 /* center */:
                    x = cellX + (cellWidth - bounds.width) / 2;
                    break;
            }
            let y = cellY;
            switch (this._verticalAlign) {
                case 2 /* bottom */:
                    y += cellHeight - bounds.height;
                    break;
                case 1 /* middle */:
                    y += (cellHeight - bounds.height) / 2;
                    break;
            }
            element.setLayoutBoundsPosition(Math.round(x), Math.round(y));
            bounds.recycle();
        }
        /**
         * 为两端对齐调整间隔或格子尺寸
         */
        adjustForJustify(width, height) {
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            if (!isNaN(this._explicitVerticalGap)) {
                this._verticalGap = this._explicitVerticalGap;
            }
            if (!isNaN(this._explicitHorizontalGap)) {
                this._horizontalGap = this._explicitHorizontalGap;
            }
            this._verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            this._horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let offsetY = targetHeight - this._rowHeight * this._rowCount;
            let offsetX = targetWidth - this._columnWidth * this._columnCount;
            let gapCount;
            if (offsetY > 0) {
                if (this._rowAlign == 1 /* justifyUsingGap */) {
                    gapCount = Math.max(1, this._rowCount - 1);
                    this._verticalGap = offsetY / gapCount;
                }
                else if (this._rowAlign == 2 /* justifyUsingHeight */) {
                    if (this._rowCount > 0) {
                        this._rowHeight += (offsetY - (this._rowCount - 1) * this._verticalGap) / this._rowCount;
                    }
                }
            }
            if (offsetX > 0) {
                if (this._columnAlign == 1 /* justifyUsingGap */) {
                    gapCount = Math.max(1, this._columnCount - 1);
                    this._horizontalGap = offsetX / gapCount;
                }
                else if (this._columnAlign == 2 /* justifyUsingWidth */) {
                    if (this._columnCount > 0) {
                        this._columnWidth += (offsetX - (this._columnCount - 1) * this._horizontalGap) / this._columnCount;
                    }
                }
            }
        }
    }
    douUI.TileLayout = TileLayout;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 皮肤基类
     * @author wizardc
     */
    class SkinBase {
        constructor(target, size) {
            this._skinCreated = false;
            this._target = target;
            if (size) {
                this._width = size.width;
                this._minWidth = size.minWidth;
                this._maxWidth = size.maxWidth;
                this._height = size.height;
                this._minHeight = size.minHeight;
                this._maxHeight = size.maxHeight;
            }
        }
        get width() {
            return this._width;
        }
        get minWidth() {
            return this._minWidth;
        }
        get maxWidth() {
            return this._maxWidth;
        }
        get height() {
            return this._height;
        }
        get minHeight() {
            return this._minHeight;
        }
        get maxHeight() {
            return this._maxHeight;
        }
        /**
         * 将特定的实例绑定到目标对象的指定属性上
         */
        bindToTarget(attributeName, instance) {
            this._target[attributeName] = instance;
        }
        onCreateSkin() {
            if (!this._skinCreated) {
                this._skinCreated = true;
                this.createSkin();
            }
        }
        onApply() {
            if (this._skinCreated) {
                this.apply();
            }
        }
        onUnload() {
            if (this._skinCreated) {
                this.unload();
            }
        }
        setState(state) {
        }
    }
    douUI.SkinBase = SkinBase;
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 主题管理器
     * @author wizardc
     */
    let Theme;
    (function (Theme) {
        let _defaultSkinMap = new Map();
        let _skinMap = {};
        /**
         * 注册组件默认皮肤
         */
        function registerDefaultSkin(component, skinClass) {
            if (_defaultSkinMap.has(component)) {
                throw new Error(`默认皮肤已经注册: ${component}`);
            }
            _defaultSkinMap.set(component, skinClass);
        }
        Theme.registerDefaultSkin = registerDefaultSkin;
        /**
         * 获取指定组件的默认皮肤类
         */
        function getDefaultSkin(component) {
            return _defaultSkinMap.get(component);
        }
        Theme.getDefaultSkin = getDefaultSkin;
        /**
         * 注册皮肤别名
         */
        function registerSkin(skinName, skinClass) {
            if (_skinMap.hasOwnProperty(skinName)) {
                throw new Error(`皮肤别名已被注册: ${skinName}`);
            }
            _skinMap[skinName] = skinClass;
        }
        Theme.registerSkin = registerSkin;
        /**
         * 获取指定组件的皮肤类
         */
        function getSkin(skinName) {
            return _skinMap[skinName];
        }
        Theme.getSkin = getSkin;
    })(Theme = douUI.Theme || (douUI.Theme = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    var sys;
    (function (sys) {
        /**
         * 矩阵工具类
         * @author wizardc
         */
        let MatrixUtil;
        (function (MatrixUtil) {
            const SOLUTION_TOLERANCE = 0.1;
            const MIN_MAX_TOLERANCE = 0.1;
            const tempRectangle = new dou2d.Rectangle();
            function isDeltaIdentity(m) {
                return m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1;
            }
            MatrixUtil.isDeltaIdentity = isDeltaIdentity;
            function fitBounds(width, height, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, minWidth, minHeight, maxWidth, maxHeight) {
                if (isNaN(width) && isNaN(height)) {
                    let point = dou.recyclable(dou2d.Point);
                    point.set(preferredWidth, preferredHeight);
                    return point;
                }
                let newMinWidth = (minWidth < MIN_MAX_TOLERANCE) ? 0 : minWidth - MIN_MAX_TOLERANCE;
                let newMinHeight = (minHeight < MIN_MAX_TOLERANCE) ? 0 : minHeight - MIN_MAX_TOLERANCE;
                let newMaxWidth = maxWidth + MIN_MAX_TOLERANCE;
                let newMaxHeight = maxHeight + MIN_MAX_TOLERANCE;
                let actualSize;
                if (!isNaN(width) && !isNaN(height)) {
                    actualSize = calcUBoundsToFitTBounds(width, height, matrix, newMinWidth, newMinHeight, newMaxWidth, newMaxHeight);
                    if (!actualSize) {
                        let actualSize1;
                        actualSize1 = fitTBoundsWidth(width, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, newMinWidth, newMinHeight, newMaxWidth, newMaxHeight);
                        if (actualSize1) {
                            let fitHeight = transformSize(actualSize1.x, actualSize1.y, matrix).height;
                            if (fitHeight - SOLUTION_TOLERANCE > height) {
                                actualSize1.recycle();
                                actualSize1 = null;
                            }
                        }
                        let actualSize2;
                        actualSize2 = fitTBoundsHeight(height, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, newMinWidth, newMinHeight, newMaxWidth, newMaxHeight);
                        if (actualSize2) {
                            let fitWidth = transformSize(actualSize2.x, actualSize2.y, matrix).width;
                            if (fitWidth - SOLUTION_TOLERANCE > width) {
                                actualSize2.recycle();
                                actualSize2 = null;
                            }
                        }
                        if (actualSize1 && actualSize2) {
                            actualSize = ((actualSize1.x * actualSize1.y) > (actualSize2.x * actualSize2.y)) ? actualSize1 : actualSize2;
                        }
                        else if (actualSize1) {
                            actualSize = actualSize1;
                        }
                        else {
                            actualSize = actualSize2;
                        }
                        actualSize1.recycle();
                        actualSize2.recycle();
                    }
                    return actualSize;
                }
                else if (!isNaN(width)) {
                    return fitTBoundsWidth(width, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, newMinWidth, newMinHeight, newMaxWidth, newMaxHeight);
                }
                return fitTBoundsHeight(height, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, newMinWidth, newMinHeight, newMaxWidth, newMaxHeight);
            }
            MatrixUtil.fitBounds = fitBounds;
            function fitTBoundsWidth(width, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, minWidth, minHeight, maxWidth, maxHeight) {
                let actualSize;
                if (!isNaN(explicitWidth) && isNaN(explicitHeight)) {
                    actualSize = calcUBoundsToFitTBoundsWidth(width, matrix, explicitWidth, preferredHeight, explicitWidth, minHeight, explicitWidth, maxHeight);
                    if (actualSize) {
                        return actualSize;
                    }
                }
                else if (isNaN(explicitWidth) && !isNaN(explicitHeight)) {
                    actualSize = calcUBoundsToFitTBoundsWidth(width, matrix, preferredWidth, explicitHeight, minWidth, explicitHeight, maxWidth, explicitHeight);
                    if (actualSize) {
                        return actualSize;
                    }
                }
                actualSize = calcUBoundsToFitTBoundsWidth(width, matrix, preferredWidth, preferredHeight, minWidth, minHeight, maxWidth, maxHeight);
                return actualSize;
            }
            function fitTBoundsHeight(height, matrix, explicitWidth, explicitHeight, preferredWidth, preferredHeight, minWidth, minHeight, maxWidth, maxHeight) {
                let actualSize;
                if (!isNaN(explicitWidth) && isNaN(explicitHeight)) {
                    actualSize = calcUBoundsToFitTBoundsHeight(height, matrix, explicitWidth, preferredHeight, explicitWidth, minHeight, explicitWidth, maxHeight);
                    if (actualSize) {
                        return actualSize;
                    }
                }
                else if (isNaN(explicitWidth) && !isNaN(explicitHeight)) {
                    actualSize = calcUBoundsToFitTBoundsHeight(height, matrix, preferredWidth, explicitHeight, minWidth, explicitHeight, maxWidth, explicitHeight);
                    if (actualSize) {
                        return actualSize;
                    }
                }
                actualSize = calcUBoundsToFitTBoundsHeight(height, matrix, preferredWidth, preferredHeight, minWidth, minHeight, maxWidth, maxHeight);
                return actualSize;
            }
            function calcUBoundsToFitTBoundsHeight(h, matrix, preferredX, preferredY, minX, minY, maxX, maxY) {
                let b = matrix.b;
                let d = matrix.d;
                if (-1.0e-9 < b && b < +1.0e-9) {
                    b = 0;
                }
                if (-1.0e-9 < d && d < +1.0e-9) {
                    d = 0;
                }
                if (b == 0 && d == 0) {
                    return null;
                }
                if (b == 0 && d == 0) {
                    return null;
                }
                if (b == 0) {
                    let point = dou.recyclable(dou2d.Point);
                    point.set(preferredX, h / Math.abs(d));
                    return point;
                }
                else if (d == 0) {
                    let point = dou.recyclable(dou2d.Point);
                    point.set(h / Math.abs(b), preferredY);
                    return point;
                }
                let d1 = (b * d >= 0) ? d : -d;
                let s;
                let x;
                let y;
                if (d1 != 0 && preferredX > 0) {
                    let invD1 = 1 / d1;
                    preferredX = Math.max(minX, Math.min(maxX, preferredX));
                    x = preferredX;
                    y = (h - b * x) * invD1;
                    if (minY <= y && y <= maxY && b * x + d1 * y >= 0) {
                        s = dou.recyclable(dou2d.Point);
                        s.set(x, y);
                    }
                    y = (-h - b * x) * invD1;
                    if (minY <= y && y <= maxY && b * x + d1 * y < 0) {
                        if (!s || transformSize(s.x, s.y, matrix).width > transformSize(x, y, matrix).width) {
                            s.recycle();
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                }
                if (b != 0 && preferredY > 0) {
                    let invB = 1 / b;
                    preferredY = Math.max(minY, Math.min(maxY, preferredY));
                    y = preferredY;
                    x = (h - d1 * y) * invB;
                    if (minX <= x && x <= maxX && b * x + d1 * y >= 0) {
                        if (!s || transformSize(s.x, s.y, matrix).width > transformSize(x, y, matrix).width) {
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                    x = (-h - d1 * y) * invB;
                    if (minX <= x && x <= maxX && b * x + d1 * y < 0) {
                        if (!s || transformSize(s.x, s.y, matrix).width > transformSize(x, y, matrix).width) {
                            s.recycle();
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                }
                if (s) {
                    return s;
                }
                let a = matrix.a;
                let c = matrix.c;
                let c1 = (a * c >= 0) ? c : -c;
                return solveEquation(b, d1, h, minX, minY, maxX, maxY, a, c1);
            }
            function calcUBoundsToFitTBoundsWidth(w, matrix, preferredX, preferredY, minX, minY, maxX, maxY) {
                let a = matrix.a;
                let c = matrix.c;
                if (-1.0e-9 < a && a < +1.0e-9) {
                    a = 0;
                }
                if (-1.0e-9 < c && c < +1.0e-9) {
                    c = 0;
                }
                if (a == 0 && c == 0) {
                    return null;
                }
                if (a == 0) {
                    let point = dou.recyclable(dou2d.Point);
                    point.set(preferredX, w / Math.abs(c));
                    return point;
                }
                else if (c == 0) {
                    let point = dou.recyclable(dou2d.Point);
                    point.set(w / Math.abs(a), preferredY);
                    return point;
                }
                let c1 = (a * c >= 0) ? c : -c;
                let s;
                let x;
                let y;
                if (c1 != 0 && preferredX > 0) {
                    let invC1 = 1 / c1;
                    preferredX = Math.max(minX, Math.min(maxX, preferredX));
                    x = preferredX;
                    y = (w - a * x) * invC1;
                    if (minY <= y && y <= maxY && a * x + c1 * y >= 0) {
                        let s = dou.recyclable(dou2d.Point);
                        s.set(x, y);
                    }
                    y = (-w - a * x) * invC1;
                    if (minY <= y && y <= maxY && a * x + c1 * y < 0) {
                        if (!s || transformSize(s.x, s.y, matrix).height > transformSize(x, y, matrix).height) {
                            s.recycle();
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                }
                if (a != 0 && preferredY > 0) {
                    let invA = 1 / a;
                    preferredY = Math.max(minY, Math.min(maxY, preferredY));
                    y = preferredY;
                    x = (w - c1 * y) * invA;
                    if (minX <= x && x <= maxX && a * x + c1 * y >= 0) {
                        if (!s || transformSize(s.x, s.y, matrix).height > transformSize(x, y, matrix).height) {
                            s.recycle();
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                    x = (-w - c1 * y) * invA;
                    if (minX <= x && x <= maxX && a * x + c1 * y < 0) {
                        if (!s || transformSize(s.x, s.y, matrix).height > transformSize(x, y, matrix).height) {
                            s.recycle();
                            s = dou.recyclable(dou2d.Point);
                            s.set(x, y);
                        }
                    }
                }
                if (s) {
                    return s;
                }
                let b = matrix.b;
                let d = matrix.d;
                let d1 = (b * d >= 0) ? d : -d;
                return solveEquation(a, c1, w, minX, minY, maxX, maxY, b, d1);
            }
            function solveEquation(a, c, w, minX, minY, maxX, maxY, b, d) {
                if (a == 0 || c == 0) {
                    return null;
                }
                let x;
                let y;
                let A = (w - minX * a) / c;
                let B = (w - maxX * a) / c;
                let rangeMinY = Math.max(minY, Math.min(A, B));
                let rangeMaxY = Math.min(maxY, Math.max(A, B));
                let det = (b * c - a * d);
                if (rangeMinY <= rangeMaxY) {
                    if (Math.abs(det) < 1.0e-9) {
                        y = w / (a + c);
                    }
                    else {
                        y = b * w / det;
                    }
                    y = Math.max(rangeMinY, Math.min(y, rangeMaxY));
                    x = (w - c * y) / a;
                    let point = dou.recyclable(dou2d.Point);
                    point.set(x, y);
                    return point;
                }
                A = -(minX * a + w) / c;
                B = -(maxX * a + w) / c;
                rangeMinY = Math.max(minY, Math.min(A, B));
                rangeMaxY = Math.min(maxY, Math.max(A, B));
                if (rangeMinY <= rangeMaxY) {
                    if (Math.abs(det) < 1.0e-9) {
                        y = -w / (a + c);
                    }
                    else {
                        y = -b * w / det;
                    }
                    y = Math.max(rangeMinY, Math.min(y, rangeMaxY));
                    x = (-w - c * y) / a;
                    let point = dou.recyclable(dou2d.Point);
                    point.set(x, y);
                    return point;
                }
                return null;
            }
            function calcUBoundsToFitTBounds(w, h, matrix, minX, minY, maxX, maxY) {
                let a = matrix.a;
                let b = matrix.b;
                let c = matrix.c;
                let d = matrix.d;
                if (-1.0e-9 < a && a < +1.0e-9) {
                    a = 0;
                }
                if (-1.0e-9 < b && b < +1.0e-9) {
                    b = 0;
                }
                if (-1.0e-9 < c && c < +1.0e-9) {
                    c = 0;
                }
                if (-1.0e-9 < d && d < +1.0e-9) {
                    d = 0;
                }
                if (b == 0 && c == 0) {
                    if (a == 0 || d == 0) {
                        return null;
                    }
                    let point = dou.recyclable(dou2d.Point);
                    point.set(w / Math.abs(a), h / Math.abs(d));
                    return point;
                }
                if (a == 0 && d == 0) {
                    if (b == 0 || c == 0) {
                        return null;
                    }
                    let point = dou.recyclable(dou2d.Point);
                    point.set(h / Math.abs(b), w / Math.abs(c));
                    return point;
                }
                let c1 = (a * c >= 0) ? c : -c;
                let d1 = (b * d >= 0) ? d : -d;
                let det = a * d1 - b * c1;
                if (Math.abs(det) < 1.0e-9) {
                    if (c1 == 0 || a == 0 || a == -c1) {
                        return null;
                    }
                    if (Math.abs(a * h - b * w) > 1.0e-9) {
                        return null;
                    }
                    return solveEquation(a, c1, w, minX, minX, maxX, maxY, b, d1);
                }
                let invDet = 1 / det;
                w *= invDet;
                h *= invDet;
                let s;
                s = solveSystem(a, c1, b, d1, w, h);
                if (s && minX <= s.x && s.x <= maxX && minY <= s.y && s.y <= maxY && a * s.x + c1 * s.x >= 0 && b * s.x + d1 * s.y >= 0) {
                    return s;
                }
                s = solveSystem(a, c1, b, d1, w, -h);
                if (s && minX <= s.x && s.x <= maxX && minY <= s.y && s.y <= maxY && a * s.x + c1 * s.x >= 0 && b * s.x + d1 * s.y < 0) {
                    return s;
                }
                s = solveSystem(a, c1, b, d1, -w, h);
                if (s && minX <= s.x && s.x <= maxX && minY <= s.y && s.y <= maxY && a * s.x + c1 * s.x < 0 && b * s.x + d1 * s.y >= 0) {
                    return s;
                }
                s = solveSystem(a, c1, b, d1, -w, -h);
                if (s && minX <= s.x && s.x <= maxX && minY <= s.y && s.y <= maxY && a * s.x + c1 * s.x < 0 && b * s.x + d1 * s.y < 0) {
                    return s;
                }
                s.recycle();
                return null;
            }
            function transformSize(width, height, matrix) {
                let bounds = tempRectangle.set(0, 0, width, height);
                matrix.transformBounds(bounds);
                return bounds;
            }
            function solveSystem(a, c, b, d, mOverDet, nOverDet) {
                let point = dou.recyclable(dou2d.Point);
                point.set(d * mOverDet - c * nOverDet, a * nOverDet - b * mOverDet);
                return point;
            }
        })(MatrixUtil = sys.MatrixUtil || (sys.MatrixUtil = {}));
    })(sys = douUI.sys || (douUI.sys = {}));
})(douUI || (douUI = {}));
var douUI;
(function (douUI) {
    /**
     * 树形组件工具类
     * @author wizardc
     */
    let TreeUtil;
    (function (TreeUtil) {
        /**
         * 获取树组件数据源
         * @param source 如果有子项需要有 children 字段来表示
         */
        function getTree(source) {
            if (!source) {
                return undefined;
            }
            let result = {};
            setChildren(source, 0, result);
            return result;
        }
        TreeUtil.getTree = getTree;
        function setChildren(source, depth, target, parent) {
            target.depth = depth;
            target.data = source;
            target.parent = parent;
            target.expand = false;
            let children = source.children;
            if (children && Array.isArray(children) && children.length > 0) {
                target.children = [];
                for (let item of children) {
                    let newItem = {};
                    setChildren(item, depth + 1, newItem, target);
                    target.children.push(newItem);
                }
            }
        }
        function forEach(treeData, ignoreClose, callback, thisObj) {
            callback.call(thisObj, treeData);
            let children = treeData.children;
            if (children && children.length > 0 && (!ignoreClose || treeData.expand)) {
                for (let child of children) {
                    forEach(child, ignoreClose, callback, thisObj);
                }
            }
        }
        TreeUtil.forEach = forEach;
        function getTreeData(source, data) {
            let result;
            TreeUtil.forEach(source, false, (treeData) => {
                if (treeData.data === data) {
                    result = treeData;
                }
            });
            return result;
        }
        TreeUtil.getTreeData = getTreeData;
        function expand(target) {
            target.expand = true;
            while (target.parent) {
                target = target.parent;
                target.expand = true;
            }
        }
        TreeUtil.expand = expand;
    })(TreeUtil = douUI.TreeUtil || (douUI.TreeUtil = {}));
})(douUI || (douUI = {}));
(function (Dou) {
    Dou.sys = Dou.sys || {};
    Dou.DefaultAssetAdapter = douUI.DefaultAssetAdapter;
    Dou.getAsset = douUI.getAsset;
    Dou.ArrayCollection = douUI.ArrayCollection;
    Dou.sys.Animation = douUI.sys.Animation;
    Dou.ListBase = douUI.ListBase;
    Dou.Range = douUI.Range;
    Dou.ScrollBarBase = douUI.ScrollBarBase;
    Dou.SliderBase = douUI.SliderBase;
    Dou.sys.TouchScroll = douUI.sys.TouchScroll;
    Dou.BitmapLabel = douUI.BitmapLabel;
    Dou.Button = douUI.Button;
    Dou.CheckBox = douUI.CheckBox;
    Dou.Component = douUI.Component;
    Dou.DataGroup = douUI.DataGroup;
    Dou.EditableText = douUI.EditableText;
    Dou.Group = douUI.Group;
    Dou.HScrollBar = douUI.HScrollBar;
    Dou.HSlider = douUI.HSlider;
    Dou.Image = douUI.Image;
    Dou.ItemRenderer = douUI.ItemRenderer;
    Dou.Label = douUI.Label;
    Dou.List = douUI.List;
    Dou.ProgressBar = douUI.ProgressBar;
    Dou.RadioButton = douUI.RadioButton;
    Dou.RadioButtonGroup = douUI.RadioButtonGroup;
    Dou.Rect = douUI.Rect;
    Dou.RichLabel = douUI.RichLabel;
    Dou.Scroller = douUI.Scroller;
    Dou.TabBar = douUI.TabBar;
    Dou.ToggleButton = douUI.ToggleButton;
    Dou.Tree = douUI.Tree;
    Dou.UILayer = douUI.UILayer;
    Dou.ViewStack = douUI.ViewStack;
    Dou.VScrollBar = douUI.VScrollBar;
    Dou.VSlider = douUI.VSlider;
    Dou.sys.UIComponentImpl = douUI.sys.UIComponentImpl;
    Dou.sys.Validator = douUI.sys.Validator;
    Dou.CollectionEvent = douUI.CollectionEvent;
    Dou.ItemTapEvent = douUI.ItemTapEvent;
    Dou.UIEvent = douUI.UIEvent;
    Dou.sys.ChildInfo = douUI.sys.ChildInfo;
    Dou.LayoutBase = douUI.LayoutBase;
    Dou.LinearLayoutBase = douUI.LinearLayoutBase;
    Dou.BasicLayout = douUI.BasicLayout;
    Dou.HorizontalLayout = douUI.HorizontalLayout;
    Dou.TileLayout = douUI.TileLayout;
    Dou.VerticalLayout = douUI.VerticalLayout;
    Dou.SkinBase = douUI.SkinBase;
    Dou.Theme = douUI.Theme;
    Dou.sys.implementUIComponent = douUI.sys.implementUIComponent;
    Dou.sys.mixin = douUI.sys.mixin;
    Dou.sys.isIUIComponent = douUI.sys.isIUIComponent;
    Dou.sys.measure = douUI.sys.measure;
    Dou.sys.updateDisplayList = douUI.sys.updateDisplayList;
    Dou.sys.MatrixUtil = douUI.sys.MatrixUtil;
    Dou.TreeUtil = douUI.TreeUtil;
})(window.Dou || (window.Dou = {}));

namespace douUI.sys {
    /**
     * 失效验证管理器
     * @author wizardc
     */
    export class Validator extends dou.EventDispatcher {
        private _targetLevel: number = Number.POSITIVE_INFINITY;

        private _invalidatePropertiesFlag: boolean = false;
        private _invalidateClientPropertiesFlag: boolean = false;
        private _invalidatePropertiesQueue: DepthQueue = new DepthQueue();

        private _invalidateSizeFlag: boolean = false;
        private _invalidateClientSizeFlag: boolean = false;
        private _invalidateSizeQueue: DepthQueue = new DepthQueue();

        private _invalidateDisplayListFlag: boolean = false;
        private _invalidateDisplayListQueue: DepthQueue = new DepthQueue();

        private _eventDisplay: dou2d.Bitmap = new dou2d.Bitmap();

        /**
         * 是否已经添加了事件监听
         */
        private _listenersAttached: boolean = false;

        /**
         * 标记组件属性失效
         */
        public invalidateProperties(client: IUIComponent): void {
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
        private validateProperties(): void {
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
        public invalidateSize(client: IUIComponent): void {
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
        private validateSize(): void {
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
        public invalidateDisplayList(client: IUIComponent): void {
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
        private validateDisplayList(): void {
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
        private attachListeners(): void {
            this._eventDisplay.on(dou2d.Event2D.ENTER_FRAME, this.doPhasedInstantiationCallBack, this);
            this._eventDisplay.on(dou2d.Event2D.RENDER, this.doPhasedInstantiationCallBack, this);
            dou2d.sys.stage.invalidate();
            this._listenersAttached = true;
        }

        /**
         * 执行属性应用
         */
        private doPhasedInstantiationCallBack(event?: dou2d.Event2D): void {
            this._eventDisplay.off(dou2d.Event2D.ENTER_FRAME, this.doPhasedInstantiationCallBack, this);
            this._eventDisplay.off(dou2d.Event2D.RENDER, this.doPhasedInstantiationCallBack, this);
            this.doPhasedInstantiation();
        }

        private doPhasedInstantiation(): void {
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
        public validateClient(target: IUIComponent): void {
            let obj: IUIComponent;
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
                        obj = <IUIComponent>(propertiesQueue.removeSmallestChild(target));
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

    /**
     * 显示列表嵌套深度排序队列
     * @author wizardc
     */
    class DepthQueue {
        /**
         * 深度队列
         */
        private depthBins: { [key: number]: DepthBin } = {};

        /**
         * 最小深度
         */
        private minDepth: number = 0;

        /**
         * 最大深度
         */
        private maxDepth: number = -1;

        /**
         * 插入一个元素
         */
        public insert(client: IUIComponent): void {
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
        public pop(): IUIComponent {
            let client: IUIComponent;
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
        public shift(): IUIComponent {
            let client: IUIComponent;
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
        public removeLargestChild(client: IUIComponent): IUIComponent {
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
                            if ((<dou2d.DisplayObjectContainer><any>client).contains(value)) {
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
        public removeSmallestChild(client: IUIComponent): IUIComponent {
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
                            if ((<dou2d.DisplayObjectContainer><any>client).contains(value)) {
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
        public isEmpty(): boolean {
            return this.minDepth > this.maxDepth;
        }
    }

    /**
     * 列表项
     * @author wizardc
     */
    class DepthBin {
        public map: Map<IUIComponent, boolean> = new Map();
        public items: IUIComponent[] = [];
        public length: number = 0;

        public insert(client: IUIComponent): void {
            if (this.map.has(client)) {
                return;
            }
            this.map.set(client, true);
            this.length++;
            this.items.push(client);
        }

        public pop(): IUIComponent {
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

        public remove(client: IUIComponent): void {
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
}

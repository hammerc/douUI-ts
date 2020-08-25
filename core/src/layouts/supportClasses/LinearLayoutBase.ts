namespace douUI {
    /**
     * 线性布局基类
     * @author wizardc
     */
    export abstract class LinearLayoutBase extends LayoutBase {
        protected _horizontalAlign: dou2d.HorizontalAlign | JustifyAlign = dou2d.HorizontalAlign.left;
        protected _verticalAlign: dou2d.VerticalAlign | JustifyAlign = dou2d.VerticalAlign.top;

        protected _gap: number = 6;

        protected _paddingLeft: number = 0;
        protected _paddingRight: number = 0;
        protected _paddingTop: number = 0;
        protected _paddingBottom: number = 0;

        /**
         * 虚拟布局使用的尺寸缓存
         */
        protected _elementSizeTable: number[] = [];

        /**
         * 虚拟布局使用的当前视图中的第一个元素索引
         */
        protected _startIndex: number = -1;

        /**
         * 虚拟布局使用的当前视图中的最后一个元素的索引
         */
        protected _endIndex: number = -1;

        /**
         * 视图的第一个和最后一个元素的索引值已经计算好的标志
         */
        protected _indexInViewCalculated: boolean = false;

        /**
         * 子元素最大的尺寸
         */
        protected _maxElementSize: number = 0;

        /**
         * 布局元素的水平对齐策略
         */
        public set horizontalAlign(value: dou2d.HorizontalAlign | JustifyAlign) {
            if (this._horizontalAlign == value) {
                return;
            }
            this._horizontalAlign = value;
            if (this._target) {
                this._target.invalidateDisplayList();
            }
        }
        public get horizontalAlign(): dou2d.HorizontalAlign | JustifyAlign {
            return this._horizontalAlign;
        }

        /**
         * 布局元素的垂直对齐策略
         */
        public set verticalAlign(value: dou2d.VerticalAlign | JustifyAlign) {
            if (this._verticalAlign == value) {
                return;
            }
            this._verticalAlign = value;
            if (this._target) {
                this._target.invalidateDisplayList();
            }
        }
        public get verticalAlign(): dou2d.VerticalAlign | JustifyAlign {
            return this._verticalAlign;
        }

        /**
         * 布局元素之间的间隔
         */
        public set gap(value: number) {
            value = +value || 0;
            if (this._gap === value) {
                return;
            }
            this._gap = value;
            this.invalidateTargetLayout();
        }
        public get gap(): number {
            return this._gap;
        }

        /**
         * 容器的左边缘与第一个布局元素的左边缘之间的像素数
         */
        public set paddingLeft(value: number) {
            value = +value || 0;
            if (this._paddingLeft === value) {
                return;
            }
            this._paddingLeft = value;
            this.invalidateTargetLayout();
        }
        public get paddingLeft(): number {
            return this._paddingLeft;
        }

        /**
         * 容器的右边缘与最后一个布局元素的右边缘之间的像素数
         */
        public set paddingRight(value: number) {
            value = +value || 0;
            if (this._paddingRight === value) {
                return;
            }
            this._paddingRight = value;
            this.invalidateTargetLayout();
        }
        public get paddingRight(): number {
            return this._paddingRight;
        }

        /**
         * 容器的顶边缘与所有容器的布局元素的顶边缘之间的最少像素数
         */
        public set paddingTop(value: number) {
            value = +value || 0;
            if (this._paddingTop === value) {
                return;
            }
            this._paddingTop = value;
            this.invalidateTargetLayout();
        }
        public get paddingTop(): number {
            return this._paddingTop;
        }

        /**
         * 容器的底边缘与所有容器的布局元素的底边缘之间的最少像素数
         */
        public set paddingBottom(value: number) {
            value = +value || 0;
            if (this._paddingBottom === value) {
                return;
            }
            this._paddingBottom = value;
            this.invalidateTargetLayout();
        }
        public get paddingBottom(): number {
            return this._paddingBottom;
        }

        /**
         * 失效目标容器的尺寸和显示列表的简便方法
         */
        protected invalidateTargetLayout(): void {
            let target = this._target;
            if (target) {
                target.invalidateSize();
                target.invalidateDisplayList();
            }
        }

        public measure(): void {
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
        protected measureReal(): void {
        }

        /**
         * 计算目标容器 measuredWidth 和 measuredHeight 的近似值
         */
        protected measureVirtual(): void {
        }

        public updateDisplayList(width: number, height: number): void {
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
        protected getStartPosition(index: number): number {
            return 0;
        }

        /**
         * 获取指定索引元素的尺寸
         */
        protected getElementSize(index: number): number {
            return 0;
        }

        /**
         * 获取缓存的子对象尺寸总和
         */
        protected getElementTotalSize(): number {
            return 0;
        }

        public elementRemoved(index: number): void {
            if (!this._useVirtualLayout) {
                return;
            }
            super.elementRemoved(index);
            this._elementSizeTable.splice(index, 1);
        }

        public clearVirtualLayoutCache(): void {
            if (!this._useVirtualLayout) {
                return;
            }
            this._elementSizeTable = [];
            this._maxElementSize = 0;
        }

        /**
         * 折半查找法寻找指定位置的显示对象索引
         */
        protected findIndexAt(x: number, i0: number, i1: number): number {
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

        public scrollPositionChanged(): void {
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
        protected getIndexInView(): boolean {
            return false;
        }

        /**
         * 更新虚拟布局的显示列表
         */
        protected updateDisplayListVirtual(width: number, height: number): void {
        }

        /**
         * 更新真实布局的显示列表
         */
        protected updateDisplayListReal(width: number, height: number): void {
        }

        /**
         * 为每个可变尺寸的子项分配空白区域
         */
        protected flexChildrenProportionally(spaceForChildren: number, spaceToDistribute: number, totalPercent: number, childInfoArray: sys.ChildInfo[]): void {
            let numElements = childInfoArray.length;
            let done: boolean;
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
            }
            while (!done);
        }
    }
}

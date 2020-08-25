namespace douUI {
    /**
     * 单元格布局类
     * @author wizardc
     */
    export class TileLayout extends LayoutBase {
        private _explicitHorizontalGap: number = NaN;
        private _horizontalGap: number = 6;

        private _explicitVerticalGap: number = NaN;
        private _verticalGap: number = 6;

        private _columnCount: number = -1;
        private _requestedColumnCount: number = 0;

        private _rowCount: number = -1;
        private _requestedRowCount: number = 0;

        private _explicitColumnWidth: number = NaN;
        private _columnWidth: number = NaN;

        private _explicitRowHeight: number = NaN;
        private _rowHeight: number = NaN;

        private _paddingLeft: number = 0;
        private _paddingRight: number = 0;
        private _paddingTop: number = 0;
        private _paddingBottom: number = 0;

        private _horizontalAlign: dou2d.HorizontalAlign | JustifyAlign = JustifyAlign.justify;
        private _verticalAlign: dou2d.VerticalAlign | JustifyAlign = JustifyAlign.justify;
        private _columnAlign: ColumnAlign = ColumnAlign.left;
        private _rowAlign: RowAlign = RowAlign.top;
        private _orientation: TileOrientation = TileOrientation.rows;

        /**
         * 当前视图中的第一个元素索引
         */
        private _startIndex: number = -1;

        /**
         * 当前视图中的最后一个元素的索引
         */
        private _endIndex: number = -1;

        /**
         * 视图的第一个和最后一个元素的索引值已经计算好的标志
         */
        private _indexInViewCalculated: boolean = false;

        /**
         * 缓存的最大子对象宽度
         */
        private _maxElementWidth: number = 0;

        /**
         * 缓存的最大子对象高度
         */
        private _maxElementHeight: number = 0;

        /**
         * 列之间的水平空间
         */
        public set horizontalGap(value: number) {
            value = +value;
            if (value === this._horizontalGap) {
                return;
            }
            this._explicitHorizontalGap = value;
            this._horizontalGap = value;
            this.invalidateTargetLayout();
        }
        public get horizontalGap(): number {
            return this._horizontalGap;
        }

        /**
         * 行之间的垂直空间
         */
        public set verticalGap(value: number) {
            value = +value;
            if (value === this._verticalGap) {
                return;
            }
            this._explicitVerticalGap = value;
            this._verticalGap = value;
            this.invalidateTargetLayout();
        }
        public get verticalGap(): number {
            return this._verticalGap;
        }

        /**
         *  列计数
         */
        public get columnCount(): number {
            return this._columnCount;
        }

        /**
         * 要显示的列数
         * * 设置为 0 会允许 TileLayout 自动确定列计数
         */
        public set requestedColumnCount(value: number) {
            value = +value || 0;
            if (this._requestedColumnCount === value) {
                return;
            }
            this._requestedColumnCount = value;
            this._columnCount = value;
            this.invalidateTargetLayout();
        }
        public get requestedColumnCount(): number {
            return this._requestedColumnCount;
        }

        /**
         *  行计数
         */
        public get rowCount(): number {
            return this._rowCount;
        }

        /**
         * 要显示的行数
         * * 设置为 -1 会删除显式覆盖并允许 TileLayout 自动确定行计数
         */
        public set requestedRowCount(value: number) {
            value = +value || 0;
            if (this._requestedRowCount == value) {
                return;
            }
            this._requestedRowCount = value;
            this._rowCount = value;
            this.invalidateTargetLayout();
        }
        public get requestedRowCount(): number {
            return this._requestedRowCount;
        }

        /**
         * 列宽
         */
        public set columnWidth(value: number) {
            value = +value;
            if (value === this._columnWidth) {
                return;
            }
            this._explicitColumnWidth = value;
            this._columnWidth = value;
            this.invalidateTargetLayout();
        }
        public get columnWidth(): number {
            return this._columnWidth;
        }

        /**
         * 行高
         */
        public set rowHeight(value: number) {
            value = +value;
            if (value === this._rowHeight) {
                return;
            }
            this._explicitRowHeight = value;
            this._rowHeight = value;
            this.invalidateTargetLayout();
        }
        public get rowHeight(): number {
            return this._rowHeight;
        }

        public set paddingTop(value: number) {
            value = +value || 0;
            if (this._paddingTop == value) {
                return;
            }
            this._paddingTop = value;
            this.invalidateTargetLayout();
        }
        public get paddingTop(): number {
            return this._paddingTop;
        }

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

        public set paddingLeft(value: number) {
            value = +value || 0;
            if (this._paddingLeft == value) {
                return;
            }
            this._paddingLeft = value;
            this.invalidateTargetLayout();
        }
        public get paddingLeft(): number {
            return this._paddingLeft;
        }

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
         * 指定如何在水平方向上对齐单元格内的元素
         */
        public set horizontalAlign(value: dou2d.HorizontalAlign | JustifyAlign) {
            if (this._horizontalAlign == value) {
                return;
            }
            this._horizontalAlign = value;
            this.invalidateTargetLayout();
        }
        public get horizontalAlign(): dou2d.HorizontalAlign | JustifyAlign {
            return this._horizontalAlign;
        }

        /**
         * 指定如何在垂直方向上对齐单元格内的元素
         */
        public set verticalAlign(value: dou2d.VerticalAlign | JustifyAlign) {
            if (this._verticalAlign == value) {
                return;
            }
            this._verticalAlign = value;
            this.invalidateTargetLayout();
        }
        public get verticalAlign(): dou2d.VerticalAlign | JustifyAlign {
            return this._verticalAlign;
        }

        /**
         * 指定如何将完全可见列与容器宽度对齐
         */
        public set columnAlign(value: ColumnAlign) {
            if (this._columnAlign == value) {
                return;
            }
            this._columnAlign = value;
            this.invalidateTargetLayout();
        }
        public get columnAlign(): ColumnAlign {
            return this._columnAlign;
        }

        /**
         * 指定如何将完全可见行与容器高度对齐
         */
        public set rowAlign(value: RowAlign) {
            if (this._rowAlign == value) {
                return;
            }
            this._rowAlign = value;
            this.invalidateTargetLayout();
        }
        public get rowAlign(): RowAlign {
            return this._rowAlign;
        }

        /**
         * 指定是逐行还是逐列排列元素
         */
        public set orientation(value: TileOrientation) {
            if (this._orientation == value) {
                return;
            }
            this._orientation = value;
            this.invalidateTargetLayout();
        }
        public get orientation(): TileOrientation {
            return this._orientation;
        }

        /**
         * 标记目标容器的尺寸和显示列表失效
         */
        private invalidateTargetLayout(): void {
            let target = this._target;
            if (target) {
                target.invalidateSize();
                target.invalidateDisplayList();
            }
        }

        public measure(): void {
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
            this.calculateRowAndColumn(values[sys.UIKeys.explicitWidth], values[sys.UIKeys.explicitHeight]);
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
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding)
            this._columnCount = savedColumnCount;
            this._rowCount = savedRowCount;
            this._columnWidth = savedColumnWidth;
            this._rowHeight = savedRowHeight;
        }

        /**
         * 计算行和列的尺寸及数量
         */
        private calculateRowAndColumn(explicitWidth: number, explicitHeight: number): void {
            let target = this._target;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            this._rowCount = this._columnCount = -1;
            let numElements = target.numElements;
            let count = numElements;
            for (let index = 0; index < count; index++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(index));
                if (layoutElement && (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout)) {
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
            let orientedByColumns = (this._orientation == TileOrientation.columns);
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
                if (this._orientation == TileOrientation.rows) {
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
        private updateMaxElementSize(): void {
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
        private doUpdateMaxElementSize(startIndex: number, endIndex: number): void {
            let maxElementWidth = this._maxElementWidth;
            let maxElementHeight = this._maxElementHeight;
            let bounds = dou.recyclable(dou2d.Rectangle);
            let target = this._target;
            if ((startIndex != -1) && (endIndex != -1)) {
                for (let index = startIndex; index <= endIndex; index++) {
                    let elt = <sys.IUIComponent>target.getVirtualElementAt(index);
                    if (!sys.isIUIComponent(elt) || !elt.includeInLayout) {
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

        public clearVirtualLayoutCache(): void {
            super.clearVirtualLayoutCache();
            this._maxElementWidth = 0;
            this._maxElementHeight = 0;
        }

        public scrollPositionChanged(): void {
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
        private getIndexInView(): boolean {
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
            if (values[sys.UIKeys.width] == 0 || values[sys.UIKeys.height] == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let oldStartIndex = this._startIndex;
            let oldEndIndex = this._endIndex;
            let paddingL = this._paddingLeft;
            let paddingT = this._paddingTop;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            if (this._orientation == TileOrientation.columns) {
                let itemWidth = this._columnWidth + horizontalGap;
                if (itemWidth <= 0) {
                    this._startIndex = 0;
                    this._endIndex = numElements - 1;
                    return false;
                }
                let minVisibleX = target.scrollH;
                let maxVisibleX = minVisibleX + values[sys.UIKeys.width];
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
                let maxVisibleY = minVisibleY + values[sys.UIKeys.height];
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

        public updateDisplayList(width: number, height: number): void {
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
            let elt: sys.IUIComponent;
            let x: number;
            let y: number;
            let columnIndex: number;
            let rowIndex: number;
            let orientedByColumns = (this._orientation == TileOrientation.columns);
            let index = this._startIndex;
            let horizontalGap = isNaN(this._horizontalGap) ? 0 : this._horizontalGap;
            let verticalGap = isNaN(this._verticalGap) ? 0 : this._verticalGap;
            let rowCount = this._rowCount;
            let columnCount = this._columnCount;
            let columnWidth = this._columnWidth;
            let rowHeight = this._rowHeight;
            for (let i = this._startIndex; i <= endIndex; i++) {
                if (this._useVirtualLayout) {
                    elt = <sys.IUIComponent>(this.target.getVirtualElementAt(i));
                }
                else {
                    elt = <sys.IUIComponent>(this.target.getElementAt(i));
                }
                if (!sys.isIUIComponent(elt) || !elt.includeInLayout) {
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
                    case dou2d.HorizontalAlign.right:
                        x = width - (columnIndex + 1) * (columnWidth + horizontalGap) + horizontalGap - paddingR;
                        break;
                    case dou2d.HorizontalAlign.left:
                        x = columnIndex * (columnWidth + horizontalGap) + paddingL;
                        break;
                    default:
                        x = columnIndex * (columnWidth + horizontalGap) + paddingL;
                }
                switch (this._verticalAlign) {
                    case dou2d.VerticalAlign.top:
                        y = rowIndex * (rowHeight + verticalGap) + paddingT;
                        break;
                    case dou2d.VerticalAlign.bottom:
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
        private sizeAndPositionElement(element: sys.IUIComponent, cellX: number, cellY: number, cellWidth: number, cellHeight: number): void {
            let elementWidth = NaN;
            let elementHeight = NaN;
            let values = element.$UIComponent;
            if (this._horizontalAlign == JustifyAlign.justify) {
                elementWidth = cellWidth;
            }
            else if (!isNaN(values[sys.UIKeys.percentWidth])) {
                elementWidth = cellWidth * values[sys.UIKeys.percentWidth] * 0.01;
            }
            if (this._verticalAlign == JustifyAlign.justify) {
                elementHeight = cellHeight;
            }
            else if (!isNaN(values[sys.UIKeys.percentHeight])) {
                elementHeight = cellHeight * values[sys.UIKeys.percentHeight] * 0.01;
            }
            element.setLayoutBoundsSize(Math.round(elementWidth), Math.round(elementHeight));
            let x = cellX;
            let bounds = dou.recyclable(dou2d.Rectangle);
            element.getLayoutBounds(bounds);
            switch (this._horizontalAlign) {
                case dou2d.HorizontalAlign.right:
                    x += cellWidth - bounds.width;
                    break;
                case dou2d.HorizontalAlign.center:
                    x = cellX + (cellWidth - bounds.width) / 2;
                    break;
            }
            let y = cellY;
            switch (this._verticalAlign) {
                case dou2d.VerticalAlign.bottom:
                    y += cellHeight - bounds.height;
                    break;
                case dou2d.VerticalAlign.middle:
                    y += (cellHeight - bounds.height) / 2;
                    break;
            }
            element.setLayoutBoundsPosition(Math.round(x), Math.round(y));
            bounds.recycle();
        }

        /**
         * 为两端对齐调整间隔或格子尺寸
         */
        private adjustForJustify(width: number, height: number): void {
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
                if (this._rowAlign == RowAlign.justifyUsingGap) {
                    gapCount = Math.max(1, this._rowCount - 1);
                    this._verticalGap = offsetY / gapCount;
                }
                else if (this._rowAlign == RowAlign.justifyUsingHeight) {
                    if (this._rowCount > 0) {
                        this._rowHeight += (offsetY - (this._rowCount - 1) * this._verticalGap) / this._rowCount;
                    }
                }
            }
            if (offsetX > 0) {
                if (this._columnAlign == ColumnAlign.justifyUsingGap) {
                    gapCount = Math.max(1, this._columnCount - 1);
                    this._horizontalGap = offsetX / gapCount;
                }
                else if (this._columnAlign == ColumnAlign.justifyUsingWidth) {
                    if (this._columnCount > 0) {
                        this._columnWidth += (offsetX - (this._columnCount - 1) * this._horizontalGap) / this._columnCount;
                    }
                }
            }
        }
    }
}

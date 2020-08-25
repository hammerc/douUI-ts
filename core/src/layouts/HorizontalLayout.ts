namespace douUI {
    /**
     * 水平布局类
     * @author wizardc
     */
    export class HorizontalLayout extends LinearLayoutBase {
        protected measureReal(): void {
            let target = this._target;
            let count = target.numElements;
            let numElements = count;
            let measuredWidth = 0;
            let measuredHeight = 0;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (let i = 0; i < count; i++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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

        protected measureVirtual(): void {
            let target = this._target;
            let typicalWidth = this._typicalWidth;
            let measuredWidth = this.getElementTotalSize();
            let measuredHeight = Math.max(this._maxElementSize, this._typicalHeight);
            let bounds = dou.recyclable(dou2d.Rectangle);
            let endIndex = this._endIndex;
            let elementSizeTable = this._elementSizeTable;
            for (let index = this._startIndex; index < endIndex; index++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(index));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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

        protected updateDisplayListReal(width: number, height: number): void {
            let target = this._target;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let gap = this._gap;
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let hJustify = this._horizontalAlign == JustifyAlign.justify;
            let vJustify = this._verticalAlign == JustifyAlign.justify || this._verticalAlign == JustifyAlign.contentJustify;
            let vAlign = 0;
            if (!vJustify) {
                if (this._verticalAlign == dou2d.VerticalAlign.middle) {
                    vAlign = 0.5;
                }
                else if (this._verticalAlign == dou2d.VerticalAlign.bottom) {
                    vAlign = 1;
                }
            }
            let count = target.numElements;
            let numElements = count;
            let x = paddingL;
            let y = paddingT;
            let i: number;
            let layoutElement: sys.IUIComponent;
            let totalPreferredWidth = 0;
            let totalPercentWidth = 0;
            let childInfoArray: sys.ChildInfo[] = [];
            let childInfo: sys.ChildInfo;
            let widthToDistribute = targetWidth;
            let maxElementHeight = this._maxElementSize;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (i = 0; i < count; i++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
                    if (!isNaN(values[sys.UIKeys.percentWidth])) {
                        totalPercentWidth += values[sys.UIKeys.percentWidth];
                        childInfo = new sys.ChildInfo();
                        childInfo.layoutElement = layoutElement;
                        childInfo.percent = values[sys.UIKeys.percentWidth];
                        childInfo.min = values[sys.UIKeys.minWidth];
                        childInfo.max = values[sys.UIKeys.maxWidth];
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
            let averageWidth: number;
            let largeChildrenCount = numElements;
            let widthDic: Map<sys.IUIComponent, number> = new Map();
            if (hJustify) {
                if (excessSpace < 0) {
                    averageWidth = widthToDistribute / numElements;
                    for (i = 0; i < count; i++) {
                        layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                        if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
            if (this._horizontalAlign == dou2d.HorizontalAlign.center) {
                x = paddingL + widthToDistribute * 0.5;
            }
            else if (this._horizontalAlign == dou2d.HorizontalAlign.right) {
                x = paddingL + widthToDistribute;
            }
            let maxX = paddingL;
            let maxY = paddingT;
            let dx = 0;
            let dy = 0;
            let justifyHeight = Math.ceil(targetHeight);
            if (this._verticalAlign == JustifyAlign.contentJustify) {
                justifyHeight = Math.ceil(Math.max(targetHeight, maxElementHeight));
            }
            let roundOff = 0;
            let layoutElementWidth: number;
            let childWidth: number;
            for (i = 0; i < count; i++) {
                let exceesHeight = 0;
                layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
                        childWidth = widthToDistribute / largeChildrenCount
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
                        let percent = Math.min(100, values[sys.UIKeys.percentHeight]);
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

        protected updateDisplayListVirtual(width: number, height: number): void {
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
            let contentWidth: number;
            let numElements = target.numElements;
            if (this._startIndex == -1 || this._endIndex == -1) {
                contentWidth = this.getStartPosition(numElements) - gap + paddingR;
                target.setContentSize(contentWidth, target.contentHeight);
                return;
            }
            let endIndex = this._endIndex;
            target.setVirtualElementIndicesInView(this._startIndex, endIndex);
            // 获取垂直布局参数
            let justify = this._verticalAlign == JustifyAlign.justify || this._verticalAlign == JustifyAlign.contentJustify;
            let contentJustify = this._verticalAlign == JustifyAlign.contentJustify;
            let vAlign = 0;
            if (!justify) {
                if (this._verticalAlign == dou2d.VerticalAlign.middle) {
                    vAlign = 0.5;
                }
                else if (this._verticalAlign == dou2d.VerticalAlign.bottom) {
                    vAlign = 1;
                }
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let justifyHeight = Math.ceil(targetHeight);
            let layoutElement: sys.IUIComponent;
            let typicalHeight = this._typicalHeight;
            let typicalWidth = this._typicalWidth;
            let maxElementHeight = this._maxElementSize;
            let oldMaxH = Math.max(typicalHeight, this._maxElementSize);
            if (contentJustify) {
                for (let index = this._startIndex; index <= endIndex; index++) {
                    layoutElement = <sys.IUIComponent>(target.getVirtualElementAt(index));
                    if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
            let oldElementSize: number;
            let needInvalidateSize = false;
            let elementSizeTable = this._elementSizeTable;
            // 对可见区域进行布局
            for (let i = this._startIndex; i <= endIndex; i++) {
                let exceesHeight = 0;
                layoutElement = <sys.IUIComponent>(target.getVirtualElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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

        protected getStartPosition(index: number): number {
            if (!this._useVirtualLayout) {
                if (this._target) {
                    let element = <sys.IUIComponent>this._target.getElementAt(index);
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

        protected getElementSize(index: number): number {
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

        protected getElementTotalSize(): number {
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

        public elementAdded(index: number): void {
            if (!this.useVirtualLayout) {
                return;
            }
            super.elementAdded(index);
            this._elementSizeTable.splice(index, 0, this._typicalWidth);
        }

        protected getIndexInView(): boolean {
            let target = this._target;
            if (!target || target.numElements == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let values = target.$UIComponent;
            if (values[sys.UIKeys.width] <= 0 || values[sys.UIKeys.height] <= 0) {
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
            let maxVisibleX = target.scrollH + values[sys.UIKeys.width];
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
}

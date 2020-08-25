namespace douUI {
    /**
     * 垂直布局类
     * @author wizardc
     */
    export class VerticalLayout extends LinearLayoutBase {
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
                measuredHeight += bounds.height;
                measuredWidth = Math.max(measuredWidth, bounds.width);
            }
            bounds.recycle();
            measuredHeight += (numElements - 1) * this._gap;
            let hPadding = this._paddingLeft + this._paddingRight;
            let vPadding = this._paddingTop + this._paddingBottom;
            target.setMeasuredSize(measuredWidth + hPadding, measuredHeight + vPadding);
        }

        protected measureVirtual(): void {
            let target = this._target;
            let typicalHeight = this._typicalHeight;
            let measuredHeight = this.getElementTotalSize();
            let measuredWidth = Math.max(this._maxElementSize, this._typicalWidth);
            let bounds = dou.recyclable(dou2d.Rectangle);
            let endIndex = this._endIndex;
            let elementSizeTable = this._elementSizeTable;
            for (let index = this._startIndex; index < endIndex; index++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(index));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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

        protected updateDisplayListReal(width: number, height: number): void {
            let target = this._target;
            let paddingL = this._paddingLeft;
            let paddingR = this._paddingRight;
            let paddingT = this._paddingTop;
            let paddingB = this._paddingBottom;
            let gap = this._gap;
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let targetHeight = Math.max(0, height - paddingT - paddingB);
            let vJustify = this._verticalAlign == JustifyAlign.justify;
            let hJustify = this._horizontalAlign == JustifyAlign.justify || this._horizontalAlign == JustifyAlign.contentJustify;
            let hAlign = 0;
            if (!hJustify) {
                if (this._horizontalAlign == dou2d.HorizontalAlign.center) {
                    hAlign = 0.5;
                }
                else if (this._horizontalAlign == dou2d.HorizontalAlign.right) {
                    hAlign = 1;
                }
            }
            let count = target.numElements;
            let numElements = count;
            let x = paddingL;
            let y = paddingT;
            let i: number;
            let layoutElement: sys.IUIComponent;
            let totalPreferredHeight = 0;
            let totalPercentHeight = 0;
            let childInfoArray: sys.ChildInfo[] = [];
            let childInfo: sys.ChildInfo;
            let heightToDistribute = targetHeight;
            let maxElementWidth = this._maxElementSize;
            let bounds = dou.recyclable(dou2d.Rectangle);
            for (i = 0; i < count; i++) {
                let layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
                    if (!isNaN(values[sys.UIKeys.percentHeight])) {
                        totalPercentHeight += values[sys.UIKeys.percentHeight];
                        childInfo = new sys.ChildInfo();
                        childInfo.layoutElement = layoutElement;
                        childInfo.percent = values[sys.UIKeys.percentHeight];
                        childInfo.min = values[sys.UIKeys.minHeight];
                        childInfo.max = values[sys.UIKeys.maxHeight];
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
            let averageHeight: number;
            let largeChildrenCount = numElements;
            let heightDic: Map<sys.IUIComponent, number> = new Map();
            if (vJustify) {
                if (excessSpace < 0) {
                    averageHeight = heightToDistribute / numElements;
                    for (i = 0; i < count; i++) {
                        layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                        if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
            if (this._verticalAlign == dou2d.VerticalAlign.middle) {
                y = paddingT + heightToDistribute * 0.5;
            }
            else if (this._verticalAlign == dou2d.VerticalAlign.bottom) {
                y = paddingT + heightToDistribute;
            }
            let maxX = paddingL;
            let maxY = paddingT;
            let dx = 0;
            let dy = 0;
            let justifyWidth: number = Math.ceil(targetWidth);
            if (this._horizontalAlign == JustifyAlign.contentJustify) {
                justifyWidth = Math.ceil(Math.max(targetWidth, maxElementWidth));
            }
            let roundOff = 0;
            let layoutElementHeight: number;
            let childHeight: number;
            for (i = 0; i < count; i++) {
                let exceesWidth = 0;
                layoutElement = <sys.IUIComponent>(target.getElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
                        childHeight = heightToDistribute / largeChildrenCount
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
                    if (!isNaN(values[sys.UIKeys.percentWidth])) {
                        let percent = Math.min(100, values[sys.UIKeys.percentWidth]);
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

        protected updateDisplayListVirtual(width: number, height: number): void {
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
            let contentHeight: number;
            let numElements = target.numElements;
            if (this._startIndex == -1 || this._endIndex == -1) {
                contentHeight = this.getStartPosition(numElements) - gap + paddingB;
                target.setContentSize(target.contentWidth, contentHeight);
                return;
            }
            let endIndex = this._endIndex;
            target.setVirtualElementIndicesInView(this._startIndex, endIndex);
            // 获取垂直布局参数
            let justify = this._horizontalAlign == JustifyAlign.justify || this._horizontalAlign == JustifyAlign.contentJustify;
            let contentJustify = this._horizontalAlign == JustifyAlign.contentJustify;
            let hAlign = 0;
            if (!justify) {
                if (this._horizontalAlign == dou2d.HorizontalAlign.center) {
                    hAlign = 0.5;
                }
                else if (this._horizontalAlign == dou2d.HorizontalAlign.right) {
                    hAlign = 1;
                }
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            let targetWidth = Math.max(0, width - paddingL - paddingR);
            let justifyWidth = Math.ceil(targetWidth);
            let layoutElement: sys.IUIComponent;
            let typicalHeight = this._typicalHeight;
            let typicalWidth = this._typicalWidth;
            let maxElementWidth = this._maxElementSize;
            let oldMaxW = Math.max(typicalWidth, this._maxElementSize);
            if (contentJustify) {
                for (let index = this._startIndex; index <= endIndex; index++) {
                    layoutElement = <sys.IUIComponent>(target.getVirtualElementAt(index));
                    if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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
            let oldElementSize: number;
            let needInvalidateSize = false;
            let elementSizeTable = this._elementSizeTable;
            // 对可见区域进行布局
            for (let i = this._startIndex; i <= endIndex; i++) {
                let exceesWidth = 0;
                layoutElement = <sys.IUIComponent>(target.getVirtualElementAt(i));
                if (!sys.isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
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

        protected getStartPosition(index: number): number {
            if (!this._useVirtualLayout) {
                if (this._target) {
                    let element = <sys.IUIComponent>this._target.getElementAt(index);
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

        protected getElementSize(index: number): number {
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

        protected getElementTotalSize(): number {
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

        public elementAdded(index: number): void {
            if (!this._useVirtualLayout) {
                return;
            }
            super.elementAdded(index);
            this._elementSizeTable.splice(index, 0, this._typicalHeight);
        }

        protected getIndexInView(): boolean {
            let target = this._target;
            if (!target || target.numElements == 0) {
                this._startIndex = this._endIndex = -1;
                return false;
            }
            let values = target.$UIComponent;
            if (values[sys.UIKeys.width] == 0 || values[sys.UIKeys.height] == 0) {
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
            let maxVisibleY = target.scrollV + values[sys.UIKeys.height];
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
}

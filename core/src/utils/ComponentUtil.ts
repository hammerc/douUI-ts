namespace douUI.sys {
    /**
     * 自定义类实现 IUIComponent 的步骤:
     * 1. 在自定义类的构造函数里调用: this.initializeUIValues();
     * 2. 拷贝 IUIComponent 接口定义的所有内容 (包括注释掉的 protected 函数) 到自定义类, 将所有子类需要覆盖的方法都声明为空方法体
     * 3. 在定义类结尾的外部调用 implementUIComponent(), 并传入自定义类
     * 4. 若覆盖了某个 IUIComponent 的方法, 需要手动调用 UIComponentImpl.prototype["方法名"].call(this);
     * @param descendant 自定义的 IUIComponent 子类
     * @param base 自定义子类继承的父类
     */
    export function implementUIComponent(descendant: any, base: any, isContainer?: boolean): void {
        mixin(descendant, douUI.sys.UIComponentImpl);
        let prototype = descendant.prototype;
        prototype.$super = base.prototype;
        if (isContainer) {
            prototype.$childAdded = function (child: dou2d.DisplayObject, index: number): void {
                this.invalidateSize();
                this.invalidateDisplayList();
            };
            prototype.$childRemoved = function (child: dou2d.DisplayObject, index: number): void {
                this.invalidateSize();
                this.invalidateDisplayList();
            };
        }
    }

    /**
     * 拷贝模板类的方法体和属性到目标类上
     * @param target 目标类
     * @param template 模板类
     */
    export function mixin(target: any, template: any): void {
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

    /**
     * 检查一个函数的方法体是否为空
     */
    function isEmptyFunction(prototype: any, key: string): boolean {
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
    export function isIUIComponent(obj: any): obj is IUIComponent {
        return obj.__interface_type__ === "douUI.sys.IUIComponent";
    }

    function formatRelative(value: number | string, total: number): number {
        if (!value || typeof value == "number") {
            return <number>value;
        }
        let str = <string>value;
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
    export function measure(target: Group | Component): void {
        if (!target) {
            return;
        }
        let width = 0;
        let height = 0;
        let bounds = dou.recyclable(dou2d.Rectangle);
        let count = target.numChildren;
        for (let i = 0; i < count; i++) {
            let layoutElement = <douUI.sys.IUIComponent>(target.getChildAt(i));
            if (!isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                continue;
            }
            let values = layoutElement.$UIComponent;
            let hCenter = +values[sys.UIKeys.horizontalCenter];
            let vCenter = +values[sys.UIKeys.verticalCenter];
            let left = +values[sys.UIKeys.left];
            let right = +values[sys.UIKeys.right];
            let top = +values[sys.UIKeys.top];
            let bottom = +values[sys.UIKeys.bottom];
            let extX: number;
            let extY: number;
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

    /**
     * 使用 BasicLayout 规则布局目标对象
     */
    export function updateDisplayList(target: Group | Component, unscaledWidth: number, unscaledHeight: number): dou.Recyclable<dou2d.Point> {
        if (!target) {
            return;
        }
        let count = target.numChildren;
        let maxX = 0;
        let maxY = 0;
        let bounds = dou.recyclable(dou2d.Rectangle);
        for (let i = 0; i < count; i++) {
            let layoutElement = <sys.IUIComponent>(target.getChildAt(i));
            if (!isIUIComponent(layoutElement) || !layoutElement.includeInLayout) {
                continue;
            }
            let values = layoutElement.$UIComponent;
            let hCenter = formatRelative(values[sys.UIKeys.horizontalCenter], unscaledWidth * 0.5);
            let vCenter = formatRelative(values[sys.UIKeys.verticalCenter], unscaledHeight * 0.5);
            let left = formatRelative(values[sys.UIKeys.left], unscaledWidth);
            let right = formatRelative(values[sys.UIKeys.right], unscaledWidth);
            let top = formatRelative(values[sys.UIKeys.top], unscaledHeight);
            let bottom = formatRelative(values[sys.UIKeys.bottom], unscaledHeight);
            let percentWidth = values[sys.UIKeys.percentWidth];
            let percentHeight = values[sys.UIKeys.percentHeight];
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
}

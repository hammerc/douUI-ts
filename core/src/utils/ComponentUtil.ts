namespace douUI {
    /**
     * 组件工具类
     * @author wizardc
     */
    export namespace ComponentUtil {
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
            mixin(descendant, douUI.core.UIComponentImpl);
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
            let keys = Object.keys(protoBase);
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
    }
}

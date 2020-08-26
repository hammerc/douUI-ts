namespace douUI {
    /**
     * 主题管理器
     * @author wizardc
     */
    export namespace Theme {
        let _defaultSkinMap: Map<{ new(): Component }, { new(): ISkin }> = new Map();
        let _skinMap: { [key: string]: { new(): ISkin } } = {};

        /**
         * 注册组件默认皮肤
         */
        export function registerDefaultSkin(component: { new(): Component }, skinClass: { new(): ISkin }): void {
            if (_defaultSkinMap.has(component)) {
                throw new Error(`默认皮肤已经注册: ${component}`);
            }
            _defaultSkinMap.set(component, skinClass);
        }

        /**
         * 获取指定组件的默认皮肤类
         */
        export function getDefaultSkin(component: { new(): Component }): { new(): ISkin } {
            return _defaultSkinMap.get(component);
        }

        /**
         * 注册皮肤别名
         */
        export function registerSkin(skinName: string, skinClass: { new(): ISkin }): void {
            if (_skinMap.hasOwnProperty(skinName)) {
                throw new Error(`皮肤别名已被注册: ${skinName}`);
            }
            _skinMap[skinName] = skinClass;
        }

        /**
         * 获取指定组件的皮肤类
         */
        export function getSkin(skinName: string): { new(): ISkin } {
            return _skinMap[skinName];
        }
    }
}

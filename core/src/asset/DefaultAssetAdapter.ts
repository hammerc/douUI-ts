namespace douUI {
    /**
     * 默认的资源加载实现
     * * 可根据需要编写自己的资源加载器
     * @author wizardc
     */
    export class DefaultAssetAdapter implements IAssetAdapter {
        public getAsset(source: string, callBack: (content: any, source: string) => void, thisObject: any): void {
            if (dou2d.asset.hasRes(source)) {
                dou2d.asset.loadRes(source, 0, callBack, thisObject);
            }
            else {
                dou.loader.load(source, callBack, thisObject);
            }
        }
    }
}

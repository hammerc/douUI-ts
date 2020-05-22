namespace douUI {
    /**
     * 默认的资源加载实现
     * @author wizardc
     */
    export class DefaultAssetAdapter implements IAssetAdapter {
        public getAsset(source: string, callBack: (content: any, source: string) => void, thisObject: any): void {
            dou.loader.load(source, callBack, thisObject);
        }
    }
}

namespace douUI {
    /**
     * 资源加载接口
     * @author wizardc
     */
    export interface IAssetAdapter {
        getAsset(source: string, callBack: (content: any, source: string) => void, thisObject?: any): void;
    }
}

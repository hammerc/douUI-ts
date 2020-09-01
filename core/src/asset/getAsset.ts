namespace douUI {
    /**
     * 获取资源
     */
    export function getAsset(source: string, callBack: (content: any, source: string) => void, thisObject?: any): void {
        let assetAdapter = dou2d.getImplementation("AssetAdapter") as IAssetAdapter;
        assetAdapter.getAsset(source, callBack, thisObject);
    }

    dou2d.registerImplementation("AssetAdapter", new DefaultAssetAdapter());
}

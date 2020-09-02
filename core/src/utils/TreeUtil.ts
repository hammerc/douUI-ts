namespace douUI {
    /**
     * 树形组件工具类
     * @author wizardc
     */
    export namespace TreeUtil {
        /**
         * 获取树组件数据源
         * @param source 如果有子项需要有 children 字段来表示
         */
        export function getTree(source: any): ITreeDataCollection {
            if (!source) {
                return undefined;
            }
            let result: any = {};
            setChildren(source, 0, result);
            return result;
        }

        function setChildren(source: any, depth: number, target: any, parent?: ITreeDataCollection): void {
            target.depth = depth;
            target.data = source;
            target.parent = parent;
            target.expand = false;
            let children = source.children;
            if (children && Array.isArray(children) && children.length > 0) {
                target.children = [];
                for (let item of children) {
                    let newItem = {};
                    setChildren(item, depth + 1, newItem, target);
                    target.children.push(newItem);
                }
            }
        }

        export function forEach(treeData: ITreeDataCollection, ignoreClose: boolean, callback: (value: ITreeDataCollection) => void, thisObj?: any): void {
            callback.call(thisObj, treeData);
            let children = treeData.children;
            if (children && children.length > 0 && (!ignoreClose || treeData.expand)) {
                for (let child of children) {
                    forEach(child, ignoreClose, callback, thisObj);
                }
            }
        }

        export function getTreeData(source: ITreeDataCollection, data: any): ITreeDataCollection {
            let result: ITreeDataCollection;
            TreeUtil.forEach(source, false, (treeData) => {
                if (treeData.data === data) {
                    result = treeData;
                }
            });
            return result;
        }

        export function expand(target: ITreeDataCollection): void {
            target.expand = true;
            while (target.parent) {
                target = target.parent;
                target.expand = true;
            }
        }
    }
}

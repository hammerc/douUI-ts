# douUI-ts
基于 dou2d 的 UI 框架

逗UI，基于 dou2d 引擎上提供 2D 相关的 UI 实现。

*注：目前不提供相关的 UI 编辑器，需手动通过代码编辑 UI 界面，示例项目提供常见组件的皮肤实现。*

---

## 开始上手

1. 在编写代码之前请引入位于**core/dest**文件夹中的所有文件，同时需要引入**dou2d**和**doucore**项目下的**core/dest**文件夹中的所有文件：

```html
<script type="text/javascript" src="examples/lib/dou.js"></script>
<script type="text/javascript" src="examples/lib/dou2d.js"></script>
<script type="text/javascript" src="examples/lib/douUI.js"></script>
```

2. 可以采用**dou2d**中提供的**AssetDepot**工具打包资源：

```
node ./../../dou2d-ts/tools/AssetDepot/bin/Main.js depot resource resource/res.json
```

3. 编写根 UI 容器类并加载资源配置文件：

```javascript
class UIApp extends Dou.UILayer {
    constructor() {
        super();
        this.once(Dou.Event2D.ADDED_TO_STAGE, this.onAdded, this);
    }
    async onAdded(event: Dou.Event2D): Promise<void> {
        await Dou.asset.loadConfigAsync("resource/res.json", "resource/");
        // 具体的实现代码
    }
}
```

4. 编写皮肤类并注册：

```javascript
Dou.Theme.registerDefaultSkin(Dou.Button, skin.ButtonSkin);
```

## 引擎示例

* [按钮测试](https://hammerc.github.io/douUI-ts/examples/index.html?demo=ButtonTest)

* [容器测试](https://hammerc.github.io/douUI-ts/examples/index.html?demo=GroupTest)

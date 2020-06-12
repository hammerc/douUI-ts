namespace douUI.core {
    const validator = new Validator();
    const tempMatrix: dou2d.Matrix = new dou2d.Matrix();

    /**
     * UI 组件实现类
     * @author wizardc
     */
    export class UIComponentImpl extends dou2d.DisplayObject implements IUIComponent {
        /**
         * 父类引用
         */
        public $super: any;

        /**
         * 属性集合
         */
        public $UIComponent: Object;

        /**
         * 是否包含在父容器的布局中
         */
        public $includeInLayout: boolean;

        public constructor() {
            super();
            this.initializeUIValues();
        }

        /**
         * 组件宽度
         * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
         */
        public $setWidth(value: number): boolean {
            value = +value;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.width] === value && values[UIKeys.explicitWidth] === value) {
                return false;
            }
            values[UIKeys.explicitWidth] = value;
            if (isNaN(value)) {
                this.invalidateSize();
            }
            this.invalidateProperties();
            this.invalidateDisplayList();
            this.invalidateParentLayout();
            return true;
        }
        public $getWidth(): number {
            this.validateSizeNow();
            return this.$UIComponent[UIKeys.width];
        }

        /**
         * 组件高度
         * * 默认值为 NaN, 设置为 NaN 将使用组件的 measure() 方法自动计算尺寸
         */
        public $setHeight(value: number): boolean {
            value = +value;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.height] === value && values[UIKeys.explicitHeight] === value) {
                return false;
            }
            values[UIKeys.explicitHeight] = value;
            if (isNaN(value)) {
                this.invalidateSize();
            }
            this.invalidateProperties();
            this.invalidateDisplayList();
            this.invalidateParentLayout();
            return true;
        }
        public $getHeight(): number {
            this.validateSizeNow();
            return this.$UIComponent[UIKeys.height];
        }

        /**
         * 距父级容器离左边距离
         */
        public set left(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.left] === value) {
                return;
            }
            values[UIKeys.left] = value;
            this.invalidateParentLayout();
        }
        public get left(): any {
            return this.$UIComponent[UIKeys.left];
        }

        /**
         * 距父级容器右边距离
         */
        public set right(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.right] === value) {
                return;
            }
            values[UIKeys.right] = value;
            this.invalidateParentLayout();
        }
        public get right(): any {
            return this.$UIComponent[UIKeys.right];
        }

        /**
         * 距父级容器顶部距离
         */
        public set top(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.top] === value) {
                return;
            }
            values[UIKeys.top] = value;
            this.invalidateParentLayout();
        }
        public get top(): any {
            return this.$UIComponent[UIKeys.top];
        }

        /**
         * 距父级容器底部距离
         */
        public set bottom(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.bottom] == value) {
                return;
            }
            values[UIKeys.bottom] = value;
            this.invalidateParentLayout();
        }
        public get bottom(): any {
            return this.$UIComponent[UIKeys.bottom];
        }

        /**
         * 在父级容器中距水平中心位置的距离
         */
        public set horizontalCenter(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.horizontalCenter] === value) {
                return;
            }
            values[UIKeys.horizontalCenter] = value;
            this.invalidateParentLayout();
        }
        public get horizontalCenter(): any {
            return this.$UIComponent[UIKeys.horizontalCenter];
        }

        /**
         * 在父级容器中距竖直中心位置的距离
         */
        public set verticalCenter(value: any) {
            if (!value || typeof value == "number") {
                value = +value;
            }
            else {
                value = value.toString().trim();
            }
            let values = this.$UIComponent;
            if (values[UIKeys.verticalCenter] === value) {
                return;
            }
            values[UIKeys.verticalCenter] = value;
            this.invalidateParentLayout();
        }
        public get verticalCenter(): any {
            return this.$UIComponent[UIKeys.verticalCenter];
        }

        /**
         * 相对父级容器宽度的百分比
         */
        public set percentWidth(value: number) {
            value = +value;
            let values = this.$UIComponent;
            if (values[UIKeys.percentWidth] === value) {
                return;
            }
            values[UIKeys.percentWidth] = value;
            this.invalidateParentLayout();
        }
        public get percentWidth(): number {
            return this.$UIComponent[UIKeys.percentWidth];
        }

        /**
         * 相对父级容器高度的百分比
         */
        public set percentHeight(value: number) {
            value = +value;
            let values = this.$UIComponent;
            if (values[UIKeys.percentHeight] === value) {
                return;
            }
            values[UIKeys.percentHeight] = value;
            this.invalidateParentLayout();
        }
        public get percentHeight(): number {
            return this.$UIComponent[UIKeys.percentHeight];
        }

        /**
         * 外部显式指定的宽度
         */
        public get explicitWidth(): number {
            return this.$UIComponent[UIKeys.explicitWidth];
        }

        /**
         * 外部显式指定的高度
         */
        public get explicitHeight(): number {
            return this.$UIComponent[UIKeys.explicitHeight];
        }

        /**
         * 组件的最小宽度, 此属性设置为大于 maxWidth 的值时无效, 同时影响测量和自动布局的尺寸
         */
        public set minWidth(value: number) {
            value = +value || 0;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.minWidth] === value) {
                return;
            }
            values[UIKeys.minWidth] = value;
            this.invalidateSize();
            this.invalidateParentLayout();
        }
        public get minWidth(): number {
            return this.$UIComponent[UIKeys.minWidth];
        }

        /**
         * 组件的最大高度, 同时影响测量和自动布局的尺寸
         */
        public set maxWidth(value: number) {
            value = +value || 0;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.maxWidth] === value) {
                return;
            }
            values[UIKeys.maxWidth] = value;
            this.invalidateSize();
            this.invalidateParentLayout();
        }
        public get maxWidth(): number {
            return this.$UIComponent[UIKeys.maxWidth];
        }

        /**
         * 组件的最小高度, 此属性设置为大于maxHeight的值时无效, 同时影响测量和自动布局的尺寸
         */
        public set minHeight(value: number) {
            value = +value || 0;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.minHeight] === value) {
                return;
            }
            values[UIKeys.minHeight] = value;
            this.invalidateSize();
            this.invalidateParentLayout();
        }
        public get minHeight(): number {
            return this.$UIComponent[UIKeys.minHeight];
        }

        /**
         * 组件的最大高度, 同时影响测量和自动布局的尺寸
         */
        public set maxHeight(value: number) {
            value = +value || 0;
            let values = this.$UIComponent;
            if (value < 0 || values[UIKeys.maxHeight] === value) {
                return;
            }
            values[UIKeys.maxHeight] = value;
            this.invalidateSize();
            this.invalidateParentLayout();
        }
        public get maxHeight(): number {
            return this.$UIComponent[UIKeys.maxHeight];
        }

        /**
         * UIComponentImpl 定义的所有变量请不要添加任何初始值, 必须统一在此处初始化
         */
        private initializeUIValues(): void {
            this.$UIComponent = {
                0: NaN,             //left
                1: NaN,             //right
                2: NaN,             //top
                3: NaN,             //bottom
                4: NaN,             //horizontalCenter
                5: NaN,             //verticalCenter
                6: NaN,             //percentWidth
                7: NaN,             //percentHeight
                8: NaN,             //explicitWidth
                9: NaN,             //explicitHeight
                10: 0,              //width
                11: 0,              //height
                12: 0,              //minWidth
                13: 100000,         //maxWidth
                14: 0,              //minHeight
                15: 100000,         //maxHeight
                16: 0,              //measuredWidth
                17: 0,              //measuredHeight
                18: NaN,            //oldPreferWidth
                19: NaN,            //oldPreferHeight
                20: 0,              //oldX
                21: 0,              //oldY
                22: 0,              //oldWidth
                23: 0,              //oldHeight
                24: true,           //invalidatePropertiesFlag
                25: true,           //invalidateSizeFlag
                26: true,           //invalidateDisplayListFlag
                27: false,          //layoutWidthExplicitlySet
                28: false,          //layoutHeightExplicitlySet
                29: false,          //initialized
            };
            this.$includeInLayout = true;
            this._touchEnabled = true;
        }

        /**
         * 子类覆盖此方法可以执行一些初始化子项操作, 此方法仅在组件第一次添加到舞台时回调一次
         */
        protected createChildren(): void {
        }

        /**
         * 子项创建完成, 此方法在 createChildren() 之后执行
         */
        protected childrenCreated(): void {
        }

        /**
         * 提交属性, 子类在调用完 invalidateProperties() 方法后, 应覆盖此方法以应用属性
         */
        protected commitProperties(): void {
            let values = this.$UIComponent;
            if (values[UIKeys.oldWidth] != values[UIKeys.width] || values[UIKeys.oldHeight] != values[UIKeys.height]) {
                this.dispatchUIEvent(UIEvent.RESIZE);
                values[UIKeys.oldWidth] = values[UIKeys.width];
                values[UIKeys.oldHeight] = values[UIKeys.height];
            }
            if (values[UIKeys.oldX] != this.$getX() || values[UIKeys.oldY] != this.$getY()) {
                this.dispatchUIEvent(UIEvent.MOVE);
                values[UIKeys.oldX] = this.$getX();
                values[UIKeys.oldY] = this.$getY();
            }
        }

        /**
         * 测量组件尺寸
         */
        protected measure(): void {
        }

        /**
         * 更新显示列表
         */
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
        }

        /**
         * 指定此组件是否包含在父容器的布局中, 若为 false, 则父级容器在测量和布局阶段都忽略此组件, 默认值为 true
         * * 注意: visible 属性与此属性不同, 设置 visible 为 false, 父级容器仍会对其布局
         */
        public set includeInLayout(value: boolean) {
            value = !!value;
            if (this.$includeInLayout === value) {
                return;
            }
            this.$includeInLayout = true;
            this.invalidateParentLayout();
            this.$includeInLayout = value;
        }
        public get includeInLayout(): boolean {
            return this.$includeInLayout;
        }

        public $onAddToStage(stage: dou2d.Stage, nestLevel: number): void {
            this.$super.$onAddToStage.call(this, stage, nestLevel);
            this.checkInvalidateFlag();
            let values = this.$UIComponent;
            if (!values[UIKeys.initialized]) {
                values[UIKeys.initialized] = true;
                this.createChildren();
                this.childrenCreated();
                this.dispatchUIEvent(UIEvent.CREATION_COMPLETE);
            }
        }

        /**
         * 检查属性失效标记并应用
         */
        private checkInvalidateFlag(event?: Event): void {
            let values = this.$UIComponent;
            if (values[UIKeys.invalidatePropertiesFlag]) {
                validator.invalidateProperties(this);
            }
            if (values[UIKeys.invalidateSizeFlag]) {
                validator.invalidateSize(this);
            }
            if (values[UIKeys.invalidateDisplayListFlag]) {
                validator.invalidateDisplayList(this);
            }
        }

        /**
         * 立即验证自身的尺寸
         */
        private validateSizeNow(): void {
            this.validateSize(true);
            this.updateFinalSize();
        }

        /**
         * 设置测量结果
         * @param width 测量宽度
         * @param height 测量高度
         */
        public setMeasuredSize(width: number, height: number): void {
            let values = this.$UIComponent;
            values[UIKeys.measuredWidth] = Math.ceil(+width || 0);
            values[UIKeys.measuredHeight] = Math.ceil(+height || 0);
        }

        /**
         * 设置组件的宽高
         * * 此方法不同于直接设置 width, height 属性, 不会影响显式标记尺寸属性
         */
        private setActualSize(w: number, h: number): void {
            let change = false;
            let values = this.$UIComponent;
            if (values[UIKeys.width] !== w) {
                values[UIKeys.width] = w;
                change = true;
            }
            if (values[UIKeys.height] !== h) {
                values[UIKeys.height] = h;
                change = true;
            }
            if (change) {
                this.invalidateDisplayList();
                this.dispatchUIEvent(UIEvent.RESIZE);
            }
        }

        protected $updateUseTransform(): void {
            this.$super.$updateUseTransform.call(this);
            this.invalidateParentLayout();
        }

        public $setMatrix(matrix: dou2d.Matrix, needUpdateProperties: boolean = true): boolean {
            this.$super.$setMatrix.call(this, matrix, needUpdateProperties);
            this.invalidateParentLayout();
            return true;
        }

        public $setAnchorOffsetX(value: number): boolean {
            this.$super.$setAnchorOffsetX.call(this, value);
            this.invalidateParentLayout();
            return true;
        }

        public $setAnchorOffsetY(value: number): boolean {
            this.$super.$setAnchorOffsetY.call(this, value);
            this.invalidateParentLayout();
            return true;
        }

        public $setX(value: number): boolean {
            let change = this.$super.$setX.call(this, value);
            if (change) {
                this.invalidateParentLayout();
                this.invalidateProperties();
            }
            return change;
        }

        public $setY(value: number): boolean {
            let change = this.$super.$setY.call(this, value);
            if (change) {
                this.invalidateParentLayout();
                this.invalidateProperties();
            }
            return change;
        }

        /**
         * 标记属性失效
         */
        public invalidateProperties(): void {
            let values = this.$UIComponent;
            if (!values[UIKeys.invalidatePropertiesFlag]) {
                values[UIKeys.invalidatePropertiesFlag] = true;
                if (this._stage) {
                    validator.invalidateProperties(this);
                }
            }
        }

        /**
         * 验证组件的属性
         */
        public validateProperties(): void {
            let values = this.$UIComponent;
            if (values[UIKeys.invalidatePropertiesFlag]) {
                this.commitProperties();
                values[UIKeys.invalidatePropertiesFlag] = false;
            }
        }

        /**
         * 标记提交过需要验证组件尺寸
         */
        public invalidateSize(): void {
            let values = this.$UIComponent;
            if (!values[UIKeys.invalidateSizeFlag]) {
                values[UIKeys.invalidateSizeFlag] = true;
                if (this._stage) {
                    validator.invalidateSize(this);
                }
            }
        }

        /**
         * 验证组件的尺寸
         */
        public validateSize(recursive?: boolean): void {
            if (recursive) {
                let children = this.$children;
                if (children) {
                    let length = children.length;
                    for (let i = 0; i < length; i++) {
                        let child = children[i];
                        if ("validateSize" in child) {
                            (<IUIComponent>child).validateSize(true);
                        }
                    }
                }
            }
            let values = this.$UIComponent;
            if (values[UIKeys.invalidateSizeFlag]) {
                let changed = this.measureSizes();
                if (changed) {
                    this.invalidateDisplayList();
                    this.invalidateParentLayout();
                }
                values[UIKeys.invalidateSizeFlag] = false;
            }
        }

        /**
         * 测量组件尺寸, 返回尺寸是否发生变化
         */
        private measureSizes(): boolean {
            let changed = false;
            let values = this.$UIComponent;
            if (!values[UIKeys.invalidateSizeFlag]) {
                return changed;
            }
            if (isNaN(values[UIKeys.explicitWidth]) || isNaN(values[UIKeys.explicitHeight])) {
                this.measure();
                if (values[UIKeys.measuredWidth] < values[UIKeys.minWidth]) {
                    values[UIKeys.measuredWidth] = values[UIKeys.minWidth];
                }
                if (values[UIKeys.measuredWidth] > values[UIKeys.maxWidth]) {
                    values[UIKeys.measuredWidth] = values[UIKeys.maxWidth];
                }
                if (values[UIKeys.measuredHeight] < values[UIKeys.minHeight]) {
                    values[UIKeys.measuredHeight] = values[UIKeys.minHeight];
                }
                if (values[UIKeys.measuredHeight] > values[UIKeys.maxHeight]) {
                    values[UIKeys.measuredHeight] = values[UIKeys.maxHeight];
                }
            }
            let preferredW = this.getPreferredUWidth();
            let preferredH = this.getPreferredUHeight();
            if (preferredW !== values[UIKeys.oldPreferWidth] || preferredH !== values[UIKeys.oldPreferHeight]) {
                values[UIKeys.oldPreferWidth] = preferredW;
                values[UIKeys.oldPreferHeight] = preferredH;
                changed = true;
            }
            return changed;
        }

        /**
         * 标记需要验证显示列表
         */
        public invalidateDisplayList(): void {
            let values = this.$UIComponent;
            if (!values[UIKeys.invalidateDisplayListFlag]) {
                values[UIKeys.invalidateDisplayListFlag] = true;
                if (this._stage) {
                    validator.invalidateDisplayList(this);
                }
            }
        }

        /**
         * 验证子项的位置和大小, 并绘制其他可视内容
         */
        public validateDisplayList(): void {
            let values = this.$UIComponent;
            if (values[UIKeys.invalidateDisplayListFlag]) {
                this.updateFinalSize();
                this.updateDisplayList(values[UIKeys.width], values[UIKeys.height]);
                values[UIKeys.invalidateDisplayListFlag] = false;
            }
        }

        /**
         * 更新最终的组件宽高
         */
        private updateFinalSize(): void {
            let unscaledWidth = 0;
            let unscaledHeight = 0;
            let values = this.$UIComponent;
            if (values[UIKeys.layoutWidthExplicitlySet]) {
                unscaledWidth = values[UIKeys.width];
            }
            else if (!isNaN(values[UIKeys.explicitWidth])) {
                unscaledWidth = values[UIKeys.explicitWidth];
            }
            else {
                unscaledWidth = values[UIKeys.measuredWidth];
            }
            if (values[UIKeys.layoutHeightExplicitlySet]) {
                unscaledHeight = values[UIKeys.height];
            }
            else if (!isNaN(values[UIKeys.explicitHeight])) {
                unscaledHeight = values[UIKeys.explicitHeight];
            }
            else {
                unscaledHeight = values[UIKeys.measuredHeight];
            }
            this.setActualSize(unscaledWidth, unscaledHeight);
        }

        /**
         * 立即应用组件及其子项的所有属性
         */
        public validateNow(): void {
            if (this._stage) {
                validator.validateClient(this);
            }
        }

        /**
         * 标记父级容器的尺寸和显示列表为失效
         */
        protected invalidateParentLayout(): void {
            let parent = this._parent;
            if (!parent || !this.$includeInLayout || !("invalidateSize" in parent && "invalidateDisplayList" in parent)) {
                return;
            }
            (<IUIComponent><any>parent).invalidateSize();
            (<IUIComponent><any>parent).invalidateDisplayList();
        }

        /**
         * 设置组件的布局宽高
         */
        public setLayoutBoundsSize(layoutWidth: number, layoutHeight: number): void {
            layoutHeight = +layoutHeight;
            layoutWidth = +layoutWidth;
            if (layoutHeight < 0 || layoutWidth < 0) {
                return;
            }
            let values = this.$UIComponent;
            let maxWidth = values[UIKeys.maxWidth];
            let maxHeight = values[UIKeys.maxHeight];
            let minWidth = Math.min(values[UIKeys.minWidth], maxWidth);
            let minHeight = Math.min(values[UIKeys.minHeight], maxHeight);
            let width: number;
            let height: number;
            if (isNaN(layoutWidth)) {
                values[UIKeys.layoutWidthExplicitlySet] = false;
                width = this.getPreferredUWidth();
            }
            else {
                values[UIKeys.layoutWidthExplicitlySet] = true;
                width = Math.max(minWidth, Math.min(maxWidth, layoutWidth));
            }
            if (isNaN(layoutHeight)) {
                values[UIKeys.layoutHeightExplicitlySet] = false;
                height = this.getPreferredUHeight();
            }
            else {
                values[UIKeys.layoutHeightExplicitlySet] = true;
                height = Math.max(minHeight, Math.min(maxHeight, layoutHeight));
            }
            let matrix = this.getAnchorMatrix();
            if (MatrixUtil.isDeltaIdentity(matrix)) {
                this.setActualSize(width, height);
                return;
            }
            let fitSize = MatrixUtil.fitBounds(layoutWidth, layoutHeight, matrix, values[UIKeys.explicitWidth], values[UIKeys.explicitHeight], this.getPreferredUWidth(), this.getPreferredUHeight(), minWidth, minHeight, maxWidth, maxHeight);
            if (!fitSize) {
                fitSize = dou.recyclable(dou2d.Point);
                fitSize.set(minWidth, minHeight);
            }
            this.setActualSize(fitSize.x, fitSize.y);
            fitSize.recycle();
        }

        /**
         * 设置组件的布局位置
         */
        public setLayoutBoundsPosition(x: number, y: number): void {
            let matrix = this.$getMatrix();
            if (!MatrixUtil.isDeltaIdentity(matrix) || this.anchorOffsetX != 0 || this.anchorOffsetY != 0) {
                let bounds = dou.recyclable(dou2d.Rectangle);
                this.getLayoutBounds(bounds);
                x += this.$getX() - bounds.x;
                y += this.$getY() - bounds.y;
                bounds.recycle();
            }
            let changed: boolean = this.$super.$setX.call(this, x);
            if (this.$super.$setY.call(this, y) || changed) {
                this.dispatchUIEvent(UIEvent.MOVE);
            }
        }

        /**
         * 组件的布局尺寸, 常用于父级的 updateDisplayList() 方法中
         * * 按照: 布局尺寸 -> 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
         */
        public getLayoutBounds(bounds: dou2d.Rectangle): void {
            let values = this.$UIComponent;
            let w: number;
            if (values[UIKeys.layoutWidthExplicitlySet]) {
                w = values[UIKeys.width];
            }
            else if (!isNaN(values[UIKeys.explicitWidth])) {
                w = values[UIKeys.explicitWidth];
            }
            else {
                w = values[UIKeys.measuredWidth];
            }
            let h: number;
            if (values[UIKeys.layoutHeightExplicitlySet]) {
                h = values[UIKeys.height];
            }
            else if (!isNaN(values[UIKeys.explicitHeight])) {
                h = values[UIKeys.explicitHeight];
            }
            else {
                h = values[UIKeys.measuredHeight];
            }
            this.applyMatrix(bounds, w, h);
        }

        private getPreferredUWidth(): number {
            let values = this.$UIComponent;
            return isNaN(values[UIKeys.explicitWidth]) ? values[UIKeys.measuredWidth] : values[UIKeys.explicitWidth];
        }

        private getPreferredUHeight(): number {
            let values = this.$UIComponent;
            return isNaN(values[UIKeys.explicitHeight]) ? values[UIKeys.measuredHeight] : values[UIKeys.explicitHeight];
        }

        /**
         * 获取组件的首选尺寸, 常用于父级的 measure() 方法中
         * 按照: 外部显式设置尺寸 -> 测量尺寸 的优先级顺序返回尺寸, 注意此方法返回值已经包含 scale 和 rotation
         */
        public getPreferredBounds(bounds: dou2d.Rectangle): void {
            let w = this.getPreferredUWidth();
            let h = this.getPreferredUHeight();
            this.applyMatrix(bounds, w, h);
        }

        private applyMatrix(bounds: dou2d.Rectangle, w: number, h: number): void {
            bounds.set(0, 0, w, h);
            let matrix = this.getAnchorMatrix();
            if (MatrixUtil.isDeltaIdentity(matrix)) {
                bounds.x += matrix.tx;
                bounds.y += matrix.ty;
            }
            else {
                matrix.transformBounds(bounds);
            }
        }

        private getAnchorMatrix(): dou2d.Matrix {
            let matrix = this.$getMatrix();
            let offsetX = this.anchorOffsetX;
            let offsetY = this.anchorOffsetY;
            if (offsetX != 0 || offsetY != 0) {
                let tempM = tempMatrix;
                tempM.set(1, 0, 0, 1, -offsetX, -offsetY);
                tempM.premultiply(matrix);
                return tempM;
            }
            return matrix;
        }
    }
}

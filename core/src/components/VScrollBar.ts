namespace douUI {
    /**
     * 垂直滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    export class VScrollBar extends ScrollBarBase {
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let thumb = this.thumb;
            let viewport = this._viewport;
            if (!thumb || !viewport) {
                return;
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            thumb.getPreferredBounds(bounds);
            let thumbHeight = bounds.height;
            let thumbX = bounds.x;
            bounds.recycle();
            let vsp = viewport.scrollV;
            let contentHeight = viewport.contentHeight;
            let height = viewport.height;
            if (vsp <= 0) {
                let scaleHeight = thumbHeight * (1 - (-vsp) / (height * 0.5));
                scaleHeight = Math.max(5, Math.round(scaleHeight));
                thumb.setLayoutBoundsSize(NaN, scaleHeight);
                thumb.setLayoutBoundsPosition(thumbX, 0);
            }
            else if (vsp >= contentHeight - height) {
                let scaleHeight = thumbHeight * (1 - (vsp - contentHeight + height) / (height * 0.5));
                scaleHeight = Math.max(5, Math.round(scaleHeight));
                thumb.setLayoutBoundsSize(NaN, scaleHeight);
                thumb.setLayoutBoundsPosition(thumbX, unscaledHeight - scaleHeight);
            }
            else {
                let thumbY = (unscaledHeight - thumbHeight) * vsp / (contentHeight - height);
                thumb.setLayoutBoundsSize(NaN, NaN);
                thumb.setLayoutBoundsPosition(thumbX, thumbY);
            }
        }

        protected onPropertyChanged(event: dou.Event): void {
            switch (event.data) {
                case "scrollV":
                case "contentHeight":
                    this.invalidateDisplayList();
                    break;
            }
        }
    }
}

namespace douUI {
    /**
     * 水平滚动条
     * * 皮肤必须子项: "thumb"
     * * 皮肤可选子项: 无
     * @author wizardc
     */
    export class HScrollBar extends ScrollBarBase {
        protected updateDisplayList(unscaledWidth: number, unscaledHeight: number): void {
            super.updateDisplayList(unscaledWidth, unscaledHeight);
            let thumb = this.thumb;
            let viewport = this._viewport;
            if (!thumb || !viewport) {
                return;
            }
            let bounds = dou.recyclable(dou2d.Rectangle);
            thumb.getPreferredBounds(bounds);
            let thumbWidth = bounds.width;
            let thumbY = bounds.y;
            bounds.recycle();
            let hsp = viewport.scrollH;
            let contentWidth = viewport.contentWidth;
            let width = viewport.width;
            if (hsp <= 0) {
                let scaleWidth = thumbWidth * (1 - (-hsp) / (width * 0.5));
                scaleWidth = Math.max(5, Math.round(scaleWidth));
                thumb.setLayoutBoundsSize(scaleWidth, NaN);
                thumb.setLayoutBoundsPosition(0, thumbY);
            }
            else if (hsp >= contentWidth - width) {
                let scaleWidth = thumbWidth * (1 - (hsp - contentWidth + width) / (width * 0.5));
                scaleWidth = Math.max(5, Math.round(scaleWidth));
                thumb.setLayoutBoundsSize(scaleWidth, NaN);
                thumb.setLayoutBoundsPosition(unscaledWidth - scaleWidth, thumbY);
            }
            else {
                let thumbX = (unscaledWidth - thumbWidth) * hsp / (contentWidth - width);
                thumb.setLayoutBoundsSize(NaN, NaN);
                thumb.setLayoutBoundsPosition(thumbX, thumbY);
            }
        }

        protected onPropertyChanged(event: dou.Event): void {
            switch (event.data) {
                case "scrollH":
                case "contentWidth":
                    this.invalidateDisplayList();
                    break;
            }
        }
    }
}

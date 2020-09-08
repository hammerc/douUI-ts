namespace douUI {
    /**
     * 水平滑块
     * * 皮肤必须子项: "track", "thumb"
     * * 皮肤可选子项: "trackHighlight"
     * @author wizardc
     */
    export class HSlider extends SliderBase {
        protected pointToValue(x: number, y: number): number {
            if (!this.thumb || !this.track) {
                return 0;
            }
            let values = this.$Range;
            let range = values[sys.RangeKeys.maximum] - values[sys.RangeKeys.minimum];
            let thumbRange = this.getThumbRange();
            return values[sys.RangeKeys.minimum] + (thumbRange != 0 ? (x / thumbRange) * range : 0);
        }

        private getThumbRange(): number {
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.track.getLayoutBounds(bounds);
            let thumbRange = bounds.width;
            this.thumb.getLayoutBounds(bounds);
            thumbRange -= bounds.width;
            bounds.recycle();
            return thumbRange;
        }

        protected updateSkinDisplayList(): void {
            if (!this.thumb || !this.track) {
                return;
            }
            let values = this.$Range;
            let thumbRange = this.getThumbRange();
            let range = values[sys.RangeKeys.maximum] - values[sys.RangeKeys.minimum];
            let thumbPosTrackX = (range > 0) ? ((this.pendingValue - values[sys.RangeKeys.minimum]) / range) * thumbRange : 0;
            let point = dou.recyclable(dou2d.Point);
            let thumbPos = this.track.localToGlobal(thumbPosTrackX, 0, point);
            let thumbPosX = thumbPos.x;
            let thumbPosY = thumbPos.y;
            let thumbPosParentX = this.thumb.parent.globalToLocal(thumbPosX, thumbPosY, point).x;
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.thumb.getLayoutBounds(bounds);
            this.thumb.setLayoutBoundsPosition(Math.round(thumbPosParentX), bounds.y);
            bounds.recycle();
            if (this.trackHighlight && this.trackHighlight.parent) {
                let trackHighlightX = this.trackHighlight.parent.globalToLocal(thumbPosX, thumbPosY, point).x - thumbPosTrackX;
                this.trackHighlight.x = Math.round(trackHighlightX);
                this.trackHighlight.width = Math.round(thumbPosTrackX);
            }
            point.recycle();
        }
    }
}

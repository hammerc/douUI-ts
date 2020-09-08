namespace douUI {
    /**
     * 垂直滑块
     * * 皮肤必须子项: "track", "thumb"
     * * 皮肤可选子项: "trackHighlight"
     * @author wizardc
     */
    export class VSlider extends SliderBase {
        protected pointToValue(x: number, y: number): number {
            if (!this.thumb || !this.track) {
                return 0;
            }
            let values = this.$Range;
            let range = values[sys.RangeKeys.maximum] - values[sys.RangeKeys.minimum];
            let thumbRange = this.getThumbRange();
            return values[sys.RangeKeys.minimum] + ((thumbRange != 0) ? ((thumbRange - y) / thumbRange) * range : 0);
        }

        private getThumbRange(): number {
            let bounds = dou.recyclable(dou2d.Rectangle);
            this.track.getLayoutBounds(bounds);
            let thumbRange = bounds.height;
            this.thumb.getLayoutBounds(bounds);
            thumbRange -= bounds.height;
            bounds.recycle();
            return thumbRange;
        }

        public updateSkinDisplayList(): void {
            if (!this.thumb || !this.track) {
                return;
            }
            let values = this.$Range
            let thumbRange = this.getThumbRange();
            let range = values[sys.RangeKeys.maximum] - values[sys.RangeKeys.minimum];
            let thumbPosTrackY: number = (range > 0) ? thumbRange - (((this.pendingValue - values[sys.RangeKeys.minimum]) / range) * thumbRange) : 0;
            let point = dou.recyclable(dou2d.Point);
            let thumbPos = this.track.localToGlobal(0, thumbPosTrackY, point);
            let thumbPosX = thumbPos.x;
            let thumbPosY = thumbPos.y;
            let thumbPosParentY = this.thumb.parent.globalToLocal(thumbPosX, thumbPosY, point).y;
            let bounds = dou.recyclable(dou2d.Rectangle);
            let thumbHeight = bounds.height;
            this.thumb.getLayoutBounds(bounds);
            this.thumb.setLayoutBoundsPosition(bounds.x, Math.round(thumbPosParentY));
            bounds.recycle();
            if (this.trackHighlight) {
                let trackHighlightY = this.trackHighlight.parent.globalToLocal(thumbPosX, thumbPosY, point).y;
                this.trackHighlight.y = Math.round(trackHighlightY + thumbHeight);
                this.trackHighlight.height = Math.round(thumbRange - trackHighlightY);
            }
            point.recycle();
        }
    }
}

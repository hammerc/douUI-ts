namespace douUI.sys {
    export const enum UIKeys {
        left,
        right,
        top,
        bottom,
        horizontalCenter,
        verticalCenter,
        percentWidth,
        percentHeight,
        explicitWidth,
        explicitHeight,
        width,
        height,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        measuredWidth,
        measuredHeight,
        oldPreferWidth,
        oldPreferHeight,
        oldX,
        oldY,
        oldWidth,
        oldHeight,
        invalidatePropertiesFlag,
        invalidateSizeFlag,
        invalidateDisplayListFlag,
        layoutWidthExplicitlySet,
        layoutHeightExplicitlySet,
        initialized
    }

    export const enum ComponentKeys {
        enabled,
        explicitTouchChildren,
        explicitTouchEnabled,
        skin,
        skinName,
        state,
        stateIsDirty
    }

    export const enum GroupKeys {
        contentWidth,
        contentHeight,
        scrollH,
        scrollV,
        scrollEnabled,
        touchThrough
    }
}

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
        explicitState,
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

    export const enum EditableTextKeys {
        promptText,
        textColorUser,
        asPassword
    }

    export const enum RangeKeys {
        maximum,
        maxChanged,
        minimum,
        minChanged,
        value,
        changedValue,
        valueChanged,
        snapInterval,
        snapIntervalChanged,
        explicitSnapInterval
    }

    export const enum SliderKeys {
        clickOffsetX,
        clickOffsetY,
        moveStageX,
        moveStageY,
        touchDownTarget,
        pendingValue,
        slideToValue,
        liveDragging
    }

    export const enum ScrollerKeys {
        scrollPolicyV,
        scrollPolicyH,
        autoHideTimer,
        touchStartX,
        touchStartY,
        touchMoved,
        horizontalCanScroll,
        verticalCanScroll,
        touchScrollH,
        touchScrollV,
        viewport,
        viewprotRemovedEvent
    }

    export const enum DataGroupKeys {
        useVirtualLayout,
        useVirtualLayoutChanged,
        rendererToClassMap,
        freeRenderers,
        createNewRendererFlag,
        itemRendererChanged,
        itemRenderer,
        typicalItemChanged,
        typicalLayoutRect,
        cleanFreeRenderer,
        renderersBeingUpdated,
        typicalItem
    }

    export const enum ListBaseKeys {
        requireSelection,
        requireSelectionChanged,
        proposedSelectedIndex,
        selectedIndex,
        dispatchChangeAfterSelection,
        pendingSelectedItem,
        selectedIndexAdjusted,
        touchDownItemRenderer,
        touchCancle
    }
}

(function (Dou) {

    Dou.sys = Dou.sys || {};

    Dou.DefaultAssetAdapter = douUI.DefaultAssetAdapter;
    Dou.getAsset = douUI.getAsset;

    Dou.ArrayCollection = douUI.ArrayCollection;

    Dou.sys.Animation = douUI.sys.Animation;
    Dou.ListBase = douUI.ListBase;
    Dou.Range = douUI.Range;
    Dou.ScrollBarBase = douUI.ScrollBarBase;
    Dou.SliderBase = douUI.SliderBase;
    Dou.sys.TouchScroll = douUI.sys.TouchScroll;

    Dou.BitmapLabel = douUI.BitmapLabel;
    Dou.Button = douUI.Button;
    Dou.CheckBox = douUI.CheckBox;
    Dou.Component = douUI.Component;
    Dou.DataGroup = douUI.DataGroup;
    Dou.EditableText = douUI.EditableText;
    Dou.Group = douUI.Group;
    Dou.HScrollBar = douUI.HScrollBar;
    Dou.HSlider = douUI.HSlider;
    Dou.Image = douUI.Image;
    Dou.ItemRenderer = douUI.ItemRenderer;
    Dou.Label = douUI.Label;
    Dou.List = douUI.List;
    Dou.ProgressBar = douUI.ProgressBar;
    Dou.RadioButton = douUI.RadioButton;
    Dou.RadioButtonGroup = douUI.RadioButtonGroup;
    Dou.Rect = douUI.Rect;
    Dou.RichLabel = douUI.RichLabel;
    Dou.Scroller = douUI.Scroller;
    Dou.TabBar = douUI.TabBar;
    Dou.ToggleButton = douUI.ToggleButton;
    Dou.Tree = douUI.Tree;
    Dou.UILayer = douUI.UILayer;
    Dou.ViewStack = douUI.ViewStack;
    Dou.VScrollBar = douUI.VScrollBar;
    Dou.VSlider = douUI.VSlider;

    Dou.sys.UIComponentImpl = douUI.sys.UIComponentImpl;
    Dou.sys.Validator = douUI.sys.Validator;

    Dou.CollectionEvent = douUI.CollectionEvent;
    Dou.ItemTapEvent = douUI.ItemTapEvent;
    Dou.UIEvent = douUI.UIEvent;

    Dou.sys.ChildInfo = douUI.sys.ChildInfo;
    Dou.LayoutBase = douUI.LayoutBase;
    Dou.LinearLayoutBase = douUI.LinearLayoutBase;
    Dou.BasicLayout = douUI.BasicLayout;
    Dou.HorizontalLayout = douUI.HorizontalLayout;
    Dou.TileLayout = douUI.TileLayout;
    Dou.VerticalLayout = douUI.VerticalLayout;

    Dou.SkinBase = douUI.SkinBase;

    Dou.Theme = douUI.Theme;

    Dou.sys.implementUIComponent = douUI.sys.implementUIComponent;
    Dou.sys.mixin = douUI.sys.mixin;
    Dou.sys.isIUIComponent = douUI.sys.isIUIComponent;
    Dou.sys.measure = douUI.sys.measure;
    Dou.sys.updateDisplayList = douUI.sys.updateDisplayList;
    Dou.sys.MatrixUtil = douUI.sys.MatrixUtil;
    Dou.TreeUtil = douUI.TreeUtil;

})((<any>window).Dou || ((<any>window).Dou = {}));

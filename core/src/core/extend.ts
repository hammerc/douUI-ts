declare module dou {
    module Event {
        const PROPERTY_CHANGE: string;
    }
}

(function () {
    let f, p;

    f = dou.Event;
    f.PROPERTY_CHANGE = "propertyChange";

})();

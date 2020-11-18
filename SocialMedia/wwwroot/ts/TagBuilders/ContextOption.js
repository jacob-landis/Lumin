/*
    This class contains logic for creating context menu options.
*/
var ContextOption = /** @class */ (function () {
    /*
        PARAMETERS:
        tag must be an HTML elm.
        func must be at least an empty function.
    */
    function ContextOption(tag, func) {
        // Create root HTML elm with class for CSS and onclick callback of the one provided, and get a handle on it.
        this.tag = ViewUtil.tag('div', {
            classList: 'context-option',
            onclick: func
        });
        // Append the provided elm to this options root elm.
        this.tag.append(tag);
        // XXX if the provided tag had an on-click as well as this context option's tag, which on-click would invoke? Both?
        // XXX this relates to the editory and whether it can handle imbedding the invoke start() callback.
    }
    return ContextOption;
}());
//# sourceMappingURL=ContextOption.js.map
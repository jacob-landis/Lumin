var ViewUtil = /** @class */ (function () {
    function ViewUtil() {
    }
    //_____ TAG BUILDERS 
    ViewUtil.tag = function (tagName, x) {
        var tag = document.createElement(tagName);
        if (x) {
            if (x.id)
                tag.id = x.id;
            if (x.classList)
                tag.classList = x.classList;
            if (x.name)
                tag.name = x.name;
            if (x.color)
                tag.style.color = x.color;
            if (x.innerHTML)
                tag.innerHTML = x.innerHTML;
            if (x.innerText)
                tag.innerText = x.innerText;
            if (x.src)
                tag.src = "data:image/png;base64," + x.src;
            if (x.onclick)
                tag.onclick = x.onclick;
            if (x.type)
                tag.type = x.type;
            if (x.oncontextmenu)
                tag.oncontextmenu = x.oncontextmenu;
        }
        return tag;
    };
    //_____ TAG MANIPULATORS
    // Return deep copy of the provided element.
    ViewUtil.copy = function (elm) { return elm.cloneNode(true); };
    // Perform null check before removing the provided element. (Error prevention)
    ViewUtil.remove = function (elm) { if (elm != null)
        elm.remove(); };
    // Perform null check before iteratively removing child nodes from the provided element.
    ViewUtil.empty = function (elm) { if (elm != null)
        while (elm.firstChild)
            elm.removeChild(elm.firstChild); };
    // Set display attribute to 'none' on the provided element.
    ViewUtil.hide = function (elm) { elm.style.display = 'none'; };
    // Set display attribute to 'inline'(default) or the provided string on the provided element.
    ViewUtil.show = function (elm, displayType) {
        if (displayType === void 0) { displayType = 'inline'; }
        elm.style.display = displayType;
    };
    /*
        If the provided element is being displayed, hide it,
        else show it.
    */
    ViewUtil.toggle = function (elm, displayType) {
        if (displayType === void 0) { displayType = 'inline'; }
        if (elm.style.display != 'none')
            this.hide(elm);
        else
            this.show(elm, displayType);
    };
    return ViewUtil;
}());
//# sourceMappingURL=ViewUtil.js.map
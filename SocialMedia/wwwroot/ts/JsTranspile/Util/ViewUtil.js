var ViewUtil = (function () {
    function ViewUtil() {
    }
    ViewUtil.tag = function (tagName, x) {
        var tag = document.createElement(tagName);
        if (x) {
            if (x.id)
                tag.id = x.id;
            if (x.classList)
                tag.classList.add(x.classList);
            if (x.name)
                tag.setAttribute('name', x.name);
            if (x.color)
                tag.style.color = x.color;
            if (x.innerHTML)
                tag.innerHTML = x.innerHTML;
            if (x.innerText)
                tag.innerText = x.innerText;
            if (x.src)
                tag.setAttribute('src', "data:image/png;base64," + x.src);
            if (x.onclick)
                tag.onclick = x.onclick;
            if (x.type)
                tag.setAttribute('type', x.type);
            if (x.oncontextmenu)
                tag.oncontextmenu = x.oncontextmenu;
        }
        return tag;
    };
    ViewUtil.copy = function (elm) {
        return elm.cloneNode(true);
    };
    ViewUtil.remove = function (elm) {
        if (elm != null)
            elm.remove();
    };
    ViewUtil.empty = function (elm) {
        if (elm != null)
            while (elm.firstChild)
                elm.removeChild(elm.firstChild);
    };
    ViewUtil.hide = function (elm) {
        elm.style.display = 'none';
    };
    ViewUtil.show = function (elm, displayType) {
        if (displayType === void 0) { displayType = 'inline'; }
        elm.style.display = displayType;
    };
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
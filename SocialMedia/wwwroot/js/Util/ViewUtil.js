var ViewUtil = (function () {
    function ViewUtil() {
    }
    ViewUtil.tag = function (tagName, propertySetting) {
        var newElement = document.createElement(tagName);
        if (propertySetting) {
            if (propertySetting.id)
                newElement.id = propertySetting.id;
            if (propertySetting.classList)
                propertySetting.classList.split(' ').forEach(function (className) {
                    if (className != '' && className != null)
                        newElement.classList.add(className);
                });
            if (propertySetting.name)
                newElement.setAttribute('name', propertySetting.name);
            if (propertySetting.color)
                newElement.style.color = propertySetting.color;
            if (propertySetting.innerHTML)
                newElement.innerHTML = propertySetting.innerHTML;
            if (propertySetting.innerText)
                newElement.innerText = propertySetting.innerText;
            if (propertySetting.src)
                newElement.setAttribute('src', "data:image/png;base64," + propertySetting.src);
            if (propertySetting.onclick)
                newElement.onclick = propertySetting.onclick;
            if (propertySetting.type)
                newElement.setAttribute('type', propertySetting.type);
            if (propertySetting.oncontextmenu)
                newElement.oncontextmenu = propertySetting.oncontextmenu;
        }
        return newElement;
    };
    ViewUtil.addClassList = function (classList, elm) {
        var classListArray = classList.split(' ');
        classListArray.forEach(function (c) { return elm.classList.add(c); });
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
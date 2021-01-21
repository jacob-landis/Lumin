var Dropdown = (function () {
    function Dropdown(rootElm, contentElm) {
        this.rootElm = rootElm;
        this.contentElm = contentElm;
        this.frameElm = ViewUtil.copy(Dropdown.frameTemplate);
        this.frameElm.append(this.rootElm);
        Dropdown.frameContainer.append(this.frameElm);
        this.contentElm.style.height = "" + (window.innerHeight - Main.navBar.clientHeight);
    }
    Dropdown.initialize = function (frameTemplate, frameContainer) {
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
    };
    Dropdown.moveToForeground = function () {
        if (this.openDropdown != null)
            this.openDropdown.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
    };
    Dropdown.moveToBackground = function () {
        if (this.openDropdown != null)
            this.openDropdown.rootElm.style.zIndex = "" + (Modal.highestZIndex - 1);
    };
    Dropdown.prototype.open = function () {
        if (Dropdown.openDropdown != null)
            Dropdown.openDropdown.close();
        Dropdown.openDropdown = this;
        this.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
        ViewUtil.show(this.rootElm, 'block');
    };
    Dropdown.prototype.close = function () {
        ViewUtil.hide(this.rootElm);
        Dropdown.openDropdown = null;
    };
    Dropdown.prototype.toggle = function () {
        var closed = this.rootElm.style.display != 'block';
        var openAndCovered = !closed && (+this.rootElm.style.zIndex < Modal.highestZIndex);
        if (openAndCovered)
            Dropdown.moveToForeground();
        else if (closed)
            this.open();
        else
            this.close();
    };
    Dropdown.openDropdown = null;
    return Dropdown;
}());
//# sourceMappingURL=Dropdown.js.map
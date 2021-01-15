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
    Dropdown.prototype.open = function () {
        if (Dropdown.openDropdown != null)
            Dropdown.openDropdown.close();
        Dropdown.openDropdown = this;
        ViewUtil.show(this.rootElm, 'block');
    };
    Dropdown.prototype.close = function () {
        ViewUtil.hide(this.rootElm);
        Dropdown.openDropdown = null;
    };
    Dropdown.prototype.toggle = function () {
        this.rootElm.style.display != 'block' ? this.open() : this.close();
    };
    Dropdown.openDropdowns = [];
    Dropdown.openDropdown = null;
    return Dropdown;
}());
//# sourceMappingURL=Dropdown.js.map
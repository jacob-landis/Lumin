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
        Dropdown.openDropdowns.forEach(function (d) { return d.close(); });
        ViewUtil.show(this.rootElm, 'block');
    };
    Dropdown.prototype.close = function () {
        ViewUtil.hide(this.rootElm);
        Dropdown.openDropdowns.splice(Dropdown.openDropdowns.indexOf(this));
    };
    Dropdown.prototype.toggle = function () {
        this.rootElm.style.display != 'block' ? this.open() : this.close();
    };
    Dropdown.openDropdowns = [];
    return Dropdown;
}());
//# sourceMappingURL=Dropdown.js.map
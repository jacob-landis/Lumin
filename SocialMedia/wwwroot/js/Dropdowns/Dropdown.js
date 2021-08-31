var Dropdown = (function () {
    function Dropdown(rootElm, contentElm, btnOpen) {
        this.rootElm = rootElm;
        this.contentElm = contentElm;
        this.btnOpen = btnOpen;
        this.frameElm = ViewUtil.copy(Dropdown.frameTemplate);
        this.frameElm.append(this.rootElm);
        Dropdown.frameContainer.append(this.frameElm);
        this.contentElm.style.height = "" + window.innerHeight;
    }
    Dropdown.initialize = function (frameTemplate, frameContainer) {
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
    };
    Dropdown.moveToForeground = function () {
        if (this.openDropdown != null)
            this.openDropdown.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
    };
    Dropdown.closeAny = function () {
        imageDropdown.close();
        friendDropdown.close();
    };
    Dropdown.prototype.open = function () {
        var _this = this;
        contextMenu.close();
        this.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
        ViewUtil.show(this.rootElm, 'block', function () {
            _this.btnOpen.classList.add('openDropdownBtn');
            _this.contentElm.style.opacity = '1';
            if (Dropdown.openDropdown != null)
                Dropdown.openDropdown.close();
            Dropdown.openDropdown = _this;
        });
    };
    Dropdown.prototype.close = function () {
        if (Dropdown.openDropdown == this) {
            contextMenu.close();
            this.btnOpen.classList.remove('openDropdownBtn');
            this.contentElm.style.opacity = '0';
            Dropdown.openDropdown = null;
            ViewUtil.hide(this.rootElm, 150);
        }
    };
    Dropdown.prototype.toggle = function () {
        var closed = !ViewUtil.isDisplayed(this.rootElm);
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
var ContextMenu = (function () {
    function ContextMenu(backgroundElm, contentElm) {
        var _this = this;
        this.backgroundElm = backgroundElm;
        this.contentElm = contentElm;
        this.optionsBox = new ContentBox(contentElm);
        window.addEventListener('scroll', function (e) {
            if (ViewUtil.isDisplayed(_this.optionsBox.rootElm))
                _this.close();
        });
        this.backgroundElm.onclick = function (e) {
            _this.close();
        };
        this.optionsBox.rootElm.onclick = function (e) {
            _this.close();
        };
    }
    ContextMenu.prototype.load = function (e, options) {
        this.optionsBox.clear();
        this.optionsBox.add(options);
        this.open();
        e.preventDefault();
        this.optionsBox.rootElm.style.left = "" + (e.clientX - this.optionsBox.width);
        this.optionsBox.rootElm.style.top = "" + (e.clientY - this.optionsBox.height);
    };
    ContextMenu.prototype.open = function () {
        ViewUtil.show(this.backgroundElm);
    };
    ContextMenu.prototype.close = function () {
        ViewUtil.hide(this.backgroundElm);
    };
    return ContextMenu;
}());
//# sourceMappingURL=ContextMenu.js.map
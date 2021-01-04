var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ContextModal = (function (_super) {
    __extends(ContextModal, _super);
    function ContextModal(contentElm) {
        var _this = _super.call(this, contentElm) || this;
        _this.optionsBox = new ContentBox(contentElm);
        window.addEventListener('scroll', function () {
            if (_this.optionsBox.rootElm.style.display != "none")
                _this.close();
        });
        _this.optionsBox.rootElm.onclick = function () {
            _this.close();
        };
        return _this;
    }
    ContextModal.prototype.load = function (e, options) {
        this.optionsBox.clear();
        this.optionsBox.add(options);
        this.open();
        e.preventDefault();
        this.optionsBox.rootElm.style.left = "" + (e.clientX - this.optionsBox.width);
        this.optionsBox.rootElm.style.top = "" + (e.clientY - this.optionsBox.height);
    };
    return ContextModal;
}(Modal));
//# sourceMappingURL=ContextModal.js.map
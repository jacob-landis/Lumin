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
/*
    This class contains logic for creating context menu options.
*/
var ContextOption = /** @class */ (function (_super) {
    __extends(ContextOption, _super);
    function ContextOption(rootElm, onOptionClick) {
        var _this = this;
        rootElm.classList.add('context-option');
        rootElm.onclick = onOptionClick;
        _this = _super.call(this, rootElm) || this;
        return _this;
    }
    return ContextOption;
}(Card));
//# sourceMappingURL=ContextOption.js.map
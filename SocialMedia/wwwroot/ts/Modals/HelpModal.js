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
    This class contains just enough to qualify the help modal as a modal.
    There is no unique functionality in the help modal.
*/
var HelpModal = /** @class */ (function (_super) {
    __extends(HelpModal, _super);
    function HelpModal(rootElm) {
        return _super.call(this, rootElm) || this;
    }
    return HelpModal;
}(Modal));
//# sourceMappingURL=HelpModal.js.map
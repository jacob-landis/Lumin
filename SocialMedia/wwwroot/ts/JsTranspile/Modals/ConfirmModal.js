var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ConfirmModal = (function (_super) {
    __extends(ConfirmModal, _super);
    function ConfirmModal(rootElm, lblPrompt, btnYes, btnNo) {
        var _this = _super.call(this, rootElm) || this;
        _this.lblPrompt = lblPrompt;
        btnYes.onclick = function () { return _this.respond(true); };
        btnNo.onclick = function () { return _this.respond(false); };
        return _this;
    }
    ConfirmModal.prototype.load = function (message, onUserDecision) {
        this.onUserDecision = onUserDecision;
        this.lblPrompt.innerText = message;
        this.open();
    };
    ConfirmModal.prototype.respond = function (answer) {
        this.onUserDecision(answer);
        this.close();
    };
    return ConfirmModal;
}(Modal));
//# sourceMappingURL=ConfirmModal.js.map
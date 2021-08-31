var ConfirmPrompt = (function () {
    function ConfirmPrompt(backgroundElm, lblPrompt, btnYes, btnNo) {
        var _this = this;
        this.lblPrompt = lblPrompt;
        this.backgroundElm = backgroundElm;
        btnYes.onclick = function (e) { return _this.respond(true); };
        btnNo.onclick = function (e) { return _this.respond(false); };
    }
    ConfirmPrompt.prototype.load = function (message, onUserDecision) {
        this.onUserDecision = onUserDecision;
        this.lblPrompt.innerText = message;
        this.open();
    };
    ConfirmPrompt.prototype.respond = function (answer) {
        this.onUserDecision(answer);
        this.close();
    };
    ConfirmPrompt.prototype.open = function () {
        ViewUtil.show(this.backgroundElm);
        document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    };
    ConfirmPrompt.prototype.close = function () {
        ViewUtil.hide(this.backgroundElm);
        document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');
    };
    return ConfirmPrompt;
}());
//# sourceMappingURL=ConfirmPrompt.js.map
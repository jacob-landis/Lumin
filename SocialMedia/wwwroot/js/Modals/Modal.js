var Modal = (function () {
    function Modal(contentElm) {
        if (contentElm.id == "contextContent") {
            this.rootElm = contentElm;
        }
        else {
            this.rootElm = ViewUtil.copy(Modal.frameTemplate);
            this.rootElm.append(contentElm);
        }
        Modal.frameContainer.append(this.rootElm);
    }
    Modal.initialize = function (frameTemplate, frameContainer, btnClose) {
        var _this = this;
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
        this.btnClose = btnClose;
        this.btnClose.onclick = function () { return _this.closeTopModal(); };
        window.onclick = function (e) {
            if (e.target.classList.contains("modalBox"))
                _this.closeTopModal();
        };
    };
    Modal.closeTopModal = function () { this.openModals[this.openModals.length - 1].close(); };
    Modal.prototype.open = function () {
        if (this.rootElm.style.display == "inline" || this.rootElm.style.display == "block")
            this.close();
        ViewUtil.show(this.rootElm);
        ViewUtil.show(Modal.btnClose, 'block');
        this.rootElm.style.zIndex = "" + Modal.openModals.push(this);
        if (!(this.rootElm.id == 'contextModal' || this.rootElm.id == 'confirmModal'))
            document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    };
    Modal.prototype.close = function () {
        ViewUtil.hide(this.rootElm);
        Modal.openModals.splice(Modal.openModals.indexOf(this), 1);
        if (Modal.openModals.length == 0) {
            document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');
            ViewUtil.hide(Modal.btnClose);
        }
    };
    Modal.openModals = [];
    return Modal;
}());
//# sourceMappingURL=Modal.js.map
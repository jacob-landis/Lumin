var Modal = (function () {
    function Modal(rootElm) {
        this.rootElm = rootElm;
        this.frameElm = ViewUtil.copy(Modal.frameTemplate);
        this.frameElm.append(this.rootElm);
        Modal.frameContainer.append(this.frameElm);
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
        this.close();
        ViewUtil.show(this.frameElm);
        ViewUtil.show(Modal.btnClose, 'block');
        this.rootElm.style.zIndex = "" + Modal.openModals.push(this);
        if (!(this.rootElm.id == 'contextModal' || this.rootElm.id == 'confirmModal'))
            document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    };
    Modal.prototype.close = function () {
        ViewUtil.hide(this.frameElm);
        Modal.openModals[Modal.openModals.indexOf(this)] = null;
        Util.filterNulls(Modal.openModals);
        if (Modal.openModals.length == 0) {
            document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');
            ViewUtil.hide(Modal.btnClose);
        }
    };
    Modal.openModals = [];
    return Modal;
}());
//# sourceMappingURL=Modal.js.map
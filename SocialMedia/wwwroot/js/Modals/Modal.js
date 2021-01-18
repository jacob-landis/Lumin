var Modal = (function () {
    function Modal(contentElm) {
        this.rootElm = ViewUtil.copy(Modal.frameTemplate);
        this.rootElm.append(contentElm);
        Modal.frameContainer.append(this.rootElm);
    }
    Modal.initialize = function (frameTemplate, frameContainer, btnClose) {
        var _this = this;
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
        this.btnClose = btnClose;
        this.btnClose.onclick = function () { return _this.closeTopModal(); };
        window.addEventListener('click', function (e) {
            if (e.target.classList.contains("modalBox"))
                _this.closeTopModal();
        });
    };
    Modal.closeTopModal = function () {
        this.openModals[this.openModals.length - 1].close();
    };
    Modal.prototype.open = function () {
        if (this.rootElm.style.display == "inline" || this.rootElm.style.display == "block")
            this.close();
        ViewUtil.show(this.rootElm);
        ViewUtil.show(Modal.btnClose, 'block');
        this.rootElm.style.zIndex = "" + Modal.openModals.push(this);
        document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
    };
    Modal.prototype.close = function () {
        console.log("close");
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
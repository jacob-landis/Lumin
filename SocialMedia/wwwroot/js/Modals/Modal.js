var Modal = (function () {
    function Modal(contentElm) {
        this.rootElm = ViewUtil.copy(Modal.frameTemplate);
        this.rootElm.append(contentElm);
        Modal.frameContainer.append(this.rootElm);
    }
    Object.defineProperty(Modal, "highestZIndex", {
        get: function () {
            return this.openModals.length == 0 ? 0 : +Modal.openModals[Modal.openModals.length - 1].rootElm.style.zIndex;
        },
        enumerable: true,
        configurable: true
    });
    Modal.initialize = function (frameTemplate, frameContainer, btnClose) {
        var _this = this;
        this.frameTemplate = frameTemplate;
        this.frameContainer = frameContainer;
        this.btnClose = btnClose;
        this.btnClose.onclick = function (e) { return _this.closeTopModal(); };
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
        this.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
        Modal.openModals.push(this);
        document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
        Dropdown.moveToForeground();
    };
    Modal.prototype.close = function () {
        if (this.rootElm.style.display == "inline" || this.rootElm.style.display == "block") {
            ViewUtil.hide(this.rootElm);
            Modal.openModals.splice(Modal.openModals.indexOf(this), 1);
            if (Modal.openModals.length == 0) {
                document.getElementsByTagName("BODY")[0].classList.remove('scrollLocked');
                ViewUtil.hide(Modal.btnClose);
            }
        }
    };
    Modal.openModals = [];
    return Modal;
}());
//# sourceMappingURL=Modal.js.map
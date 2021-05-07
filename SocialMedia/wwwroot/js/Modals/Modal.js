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
    Object.defineProperty(Modal.prototype, "hasFocus", {
        get: function () {
            return Modal.openModals[Modal.openModals.length - 1] == this && ViewUtil.isDisplayed(this.rootElm);
        },
        enumerable: true,
        configurable: true
    });
    Modal.prototype.open = function () {
        var _this = this;
        contextMenu.close();
        this.rootElm.style.zIndex = "" + (Modal.highestZIndex + 1);
        if (!ViewUtil.isDisplayed(this.rootElm)) {
            ViewUtil.show(this.rootElm, 'inline', function () {
                _this.rootElm.style.opacity = '1';
                ViewUtil.show(Modal.btnClose, 'block');
                Modal.openModals.push(_this);
                document.getElementsByTagName("BODY")[0].classList.add('scrollLocked');
                Dropdown.moveToForeground();
            });
        }
        else {
            Modal.openModals.splice(Modal.openModals.indexOf(this), 1);
            Modal.openModals.push(this);
            Dropdown.moveToForeground();
        }
    };
    Modal.prototype.close = function () {
        contextMenu.close();
        if (ViewUtil.isDisplayed(this.rootElm)) {
            ViewUtil.hide(this.rootElm, 150);
            this.rootElm.style.opacity = '0';
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
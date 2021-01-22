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
var FullSizeImageModal = (function (_super) {
    __extends(FullSizeImageModal, _super);
    function FullSizeImageModal(rootElm, content, btnPrev, btnNext, imageCount, imageBoxElm, imageClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.singular = null;
        _this.content = content;
        _this.btnPrev = btnPrev;
        _this.btnNext = btnNext;
        _this.imageCount = imageCount;
        _this.imageClassList = imageClassList;
        _this.imageControls = [_this.imageCount, _this.btnNext, _this.btnPrev, Modal.btnClose];
        _this.imageCon = new ImageBox(imageBoxElm, imageClassList, function (target) { return _this.toggleControls(); });
        _this.imageCon.height = window.innerHeight - Main.navBar.clientHeight;
        _this.btnPrev.onclick = function () { return _this.requestImage(-1); };
        _this.btnNext.onclick = function () { return _this.requestImage(1); };
        return _this;
    }
    FullSizeImageModal.prototype.loadSingle = function (imageId) {
        var _this = this;
        this.imageCon.load(imageId, this.imageClassList, function (target) { return _this.toggleClose(); });
        this.hideControls();
        this.openOverrided();
        this.singular = true;
    };
    FullSizeImageModal.prototype.load = function (clickedImageIndex, profileId) {
        var _this = this;
        this.profileId = profileId ? profileId : User.profileId;
        this.index = clickedImageIndex;
        Ajax.getProfileImagesCount(this.profileId, function (imageCount) {
            _this.profileImagesCount = imageCount;
            _this.updateImageCount();
            _this.requestImage(0);
        });
        this.openOverrided();
        Ajax.getProfile(profileId, function (profileCard) {
            var promptMsg = (profileId == User.profileId) ? "My images" : profileCard.profile.name + "'s images";
            imageDropdown.load(profileId, promptMsg);
        });
        this.singular = false;
    };
    FullSizeImageModal.prototype.openOverrided = function () {
        _super.prototype.open.call(this);
        Dropdown.moveToBackground();
    };
    FullSizeImageModal.prototype.close = function () {
        this.showControls();
        if (this.singular == true)
            ViewUtil.hide(imageDropdown.rootElm);
        this.imageCon.unload();
        _super.prototype.close.call(this);
    };
    FullSizeImageModal.prototype.requestImage = function (increment) {
        var _this = this;
        var indexToBe = this.index + increment;
        if (indexToBe >= 0 && indexToBe < this.profileImagesCount) {
            this.index = indexToBe;
            this.updateImageCount();
            Ajax.getProfileImages(this.profileId, this.index, 1, '', function () { }, function (imageCards) {
                _this.imageCon.load(imageCards[0].image.imageId, null, function (target) { return _this.toggleControls(); });
            });
        }
    };
    FullSizeImageModal.prototype.updateImageCount = function () { this.imageCount.innerText = this.index + 1 + " / " + this.profileImagesCount; };
    FullSizeImageModal.prototype.toggleClose = function () { Modal.btnClose.style.display != 'none' ? ViewUtil.hide(Modal.btnClose) : ViewUtil.show(Modal.btnClose); };
    FullSizeImageModal.prototype.toggleControls = function () { this.btnNext.style.display != 'none' ? this.hideControls() : this.showControls(); };
    FullSizeImageModal.prototype.showControls = function () {
        ViewUtil.show(imageDropdown.rootElm);
        this.imageControls.forEach(function (c) { return ViewUtil.show(c); });
    };
    FullSizeImageModal.prototype.hideControls = function () {
        ViewUtil.hide(imageDropdown.rootElm);
        this.imageControls.forEach(function (c) { return ViewUtil.hide(c); });
    };
    return FullSizeImageModal;
}(Modal));
//# sourceMappingURL=FullSizeImageModal.js.map
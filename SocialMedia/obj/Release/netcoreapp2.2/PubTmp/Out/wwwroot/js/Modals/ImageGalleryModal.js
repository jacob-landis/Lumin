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
var ImageGalleryModal = (function (_super) {
    __extends(ImageGalleryModal, _super);
    function ImageGalleryModal(rootElm, btnPrev, btnNext, imageCount, imageOwnership, imageOwner, imagePrivacy, selectImagePrivacy, imageDateTime, imageBoxElm, imageClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.imageOwnership = imageOwnership;
        _this.imageOwner = imageOwner;
        _this.imagePrivacy = imagePrivacy;
        _this.selectImagePrivacy = selectImagePrivacy;
        _this.isSingular = null;
        rootElm.onclick = function (event) { if (event.target == rootElm)
            _this.close(); };
        _this.btnPrev = btnPrev;
        _this.btnNext = btnNext;
        _this.imageCount = imageCount;
        _this.imageDateTime = imageDateTime;
        _this.imageClassList = imageClassList;
        _this.imageControls = [_this.imageCount, _this.imageOwnership, _this.imageDateTime, btnNext, btnPrev, Modal.btnClose];
        _this.imageCon = new ImageBox(imageBoxElm, imageClassList, 'Toggle controls', function (target) { return _this.toggleControls(); }, 3);
        _this.imageCon.onLoadEnd = function () {
            _this.imageDateTime.innerText = "Uploaded on " + Util.formatDateTime(_this.imageCon.imageCard.image.dateTime);
            if (_this.imageCon.imageCard.image.profileId == User.profileId) {
                ViewUtil.hide(_this.imageOwner);
                ViewUtil.show(_this.imagePrivacy);
                _this.selectImagePrivacy.value = "" + _this.imageCon.imageCard.image.privacyLevel;
            }
            else {
                ViewUtil.hide(_this.imagePrivacy);
                ViewUtil.show(_this.imageOwner);
                ViewUtil.empty(_this.imageOwner);
                Ajax.getProfile(_this.imageCon.imageCard.image.profileId, function (profileCard) {
                    _this.imageOwner.append(profileCard.rootElm);
                });
            }
        };
        _this.selectImagePrivacy.onchange = function () {
            Ajax.updateImagePrivacy(_this.imageCon.imageCard.image.imageId, _this.selectImagePrivacy.selectedIndex);
        };
        _this.btnPrev.onclick = function (e) { return _this.requestImage(_this.index - 1); };
        _this.btnNext.onclick = function (e) { return _this.requestImage(_this.index + 1); };
        document.addEventListener("keydown", function (event) {
            if (_this.hasFocus && !_this.isSingular) {
                if (event.keyCode == 37)
                    _this.btnPrev.click();
                else if (event.keyCode == 39)
                    _this.btnNext.click();
            }
        });
        return _this;
    }
    ImageGalleryModal.prototype.loadSingle = function (imageId) {
        var _this = this;
        this.imageCon.load(imageId, this.imageClassList, 'Toggle controls', function (target) { return _this.toggleControls(); });
        this.hideControls();
        this.showSingularControls();
        this.openOverrided();
        this.isSingular = true;
    };
    ImageGalleryModal.prototype.load = function (clickedImageIndex, profileId) {
        var _this = this;
        this.profileId = profileId ? profileId : User.profileId;
        this.index = clickedImageIndex;
        Ajax.getProfileImagesCount(this.profileId, function (imageCount) {
            _this.profileImagesCount = +imageCount;
            _this.updateImageCount();
            _this.requestImage(_this.index);
        });
        this.openOverrided();
        Ajax.getProfile(profileId, function (profileCard) {
            var promptMsg = (profileId == User.profileId) ? "My images" : profileCard.profile.firstName + " " + profileCard.profile.lastName + "'s images";
            imageDropdown.load(profileId, promptMsg, 'Fullscreen', function (target) {
                _this.requestImage(imageDropdown.indexOf(target));
            });
        });
        this.showControls();
        this.isSingular = false;
    };
    ImageGalleryModal.prototype.openOverrided = function () {
        _super.prototype.open.call(this);
    };
    ImageGalleryModal.prototype.close = function () {
        if (this.isSingular == true)
            ViewUtil.hide(imageDropdown.rootElm);
        this.imageCon.unload();
        imageDropdown.clearHighlight();
        imageDropdown.close();
        _super.prototype.close.call(this);
    };
    ImageGalleryModal.prototype.requestImage = function (targetIndex) {
        var _this = this;
        if (targetIndex >= 0 && targetIndex < this.profileImagesCount) {
            this.index = targetIndex;
            this.updateImageCount();
            Ajax.getImageByIndex(this.profileId, this.index, 3, '', 'Toggle controls', function (target) { return _this.toggleControls(); }, function (imageCard) { return _this.imageCon.loadImage(imageCard); });
            imageDropdown.highlightAtIndex(this.index);
        }
    };
    ImageGalleryModal.prototype.updateImageCount = function () { this.imageCount.innerText = this.index + 1 + " / " + this.profileImagesCount; };
    ImageGalleryModal.prototype.toggleControls = function () {
        if (this.isSingular)
            ViewUtil.isDisplayed(Modal.btnClose) ? this.hideSingularControls() : this.showSingularControls();
        else
            ViewUtil.isDisplayed(this.btnNext) ? this.hideControls() : this.showControls();
    };
    ImageGalleryModal.prototype.showSingularControls = function () {
        ViewUtil.show(Modal.btnClose);
        ViewUtil.show(this.imageDateTime, 'inline');
        ViewUtil.show(this.imageOwnership, 'inline');
        navBar.show();
    };
    ImageGalleryModal.prototype.hideSingularControls = function () {
        ViewUtil.hide(Modal.btnClose);
        ViewUtil.hide(this.imageDateTime);
        ViewUtil.hide(this.imageOwnership);
        navBar.hide();
    };
    ImageGalleryModal.prototype.showControls = function () {
        navBar.show();
        ViewUtil.show(imageDropdown.rootElm);
        this.imageControls.forEach(function (control) { return ViewUtil.show(control); });
    };
    ImageGalleryModal.prototype.hideControls = function () {
        navBar.hide();
        ViewUtil.hide(imageDropdown.rootElm);
        this.imageControls.forEach(function (control) { return ViewUtil.hide(control); });
    };
    return ImageGalleryModal;
}(Modal));
//# sourceMappingURL=ImageGalleryModal.js.map
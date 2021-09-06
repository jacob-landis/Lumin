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
var ImageDropdown = (function (_super) {
    __extends(ImageDropdown, _super);
    function ImageDropdown(rootElm, contentElm, imagesWrapper, prompt, btnOpenUploadImageModal, btnOpen) {
        var _this = _super.call(this, rootElm, contentElm, btnOpen) || this;
        _this.highLitImage = null;
        _this.imageWrapper = imagesWrapper;
        _this.prompt = prompt;
        _this.imagesBox = new ProfileImagesBox('Fullscreen', _this.contentElm, function (target) {
            return imageGalleryModal.load(_this.indexOf(target));
        });
        _this.imageWrapper.append(_this.imagesBox.rootElm);
        btnOpenUploadImageModal.onchange = function (e) {
            return uploadImageModal.load(e, function (imageCard) {
                return ProfileImagesBox.profileImageBoxes.forEach(function (p) {
                    var imageBox = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.tooltipMsg, null, 1);
                    imageBox.loadImage(ImageCard.copy(imageCard));
                    if (p.profileId == User.profileId)
                        p.addImage(imageBox, true);
                });
            });
        };
        return _this;
    }
    ImageDropdown.prototype.open = function () {
        this.load(User.profileId, "My images");
    };
    ImageDropdown.prototype.load = function (profileId, promptMsg, tooltipMsg, onImageClick) {
        var _this = this;
        if (promptMsg === void 0) { promptMsg = ""; }
        if (tooltipMsg === void 0) { tooltipMsg = null; }
        if (onImageClick != null) {
            if (profileId == this.imagesBox.profileId) {
                this.convert(tooltipMsg, onImageClick);
            }
            else {
                this.imagesBox.load(profileId, tooltipMsg, onImageClick);
            }
        }
        else {
            if (profileId == this.imagesBox.profileId) {
                this.convert('Fullscreen', function (target) {
                    imageGalleryModal.load(_this.indexOf(target), profileId);
                });
            }
            else {
                this.imagesBox.load(profileId, 'Fullscreen', function (target) {
                    imageGalleryModal.load(_this.indexOf(target), profileId);
                });
            }
        }
        this.prompt.innerText = promptMsg;
        if (Dropdown.openDropdown != this)
            _super.prototype.open.call(this);
    };
    ImageDropdown.prototype.convert = function (tooltipMsg, callback) {
        var _this = this;
        this.imagesBox.clickCallback = function (target) { return callback(target); };
        this.imagesBox.content.forEach(function (imageBox) {
            imageBox.imageCard.onImageClick = _this.imagesBox.clickCallback;
            imageBox.imageCard.tooltipMsg = tooltipMsg;
        });
        this.prompt.innerText = 'Select an Image';
    };
    ImageDropdown.prototype.indexOf = function (imageBox) {
        return this.imagesBox.content.indexOf(imageBox);
    };
    ImageDropdown.prototype.highlightAtIndex = function (targetIndex) {
        this.clearHighlight();
        this.highLitImage = this.imagesBox.content[targetIndex];
        this.highLitImage.rootElm.classList.add('highlighted');
    };
    ImageDropdown.prototype.clearHighlight = function () {
        if (this.highLitImage != null)
            this.highLitImage.rootElm.classList.remove('highlighted');
    };
    return ImageDropdown;
}(Dropdown));
//# sourceMappingURL=ImageDropdown.js.map
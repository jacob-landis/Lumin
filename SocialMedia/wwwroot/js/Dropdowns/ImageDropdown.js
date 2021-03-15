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
    function ImageDropdown(rootElm, contentElm, imagesWrapper, prompt, btnUploadImageModal) {
        var _this = _super.call(this, rootElm, contentElm) || this;
        _this.highLitImage = null;
        _this.imageWrapper = imagesWrapper;
        _this.prompt = prompt;
        _this.imageBox = new ProfileImagesBox(null, _this.contentElm, function (target) {
            return fullSizeImageModal.load(_this.indexOf(target));
        });
        _this.imageWrapper.append(_this.imageBox.rootElm);
        btnUploadImageModal.onchange = function (e) {
            return uploadImageModal.load(e, function (imageCard) {
                return ProfileImagesBox.profileImageBoxes.forEach(function (p) {
                    if (p.profileId == User.profileId)
                        p.addImageCard(ImageCard.copy(imageCard), true);
                });
            });
        };
        return _this;
    }
    ImageDropdown.prototype.open = function () {
        this.load(User.profileId, "My images");
    };
    ImageDropdown.prototype.load = function (profileId, promptMsg, onImageClick) {
        var _this = this;
        if (promptMsg === void 0) { promptMsg = ""; }
        if (onImageClick != null) {
            if (profileId == this.imageBox.profileId) {
                this.convert(onImageClick);
            }
            else {
                this.imageBox.load(profileId, onImageClick);
            }
        }
        else {
            if (profileId == this.imageBox.profileId) {
                this.convert(function (target) {
                    fullSizeImageModal.load(_this.indexOf(target), profileId);
                });
            }
            else {
                this.imageBox.load(profileId, function (target) {
                    fullSizeImageModal.load(_this.indexOf(target), profileId);
                });
            }
        }
        this.prompt.innerText = promptMsg;
        if (Dropdown.openDropdown != this)
            _super.prototype.open.call(this);
    };
    ImageDropdown.prototype.convert = function (callback) {
        var _this = this;
        this.imageBox.clickCallback = function (target) { return callback(target); };
        this.imageBox.content.forEach(function (imageCard) { return imageCard.onImageClick = _this.imageBox.clickCallback; });
        this.prompt.innerText = 'Select an Image';
    };
    ImageDropdown.prototype.indexOf = function (imageCard) {
        return this.imageBox.content.indexOf(imageCard);
    };
    ImageDropdown.prototype.highlightAtIndex = function (targetIndex) {
        this.clearHighlight();
        this.highLitImage = this.imageBox.content[targetIndex];
        this.highLitImage.rootElm.classList.add('highlighted');
    };
    ImageDropdown.prototype.clearHighlight = function () {
        if (this.highLitImage != null)
            this.highLitImage.rootElm.classList.remove('highlighted');
    };
    return ImageDropdown;
}(Dropdown));
//# sourceMappingURL=ImageDropdown.js.map
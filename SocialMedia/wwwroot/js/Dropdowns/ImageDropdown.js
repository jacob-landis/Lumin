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
        _this.imageWrapper = imagesWrapper;
        _this.prompt = prompt;
        _this.imageBox = new ProfileImagesBox(null, function (targetImageCard) {
            return fullSizeImageModal.load(_this.imageBox.content.indexOf(targetImageCard));
        });
        _this.imageWrapper.append(_this.imageBox.rootElm);
        btnUploadImageModal.onchange = function (e) {
            return uploadImageModal.load(e, function (imageCard) {
                return ProfileImagesBox.profileImageBoxes.forEach(function (p) {
                    if (p.profileId == User.profileId)
                        p.addImageCard(imageCard);
                });
            });
        };
        _this.contentElm.onscroll = function () {
            var offset = _this.contentElm.scrollTop + window.innerHeight;
            if (offset >= _this.imageBox.height)
                _this.imageBox.request(15);
        };
        return _this;
    }
    ImageDropdown.prototype.open = function () {
        this.load();
        _super.prototype.open.call(this);
    };
    ImageDropdown.prototype.load = function (callback) {
        var _this = this;
        if (callback != null)
            this.convert(callback);
        else
            this.convert(function (clickedImage) {
                return fullSizeImageModal.load(_this.imageBox.content.indexOf(clickedImage));
            });
        this.prompt.innerText = callback ? 'Select an Image' : 'My Images';
        this.rootElm.style.zIndex = "" + (Modal.openModals.length + 1);
        _super.prototype.open.call(this);
    };
    ImageDropdown.prototype.convert = function (callback) {
        this.imageBox.content.forEach(function (i) { return i.onImageClick = function (imageCard) { return callback(imageCard); }; });
        this.rootElm.style.zIndex = "" + (Modal.openModals.length + 2);
        this.prompt.innerText = 'Select an Image';
        if (this.rootElm.style.display != "inline" && this.rootElm.style.display != "block")
            _super.prototype.open.call(this);
    };
    return ImageDropdown;
}(Dropdown));
//# sourceMappingURL=ImageDropdown.js.map
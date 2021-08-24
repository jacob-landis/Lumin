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
var ProfileImagesBox = (function (_super) {
    __extends(ProfileImagesBox, _super);
    function ProfileImagesBox(tooltipMsg, scrollElm, clickCallback) {
        var _this = this;
        var rootElm = ViewUtil.tag('div', { classList: 'images-box' });
        _this = _super.call(this, rootElm, scrollElm, 400, 20, function (skip, take) {
            Ajax.getProfileImages(_this.profileId, skip, take, 'listImage sqr', _this.tooltipMsg, _this.clickCallback, function (imageBoxes) {
                _this.addImages(imageBoxes);
            });
        }) || this;
        _this.tooltipMsg = tooltipMsg;
        _this.clickCallback = clickCallback;
        ProfileImagesBox.profileImageBoxes.push(_this);
        return _this;
    }
    ProfileImagesBox.prototype.load = function (profileId, tooltipMsg, onImageClick) {
        this.profileId = profileId;
        if (tooltipMsg)
            this.tooltipMsg = tooltipMsg;
        if (onImageClick)
            this.clickCallback = onImageClick;
        _super.prototype.clear.call(this);
        _super.prototype.request.call(this, 30);
    };
    ProfileImagesBox.prototype.addImages = function (imageBoxes) {
        _super.prototype.add.call(this, this.prepareImage(imageBoxes));
        if (this.onLoadEnd != null)
            this.onLoadEnd();
    };
    ProfileImagesBox.prototype.addImage = function (imageBox, prepend) {
        _super.prototype.add.call(this, this.prepareImage(imageBox), prepend);
    };
    ProfileImagesBox.prototype.prepareImage = function (imageBox) {
        var _this = this;
        if (imageBox != null) {
            var imageBoxes = void 0;
            if (Array.isArray(imageBox))
                imageBoxes = imageBox;
            else
                imageBoxes = [imageBox];
            imageBoxes.forEach(function (i) {
                i.imageCard.onImageClick = _this.clickCallback;
                i.imageCard.tooltipMsg = _this.tooltipMsg;
                i.imageCard.rootElm.classList.add('listImage');
                i.imageCard.rootElm.classList.add('sqr');
            });
            if (imageBoxes.length == 1)
                return imageBoxes[0];
            else
                return imageBoxes;
        }
        return null;
    };
    ProfileImagesBox.prototype.removeImageCard = function (imageCard) {
        var _this = this;
        this.content.forEach(function (imageBox) {
            if (imageBox.imageCard.image.imageId == imageCard.image.imageId) {
                _this.content.splice(_this.content.indexOf(imageBox), 1);
                ViewUtil.remove(imageBox.rootElm);
            }
        });
    };
    ProfileImagesBox.profileImageBoxes = [];
    return ProfileImagesBox;
}(ContentBox));
//# sourceMappingURL=ProfileImagesBox.js.map
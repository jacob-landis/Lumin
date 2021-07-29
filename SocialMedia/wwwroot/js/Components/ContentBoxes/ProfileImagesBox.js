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
    function ProfileImagesBox(profileId, tooltipMsg, scrollElm, clickCallback) {
        var _this = this;
        var rootElm = ViewUtil.tag('div', { classList: 'images-box' });
        _this = _super.call(this, rootElm, scrollElm, 400, 20, function (skip, take) {
            Ajax.getProfileImages(_this.profileId, skip, take, 'listImage sqr', _this.tooltipMsg, _this.clickCallback, function (imageCards) {
                _this.addImageCards(imageCards);
            });
        }) || this;
        _this.profileId = profileId ? profileId : User.profileId;
        _this.tooltipMsg = tooltipMsg;
        _this.clickCallback = clickCallback;
        _super.prototype.request.call(_this, 30);
        ProfileImagesBox.profileImageBoxes.push(_this);
        return _this;
    }
    ProfileImagesBox.prototype.load = function (profileId, tooltipMsg, onImageClick) {
        this.profileId = profileId;
        this.tooltipMsg = tooltipMsg;
        this.clickCallback = onImageClick;
        _super.prototype.clear.call(this);
        _super.prototype.request.call(this, 30);
    };
    ProfileImagesBox.prototype.addImageCards = function (imageCards) {
        if (imageCards != null)
            _super.prototype.add.call(this, this.prepImageCard(imageCards));
        if (this.onLoadEnd != null)
            this.onLoadEnd();
    };
    ProfileImagesBox.prototype.addImageCard = function (imageCard, prepend) {
        _super.prototype.add.call(this, this.prepImageCard(imageCard), prepend);
    };
    ProfileImagesBox.prototype.prepImageCard = function (imageCard) {
        var _this = this;
        var imageCards;
        if (Array.isArray(imageCard))
            imageCards = imageCard;
        else
            imageCards = [imageCard];
        imageCards.forEach(function (i) {
            i.onImageClick = _this.clickCallback;
            i.tooltipMsg = _this.tooltipMsg;
            i.rootElm.classList.add('listImage');
            i.rootElm.classList.add('sqr');
        });
        if (imageCards.length == 1)
            return imageCards[0];
        else
            return imageCards;
    };
    ProfileImagesBox.prototype.removeImageCard = function (imageCard) {
        var _this = this;
        this.content.forEach(function (i) {
            if (i.image.imageId == imageCard.image.imageId) {
                _this.content.splice(_this.content.indexOf(i), 1);
                ViewUtil.remove(i.rootElm);
            }
        });
    };
    ProfileImagesBox.profileImageBoxes = [];
    return ProfileImagesBox;
}(ContentBox));
//# sourceMappingURL=ProfileImagesBox.js.map
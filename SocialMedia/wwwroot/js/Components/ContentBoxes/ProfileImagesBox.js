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
    function ProfileImagesBox(profileId, clickCallback) {
        var _this = this;
        var rootElm = ViewUtil.tag('div', { classList: 'images-box' });
        _this = _super.call(this, rootElm, 20, function (skip, take) {
            Ajax.getProfileImages(_this.profileId, skip, take, 'listImage sqr', _this.clickCallback, function (imageCards) {
                _this.addImageCards(imageCards);
            });
        }) || this;
        _this.profileId = profileId ? profileId : User.profileId;
        _this.clickCallback = clickCallback;
        _super.prototype.request.call(_this, 40);
        ProfileImagesBox.profileImageBoxes.push(_this);
        return _this;
    }
    ProfileImagesBox.prototype.load = function (profileId, onImageClick) {
        this.profileId = profileId;
        this.clickCallback = onImageClick;
        _super.prototype.clear.call(this);
        _super.prototype.request.call(this, 40);
    };
    ProfileImagesBox.prototype.addImageCards = function (imageCards) {
        var _this = this;
        imageCards.forEach(function (i) { return _this.addImageCard(i); });
    };
    ProfileImagesBox.prototype.addImageCard = function (imageCard, prepend) {
        imageCard.onImageClick = this.clickCallback;
        imageCard.rootElm.classList.add('listImage');
        imageCard.rootElm.classList.add('sqr');
        _super.prototype.add.call(this, imageCard, prepend);
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
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
var ImageCard = (function (_super) {
    __extends(ImageCard, _super);
    function ImageCard(image, classList, onImageClick) {
        var _this = _super.call(this, ViewUtil.tag('img', {
            src: image.imageAsByteArray,
            classList: classList
        })) || this;
        _this.image = image;
        _this.onImageClick = onImageClick ? onImageClick : Behavior.singleFullSizeImage;
        _this.rootElm.oncontextmenu = image.profileId == User.profileId ? ImageCard.userOwnerOptionSet : null;
        ImageCard.imageCards.push(_this);
        return _this;
    }
    ImageCard.copy = function (imageCard, newClassList, newOnImageClick) {
        if (newClassList === void 0) { newClassList = imageCard.rootElm.classList.value; }
        if (newOnImageClick === void 0) { newOnImageClick = function () { return imageCard.rootElm.onclick; }; }
        return new ImageCard(imageCard.image, newClassList, newOnImageClick);
    };
    ImageCard.list = function (images, classList, onImageClick) {
        if (!images)
            return null;
        var imageCards = [];
        images.forEach(function (i) { return imageCards.push(new ImageCard(i, classList, onImageClick)); });
        return imageCards;
    };
    Object.defineProperty(ImageCard, "userOwnerOptionSet", {
        get: function () {
            return function (event) { return function (targetImageCard) {
                return contextModal.load(event, [
                    new ContextOption(Icons.createPost(), function () {
                        imageDropdown.close();
                        createPostModal.load(targetImageCard);
                    }),
                    new ContextOption(Icons.deleteImage(), function () {
                        confirmModal.load('Are you sure you want to delete this image?', function (confirmation) {
                            if (!confirmation)
                                return;
                            targetImageCard.remove();
                        });
                    })
                ]);
            }; };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageCard.prototype, "onImageClick", {
        get: function () { return this._onImageClick; },
        set: function (onImageClick) {
            var _this = this;
            this.rootElm.onclick = function (e) { return onImageClick(_this); };
            this._onImageClick = function (e) { return onImageClick(_this); };
        },
        enumerable: true,
        configurable: true
    });
    ImageCard.prototype.remove = function () {
        var _this = this;
        Ajax.deleteImage(this.image.imageId);
        PostCard.postCards.forEach(function (p) {
            if (p.post.image.imageId == _this.image.imageId)
                ViewUtil.remove(p.rootElm);
        });
        ImageCard.imageCards.forEach(function (i) {
            if (i.rawImage.id == _this.image.imageId)
                ViewUtil.remove(i.tag);
        });
        if (this.image.imageId == User.profilePictureId)
            Ajax.getImage(0, true, 'sqr', function () { }, function (imageCard) {
                return ProfileCard.changeUserProfilePicture(null, imageCard);
            });
        fullSizeImageModal.close();
    };
    ImageCard.imageCards = [];
    return ImageCard;
}(Card));
//# sourceMappingURL=ImageCard.js.map
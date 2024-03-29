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
    function ImageCard(image, classList, tooltipMsg, onImageClick) {
        var _this = _super.call(this, ViewUtil.tag('img', {
            src: image.imageAsByteArray,
            classList: classList
        })) || this;
        _this._tooltipMsg = null;
        _this.image = image;
        _this.tooltipMsg = tooltipMsg;
        _this.onImageClick = onImageClick ? onImageClick : function (target) { return imageGalleryModal.loadSingle(target.imageCard.image.imageId); };
        if (image.profileId == User.profileId)
            _this.rootElm.oncontextmenu = function (event) {
                return contextMenu.load(event, [
                    new ContextOption(Icons.createPost(), 'Post image', function (e) {
                        createPostModal.load(_this);
                    }),
                    new ContextOption(Icons.privacy(), 'Change privacy', function (e) {
                        setTimeout(function () {
                            contextMenu.load(event, [
                                new ContextOption(ViewUtil.tag('div', { innerText: 'All' }), null, function () { return Ajax.updateImagePrivacy(_this.image.imageId, 0); }),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'Mutual' }), null, function () { return Ajax.updateImagePrivacy(_this.image.imageId, 1); }),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'Friends' }), null, function () { return Ajax.updateImagePrivacy(_this.image.imageId, 2); }),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'None' }), null, function () { return Ajax.updateImagePrivacy(_this.image.imageId, 3); })
                            ]);
                        }, 10);
                    }),
                    new ContextOption(Icons.deleteImage(), 'Delete image', function (e) {
                        confirmPrompt.load('Are you sure you want to delete this image?', function (confirmation) {
                            if (!confirmation)
                                return;
                            _this.remove();
                        });
                    })
                ]);
            };
        ImageCard.imageCards.push(_this);
        return _this;
    }
    ImageCard.copy = function (imageCard, newClassList, newTooltipMsg, newOnImageClick) {
        if (newClassList === void 0) { newClassList = imageCard.rootElm.classList.value; }
        if (newTooltipMsg === void 0) { newTooltipMsg = imageCard.tooltipMsg; }
        if (newOnImageClick === void 0) { newOnImageClick = function (target) { return imageCard.rootElm.onclick; }; }
        return new ImageCard(imageCard.image, newClassList, newTooltipMsg, newOnImageClick);
    };
    ImageCard.list = function (images, classList, toolTip, onImageClick) {
        if (!images)
            return null;
        var imageCards = [];
        images.forEach(function (i) { return imageCards.push(new ImageCard(i, classList, toolTip, onImageClick)); });
        return imageCards;
    };
    Object.defineProperty(ImageCard.prototype, "tooltipMsg", {
        get: function () { return this._tooltipMsg; },
        set: function (msg) {
            this._tooltipMsg = msg;
            if (msg != null) {
                this.rootElm.title = this.image.profileId == User.profileId ? msg + ' + Right-Click options' : msg;
                this.rootElm.setAttribute('alt', msg);
                this.rootElm.classList.add('imageCardHover');
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageCard.prototype, "onImageClick", {
        get: function () { return this._onImageClick; },
        set: function (onImageClick) {
            var _this = this;
            this._onImageClick = function (target) { return onImageClick(target); };
            this.rootElm.onclick = function (event) { return onImageClick(_this.parentImageBox); };
        },
        enumerable: true,
        configurable: true
    });
    ImageCard.prototype.remove = function () {
        var _this = this;
        Ajax.deleteImage(this.image.imageId);
        PostCard.postCards.forEach(function (p) {
            if (p.post.image != null && p.post.image.imageId == _this.image.imageId)
                ViewUtil.remove(p.rootElm);
        });
        ProfileImagesBox.profileImageBoxes.forEach(function (p) {
            p.removeImageCard(_this);
        });
        if (this.image.imageId == User.profilePictureId) {
            Ajax.getImage(0, 0, 'sqr', null, function (target) { }, function (imageCard) {
                ProfileCard.changeUserProfilePicture(imageCard);
                navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(imageCard));
            });
            Ajax.getImage(0, 2, 'sqr', 'Change profile picture', function (target) { }, function (imageCard) {
                return profileModal.profilePictureBox.loadImage(imageCard);
            });
        }
        imageGalleryModal.close();
    };
    ImageCard.imageCards = [];
    return ImageCard;
}(Card));
//# sourceMappingURL=ImageCard.js.map
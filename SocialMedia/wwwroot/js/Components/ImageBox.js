var ImageBox = (function () {
    function ImageBox(rootElm, imageClassList, click, getThumbNail) {
        this.isLoaded = false;
        this.getThumbNail = getThumbNail;
        this.heldImageClassList = imageClassList;
        this.heldImageClick = click ? click : function () { };
        this.rootElm = rootElm;
        this.rootElm.classList.add('image-box');
        ImageBox.imageBoxes.push(this);
    }
    Object.defineProperty(ImageBox.prototype, "height", {
        get: function () { return Util.getElmHeight(this.rootElm); },
        set: function (height) { this.rootElm.style.height = "" + height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "width", {
        get: function () { return Util.getElmWidth(this.rootElm); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "onLoadEnd", {
        set: function (onLoadEnd) { this._onLoadEnd = function () { return onLoadEnd(); }; },
        enumerable: true,
        configurable: true
    });
    ImageBox.prototype.load = function (imageId, classList, click) {
        this.heldImageId = imageId;
        this.heldImageClassList = classList ? classList : this.heldImageClassList;
        this.heldImageClick = click ? click : this.heldImageClick;
        this.unload();
        this.reload();
    };
    ImageBox.prototype.loadImage = function (imageCard) {
        ViewUtil.empty(this.rootElm);
        if (this.heldImageClassList)
            ViewUtil.addClassList(this.heldImageClassList, imageCard.rootElm);
        if (this.heldImageClick)
            imageCard.onImageClick = this.heldImageClick;
        this.rootElm.append(imageCard.rootElm);
        this.isLoaded = true;
    };
    ImageBox.prototype.unload = function () {
        if (this.isLoaded) {
            ViewUtil.empty(this.rootElm);
            delete this.imageCard;
            this.isLoaded = false;
        }
    };
    ImageBox.prototype.reload = function () {
        var _this = this;
        if (!this.isLoaded)
            Ajax.getImage(this.heldImageId, this.getThumbNail, this.heldImageClassList, this.heldImageClick, function (imageCard) {
                _this.imageCard = imageCard;
                ViewUtil.empty(_this.rootElm);
                _this.rootElm.append(_this.imageCard.rootElm);
                _this.isLoaded = true;
                if (_this._onLoadEnd)
                    _this._onLoadEnd();
            });
    };
    ImageBox.imageBoxes = [];
    return ImageBox;
}());
//# sourceMappingURL=ImageBox.js.map
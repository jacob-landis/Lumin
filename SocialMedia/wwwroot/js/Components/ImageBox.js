var ImageBox = (function () {
    function ImageBox(rootElm, imageClassList, tooltipMsg, click, getThumbNail) {
        this.heldTooltipMsg = null;
        this.imageCard = null;
        this.isLoaded = false;
        this.getThumbNail = getThumbNail;
        this.heldTooltipMsg = tooltipMsg;
        this.heldImageClassList = imageClassList;
        this.heldImageClick = click ? click : function (target) { };
        this.rootElm = rootElm;
        this.rootElm.classList.add('image-box');
        ImageBox.imageBoxes.push(this);
    }
    ImageBox.copy = function (imageBox) {
        var imageCard = ImageCard.copy(imageBox.imageCard);
        var imageBoxCopy = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.rootElm.title, imageCard.onImageClick, true);
        imageBox.loadImage(imageCard);
        return imageBoxCopy;
    };
    ImageBox.list = function (imageCards) {
        var imageBoxes = [];
        imageCards.forEach(function (imageCard) {
            var imageBox = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.rootElm.title, imageCard.onImageClick, true);
            imageBox.loadImage(imageCard);
            imageBoxes.push(imageBox);
        });
        return imageBoxes;
    };
    Object.defineProperty(ImageBox.prototype, "height", {
        get: function () { return this.imageCard != null ? this.imageCard.image.height : 0; },
        set: function (height) { this.rootElm.style.height = "" + height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "width", {
        get: function () { return this.imageCard != null ? this.imageCard.image.width : 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "onLoadEnd", {
        set: function (onLoadEnd) { this._onLoadEnd = onLoadEnd; },
        enumerable: true,
        configurable: true
    });
    ImageBox.prototype.load = function (imageId, classList, toolTipMsg, click) {
        this.heldImageId = imageId;
        this.heldImageClassList = classList ? classList : this.heldImageClassList;
        this.heldTooltipMsg = toolTipMsg ? toolTipMsg : this.heldTooltipMsg;
        this.heldImageClick = click ? click : this.heldImageClick;
        this.isLoaded = false;
        this.reload();
    };
    ImageBox.prototype.loadImage = function (imageCard) {
        this.imageCard = imageCard;
        this.imageCard.parentImageBox = this;
        ViewUtil.empty(this.rootElm);
        if (this.heldImageClassList)
            ViewUtil.addClassList(this.heldImageClassList, imageCard.rootElm);
        if (this.heldTooltipMsg)
            imageCard.tooltipMsg = this.heldTooltipMsg;
        if (this.heldImageClick)
            imageCard.onImageClick = this.heldImageClick;
        this.rootElm.append(imageCard.rootElm);
        this.isLoaded = true;
        if (this._onLoadEnd)
            this._onLoadEnd();
    };
    ImageBox.prototype.unload = function () {
        ViewUtil.empty(this.rootElm);
        if (this.imageCard != null)
            delete this.imageCard;
        this.isLoaded = false;
    };
    ImageBox.prototype.reload = function () {
        var _this = this;
        if (!this.isLoaded) {
            this.rootElm.classList.add('loadingImage');
            Ajax.getImage(this.heldImageId, this.getThumbNail, this.heldImageClassList, this.heldTooltipMsg, this.heldImageClick, function (imageCard) {
                _this.unload();
                _this.isLoaded = true;
                _this.imageCard = imageCard;
                _this.imageCard.parentImageBox = _this;
                ViewUtil.empty(_this.rootElm);
                _this.rootElm.append(_this.imageCard.rootElm);
                if (_this._onLoadEnd)
                    _this._onLoadEnd();
                _this.rootElm.classList.remove('loadingImage');
            });
        }
    };
    ImageBox.imageBoxes = [];
    return ImageBox;
}());
//# sourceMappingURL=ImageBox.js.map
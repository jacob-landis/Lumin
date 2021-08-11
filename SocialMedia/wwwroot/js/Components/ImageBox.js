var ImageBox = (function () {
    function ImageBox(rootElm, imageClassList, tooltipMsg, click, size) {
        this.imageBoxes = [];
        this.heldTooltipMsg = null;
        this.imageCard = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.loadingGif = null;
        this.size = size;
        this.heldTooltipMsg = tooltipMsg;
        this.heldImageClassList = imageClassList;
        this.heldImageClick = click ? click : function (target) { };
        this.rootElm = rootElm;
        this.rootElm.classList.add('image-box');
        this.imageBoxes.push(this);
    }
    ImageBox.copy = function (imageBox) {
        var imageCard = ImageCard.copy(imageBox.imageCard);
        var imageBoxCopy = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.rootElm.title, imageCard.onImageClick, imageBox.size);
        imageBox.loadImage(imageCard);
        return imageBoxCopy;
    };
    ImageBox.list = function (imageCards) {
        if (imageCards == null)
            return null;
        var imageBoxes = [];
        imageCards.forEach(function (imageCard) {
            var imageBox = new ImageBox(ViewUtil.tag("div"), imageCard.rootElm.classList.value, imageCard.rootElm.title, imageCard.onImageClick, 1);
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
        ViewUtil.empty(this.rootElm);
        this.reload();
    };
    ImageBox.prototype.loadImage = function (imageCard) {
        this.setImageCard(imageCard);
        if (this.heldImageClassList)
            ViewUtil.addClassList(this.heldImageClassList, imageCard.rootElm);
        if (this.heldTooltipMsg)
            imageCard.tooltipMsg = this.heldTooltipMsg;
        if (this.heldImageClick)
            imageCard.onImageClick = this.heldImageClick;
    };
    ImageBox.prototype.unload = function () {
        if (this.imageCard != null) {
            this.rootElm.style.minHeight = "" + this.rootElm.clientHeight;
            this.rootElm.style.minWidth = "" + this.rootElm.clientWidth;
            delete this.imageCard;
        }
        ViewUtil.empty(this.rootElm);
        this.isLoaded = false;
    };
    ImageBox.prototype.reload = function () {
        var _this = this;
        if (!this.isLoaded && !this.isLoading) {
            this.rootElm.classList.add('loadingImage');
            if (this.loadingGif == null)
                this.loadingGif = ViewUtil.tag("img", { classList: "loadingGif" });
            if (!this.rootElm.contains(this.loadingGif)) {
                this.loadingGif.src = "/ImgStatic/Loading.gif";
                this.rootElm.append(this.loadingGif);
            }
            this.isLoading = true;
            Ajax.getImage(this.heldImageId, this.size, this.heldImageClassList, this.heldTooltipMsg, this.heldImageClick, function (imageCard) {
                _this.unload();
                _this.setImageCard(imageCard);
                _this.rootElm.classList.remove('loadingImage');
                _this.isLoading = false;
            });
        }
    };
    ImageBox.prototype.setImageCard = function (imageCard) {
        this.imageCard = imageCard;
        this.heldImageId = this.imageCard.image.imageId;
        this.imageCard.parentImageBox = this;
        ViewUtil.empty(this.rootElm);
        this.rootElm.append(this.imageCard.rootElm);
        this.isLoaded = true;
        if (this._onLoadEnd)
            this._onLoadEnd();
    };
    return ImageBox;
}());
//# sourceMappingURL=ImageBox.js.map
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
                _this.isLoaded = true;
                _this.unload();
                _this.imageCard = imageCard;
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
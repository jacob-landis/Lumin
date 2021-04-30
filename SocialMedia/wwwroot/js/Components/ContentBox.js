var ContentBox = (function () {
    function ContentBox(rootElm, scrollElm, loadThreshold, take, requestCallback) {
        var _this = this;
        this.scrollOverride = null;
        this.loading = false;
        this.moreContent = true;
        this.content = [];
        this.requestCallback = null;
        this.onLoadEnd = null;
        this.staged = new StageFlag();
        this.rootElm = rootElm;
        this.messageElm = ViewUtil.tag('div', { classList: 'contentMessage' });
        this.contentElm = ViewUtil.tag('div', { classList: 'contentContainer' });
        this.rootElm.append(this.messageElm, this.contentElm);
        this.rootElm.classList.add('content-box');
        this.scrollElm = scrollElm ? scrollElm : this.rootElm;
        this.loadThreshold = loadThreshold ? loadThreshold : 350;
        if (take)
            this.take = take;
        if (requestCallback)
            this.requestCallback = requestCallback;
        this.scrollElm.addEventListener("wheel", function (event) {
            if (_this.scrollOverride != null) {
                _this.scrollOverride(event);
                return;
            }
            if (_this.requestCallback != null && _this.content.length != 0) {
                _this.lazyLoad();
                _this.getVisibleContent().forEach(function (card) { return card.alertVisible(); });
            }
        });
        ContentBox.contentBoxes.push(this);
    }
    Object.defineProperty(ContentBox.prototype, "length", {
        get: function () { return this.content.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentBox.prototype, "hasContent", {
        get: function () { return this.length > 0; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentBox.prototype, "height", {
        get: function () { return Util.getElmHeight(this.rootElm); },
        set: function (height) {
            this.rootElm.style.height = "" + height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentBox.prototype, "width", {
        get: function () { return Util.getElmWidth(this.rootElm); },
        enumerable: true,
        configurable: true
    });
    ContentBox.prototype.lazyLoad = function () {
        var divHeight = this.scrollElm.scrollHeight;
        var offset = this.scrollElm.scrollTop + this.scrollElm.clientHeight;
        if ((offset + this.loadThreshold) > divHeight)
            this.request();
    };
    ContentBox.prototype.getVisibleContent = function () {
        var visibleContent = [];
        var scrollPort = this.scrollElm.getBoundingClientRect();
        this.content.forEach(function (contentItem) {
            var item = contentItem.rootElm.getBoundingClientRect();
            var topIsInLocalViewport = item.top < scrollPort.bottom && item.top > scrollPort.top;
            var bottomIsInLocalViewport = item.bottom < scrollPort.bottom && item.bottom > scrollPort.top;
            var topIsInGlobalViewport = item.top < window.innerHeight && item.top > 0;
            var bottomIsInGlobalViewport = item.bottom < window.innerHeight && item.bottom > 0;
            var partiallyInLocalViewport = topIsInLocalViewport || bottomIsInLocalViewport;
            var partiallyInGlobalViewport = topIsInGlobalViewport || bottomIsInGlobalViewport;
            if (partiallyInLocalViewport && partiallyInGlobalViewport)
                visibleContent.push(contentItem);
        });
        return visibleContent;
    };
    ContentBox.prototype.request = function (take) {
        if (!this.loading && this.moreContent) {
            if (take)
                this.take = take;
            this.loading = true;
            this.requestCallback(this.length, this.take);
        }
    };
    ContentBox.prototype.add = function (content, prepend) {
        var _this = this;
        var isFirstBatch = this.content.length == 0;
        if (!Array.isArray(content))
            content = [content];
        if (this.loading && content.length < this.take)
            this.moreContent = false;
        content.forEach(function (content) {
            if (content != null) {
                if (prepend == true) {
                    _this.content.unshift(content);
                    _this.contentElm.prepend(content.rootElm);
                }
                else {
                    _this.content.push(content);
                    _this.contentElm.append(content.rootElm);
                }
            }
        });
        if (this.requestCallback) {
            this.moreContent = this.take == content.length;
            this.loading = false;
            if (isFirstBatch && this.onLoadEnd != null)
                this.onLoadEnd();
        }
    };
    ContentBox.prototype.clear = function () {
        this.content = [];
        ViewUtil.empty(this.contentElm);
        this.loading = false;
        this.moreContent = true;
    };
    ContentBox.prototype.refresh = function (onRefreshEnd) { };
    ContentBox.contentBoxes = [];
    return ContentBox;
}());
//# sourceMappingURL=ContentBox.js.map
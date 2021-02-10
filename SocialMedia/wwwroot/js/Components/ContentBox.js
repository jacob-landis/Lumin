var ContentBox = (function () {
    function ContentBox(rootElm, scrollElm, take, requestCallback) {
        var _this = this;
        this.loading = false;
        this.moreContent = true;
        this.content = [];
        this.visibleContent = [];
        this.rootElm = rootElm;
        this.rootElm.classList.add('content-box');
        this.scrollElm = scrollElm ? scrollElm : this.rootElm;
        if (take)
            this.take = take;
        if (requestCallback)
            this.requestCallback = requestCallback;
        this.scrollElm.addEventListener("wheel", function (event) {
            var divHeight = _this.scrollElm.scrollHeight;
            var offset = _this.scrollElm.scrollTop + _this.scrollElm.clientHeight;
            if ((offset + 500) > divHeight)
                _this.request();
            _this.visibleContent = [];
            var portTop = _this.scrollElm.scrollTop;
            var portBottom = portTop + _this.scrollElm.parentElement.clientHeight;
            _this.content.forEach(function (contentItem) {
                var isTestPost = contentItem.post.postId == 50013;
                var item = contentItem.rootElm.getBoundingClientRect();
                var topIsInLocalViewport = item.top < portBottom && item.top > portTop;
                var bottomIsInLocalViewport = item.bottom < portBottom && item.bottom > portTop;
                var topIsInGlobalViewport = item.top < (window.innerHeight + portBottom) && item.top > 0;
                var bottomIsInGlobalViewport = item.bottom < (window.innerHeight + portBottom) && item.bottom > 0;
                var partiallyInLocalViewport = topIsInLocalViewport || bottomIsInLocalViewport;
                var partiallyInGlobalViewport = topIsInGlobalViewport || bottomIsInGlobalViewport;
                if (partiallyInLocalViewport && isTestPost) {
                    _this.visibleContent.push(contentItem);
                }
                if (isTestPost) {
                    console.log(item.top);
                    console.log(item.bottom);
                    console.log(portTop);
                    console.log(portBottom);
                }
            });
            console.log(_this.visibleContent);
        });
        ContentBox.contentBoxes.push(this);
    }
    Object.defineProperty(ContentBox.prototype, "length", {
        get: function () { return this.content.length; },
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
    ContentBox.prototype.onScroll = function () {
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
        if (!Array.isArray(content))
            content = [content];
        if (this.loading && content.length < this.take)
            this.moreContent = false;
        content.forEach(function (content) {
            if (content != null) {
                if (prepend == true) {
                    _this.content.unshift(content);
                    _this.rootElm.prepend(content.rootElm);
                }
                else {
                    _this.content.push(content);
                    _this.rootElm.append(content.rootElm);
                }
            }
        });
        if (this.requestCallback) {
            this.moreContent = this.take == content.length;
            this.loading = false;
        }
    };
    ContentBox.prototype.clear = function () {
        this.content = [];
        ViewUtil.empty(this.rootElm);
        this.loading = false;
        this.moreContent = true;
    };
    ContentBox.contentBoxes = [];
    return ContentBox;
}());
//# sourceMappingURL=ContentBox.js.map
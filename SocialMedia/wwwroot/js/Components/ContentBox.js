var ContentBox = (function () {
    function ContentBox(rootElm, take, requestCallback) {
        this.loading = false;
        this.moreContent = true;
        this.content = [];
        this.rootElm = rootElm;
        this.rootElm.classList.add('content-box');
        if (take)
            this.take = take;
        if (requestCallback)
            this.requestCallback = requestCallback;
        ContentBox.contentBoxes.push(this);
    }
    Object.defineProperty(ContentBox.prototype, "length", {
        get: function () { return this.content.length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentBox.prototype, "height", {
        get: function () { return Util.getElmHeight(this.rootElm); },
        set: function (height) { this.rootElm.style.height = "" + height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContentBox.prototype, "width", {
        get: function () { return Util.getElmWidth(this.rootElm); },
        enumerable: true,
        configurable: true
    });
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
        content.forEach(function (c) {
            if (c != null) {
                if (prepend) {
                    _this.content.unshift(c);
                    _this.rootElm.prepend(c.rootElm);
                }
                else {
                    _this.content.push(c);
                    _this.rootElm.append(c.rootElm);
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
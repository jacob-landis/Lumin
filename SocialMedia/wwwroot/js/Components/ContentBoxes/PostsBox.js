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
var PostsBox = (function (_super) {
    __extends(PostsBox, _super);
    function PostsBox(profileId, rootElm, scrollElm, feedType, getFeedFilter, onPostsLoadEnd) {
        var _this = _super.call(this, rootElm, scrollElm, 1500, 3, function (skip, take) {
            if (skip == 0)
                _this.contentElm.classList.add('contentLoading');
            if (profileId != null)
                Ajax.getProfilePosts(_this.profileId, skip, take, _this.getFeedFilter(), _this.feedType, function (postCards) {
                    _this.addPost(postCards);
                    if (onPostsLoadEnd != null)
                        onPostsLoadEnd();
                });
            else
                Ajax.getPublicPosts(skip, take, function (postCards) {
                    _this.addPost(postCards);
                    if (onPostsLoadEnd != null)
                        onPostsLoadEnd();
                });
        }) || this;
        _this.feedType = feedType;
        _this.getFeedFilter = getFeedFilter;
        _this.onPostsLoadEnd = onPostsLoadEnd;
        rootElm.classList.add('post-box');
        _this.profileId = profileId ? profileId : User.profileId;
        _this.messageElm.onclick = function (event) { return _this.collapseBox(); };
        _this.messageElm.title = 'Contract section';
        PostsBox.postBoxes.push(_this);
        return _this;
    }
    PostsBox.prototype.addPost = function (postCard) {
        var _this = this;
        this.onLoadEnd = function () {
            var stageFlags = [];
            _this.content.forEach(function (c) {
                var post = c;
                stageFlags.push(post.allStaged);
                post.stage.onStagingEnd = function () { return _this.stage.updateStaging(post.allStaged); };
            });
            _this.stage = new Stage(stageFlags, function () {
                _this.contentElm.classList.remove('contentLoading');
                _this.onPostsLoadEnd();
            });
            if (_this.content.length == 0)
                _this.stage.onStagingEnd();
        };
        this.add(postCard, !Array.isArray(postCard));
    };
    PostsBox.prototype.start = function () {
        this.request(5);
    };
    PostsBox.prototype.refreshPosts = function (onRefreshLoadEnd) {
        var _this = this;
        this.clear();
        Ajax.getProfilePosts(this.profileId, 0, 5, this.getFeedFilter(), this.feedType, function (postCards) {
            _this.addPost(postCards);
            if (onRefreshLoadEnd)
                onRefreshLoadEnd();
        });
    };
    PostsBox.prototype.collapseBox = function () {
        var _this = this;
        ViewUtil.hide(this.contentElm);
        this.messageElm.onclick = function (event) { return _this.expandBox(); };
        this.messageElm.title = 'Expand section';
    };
    PostsBox.prototype.expandBox = function () {
        var _this = this;
        ViewUtil.show(this.contentElm, 'block');
        this.messageElm.onclick = function (event) { return _this.collapseBox(); };
        this.messageElm.title = 'Collapse section';
    };
    PostsBox.postBoxes = [];
    return PostsBox;
}(ContentBox));
//# sourceMappingURL=PostsBox.js.map
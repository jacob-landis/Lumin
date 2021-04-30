var PublicPosts = (function () {
    function PublicPosts(postWrapper) {
        var _this = this;
        this.postBox = new PostsBox(null, postWrapper, null, null, null, function () {
            if (!_this.postBox.hasContent)
                _this.postBox.messageElm.innerHTML = "You have no posts or friends. Search for friends by clicking the \n                    <i class=\"fa fa-users helpIcon\" alt=\"users\"></i> button on the left side of the navigation bar.";
            else {
                _this.postBox.messageElm.innerHTML = '';
                _this.postBox.content.forEach(function (contentItem) {
                    var commentSectionElm = contentItem.commentsSection.commentBoxes.rootElm;
                    commentSectionElm.addEventListener('mouseenter', function (event) {
                        if (ViewUtil.isOverflowing(commentSectionElm))
                            _this.lockScrolling();
                    });
                    commentSectionElm.addEventListener('mouseleave', function (event) {
                        if (ViewUtil.isOverflowing(commentSectionElm))
                            _this.unlockScrolling();
                    });
                });
            }
        });
        this.postBox.start();
    }
    PublicPosts.prototype.lockScrolling = function () { this.postBox.scrollOverride = function (event) { return event.preventDefault(); }; };
    PublicPosts.prototype.unlockScrolling = function () { this.postBox.scrollOverride = null; };
    return PublicPosts;
}());
//# sourceMappingURL=PublicPosts.js.map
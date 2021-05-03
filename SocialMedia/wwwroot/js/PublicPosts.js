var PublicPosts = (function () {
    function PublicPosts(postWrapper) {
        var _this = this;
        this.postBox = new PostsBox(null, postWrapper, null, null, null, function () {
            if (!_this.postBox.hasContent)
                _this.postBox.messageElm.innerHTML = "You have no posts or friends. Search for friends by clicking the \n                    <i class=\"fa fa-users helpIcon\" alt=\"users\"></i> button on the left side of the navigation bar.";
            else {
                _this.postBox.messageElm.innerHTML = '';
            }
        });
        this.postBox.start();
    }
    return PublicPosts;
}());
//# sourceMappingURL=PublicPosts.js.map
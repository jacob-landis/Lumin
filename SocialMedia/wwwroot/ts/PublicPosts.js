var PublicPosts = /** @class */ (function () {
    function PublicPosts(postWrapper) {
        var _this = this;
        this.postBox = new PostsBox(null, postWrapper);
        this.postBox.start();
        window.addEventListener('scroll', function () {
            var docHeight = Util.getDocumentHeight();
            var offset = window.pageYOffset + window.innerHeight + 2000;
            if (offset >= docHeight && !_this.postBox.loading)
                _this.postBox.request(4);
        });
    }
    return PublicPosts;
}());
//# sourceMappingURL=PublicPosts.js.map
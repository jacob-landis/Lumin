var PublicPosts = (function () {
    function PublicPosts(postWrapper) {
        this.postBox = new PostsBox(null, postWrapper);
        this.postBox.start();
    }
    return PublicPosts;
}());
//# sourceMappingURL=PublicPosts.js.map
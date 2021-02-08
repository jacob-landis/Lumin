var NavBar = (function () {
    function NavBar() {
    }
    NavBar.initialize = function (navBarElm, postsSectionElm) {
        var _this = this;
        this.navBarElm = navBarElm;
        this.postsSectionElm = postsSectionElm;
        this.postsSectionElm.addEventListener('wheel', function (event) {
            if (event.deltaY > 0)
                _this.reduceHeight(event.deltaY);
            else
                _this.show();
        });
        this.show();
    };
    NavBar.updatePostsSection = function (navBarHeightChange) {
        this.postsSectionElm.style.paddingTop = "" + this.navBarElm.clientHeight;
        this.postsSectionElm.scrollTop += navBarHeightChange;
    };
    NavBar.show = function () {
        var heightBenchMarker = this.navBarElm.clientHeight;
        this.updatePostsSection(heightBenchMarker - this.navBarElm.clientHeight);
    };
    NavBar.reduceHeight = function (scrollIntensity) {
        var heightBenchMarker = this.navBarElm.clientHeight;
        this.updatePostsSection(heightBenchMarker - this.navBarElm.clientHeight);
    };
    return NavBar;
}());
//# sourceMappingURL=NavBar.js.map
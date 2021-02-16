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
        window.onmousemove = function (event) { if (event.pageY < 50)
            _this.show(); };
        this.show();
    };
    NavBar.updatePostsSection = function () {
        this.postsSectionElm.style.paddingTop = "" + this.navBarElm.clientHeight;
    };
    NavBar.show = function () {
        this.navBarElm.style.height = '50px';
        this.updatePostsSection();
    };
    NavBar.reduceHeight = function (scrollIntensity) {
        var reductionRate = 0.1;
        var newHeight = "" + (this.navBarElm.clientHeight - (scrollIntensity * reductionRate));
        if (+newHeight > 35)
            this.navBarElm.style.height = newHeight;
        else
            this.hide();
        this.updatePostsSection();
    };
    NavBar.hide = function () {
        this.navBarElm.style.height = '0';
    };
    return NavBar;
}());
//# sourceMappingURL=NavBar.js.map
var NavBar = (function () {
    function NavBar(navBarElm, postsSectionElm, btnOpenUserProfileModal) {
        var _this = this;
        this.lastScrollTop = 0;
        this.navBarElm = navBarElm;
        this.postsSectionElm = postsSectionElm;
        this.btnOpenUserProfileModalImageBox = new ImageBox(btnOpenUserProfileModal, '', null, true);
        this.btnOpenUserProfileModalImageBox.load(User.profilePictureId);
        document.getElementById('btnOpenHelpModal').onclick = function (e) { return helpModal.open(); };
        document.getElementById('btnOpenUserProfileModal').onclick = function (e) { return profileModal.load(User.profileId); };
        document.getElementById('btnCreatePost').onclick = function (e) { return createPostModal.load(); };
        document.getElementById('btnShowFriends').onclick = function (e) { return friendDropdown.toggle(); };
        document.getElementById('btnShowImages').onclick = function (e) { return imageDropdown.toggle(); };
        this.postsSectionElm.addEventListener('wheel', function (event) {
            if (_this.postsSectionElm.scrollTop != _this.lastScrollTop) {
                event.deltaY > 0 ? _this.reduceHeight(event.deltaY) : _this.show();
                _this.lastScrollTop = _this.postsSectionElm.scrollTop;
            }
        });
        window.onmousemove = function (event) { if (event.pageY < 50)
            _this.show(); };
        this.show();
    }
    NavBar.prototype.updatePostsSection = function () {
        this.postsSectionElm.style.paddingTop = "" + this.navBarElm.clientHeight;
    };
    NavBar.prototype.show = function () {
        this.navBarElm.style.height = '50px';
        this.updatePostsSection();
    };
    NavBar.prototype.reduceHeight = function (scrollIntensity) {
        var reductionRate = 0.1;
        var newHeight = "" + (this.navBarElm.clientHeight - (scrollIntensity * reductionRate));
        if (+newHeight > 35)
            this.navBarElm.style.height = newHeight;
        else
            this.hide();
        this.updatePostsSection();
        Dropdown.closeAny();
    };
    NavBar.prototype.hide = function () {
        this.navBarElm.style.height = '0';
    };
    return NavBar;
}());
//# sourceMappingURL=NavBar.js.map
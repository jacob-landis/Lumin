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
var ProfilePostsCard = (function (_super) {
    __extends(ProfilePostsCard, _super);
    function ProfilePostsCard(rootElm, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, btnSearchPosts, txtSearchPosts, commentedPostsBoxWrapper, likedPostsBoxWrapper, mainPostsBoxWrapper) {
        var _this = _super.call(this, rootElm) || this;
        _this.btnTogglePostFeedFilter = btnTogglePostFeedFilter;
        _this.btnSearchPosts = btnSearchPosts;
        _this.txtSearchPosts = txtSearchPosts;
        _this.feedFilter = 'recent';
        _this.commentedPostsStaged = new StageFlag();
        _this.likedPostsStaged = new StageFlag();
        _this.mainPostsStaged = new StageFlag();
        _this.btnToggleSearchBar = new ToggleButton(null, 'fa-search', 'fa-times', 'Open search bar', 'Close search bar', btnToggleSearchBar.childNodes[1], btnToggleSearchBar, function () { return _this.showSearchBar(); }, function () { return _this.hideSearchBar(); });
        _this.btnMyPostActivity = new ToggleButton(null, '', 'showingMyPostActivity', 'Show my activity', 'Hide my activity', null, btnMyPostActivity, function () { return _this.showMyPostActivity(); }, function () { return _this.hideMyPostActivity(); });
        _this.btnSearchPosts.onclick = function (e) { return _this.searchPosts(); };
        _this.txtSearchPosts.onkeyup = function (e) { if (e.keyCode == 13)
            _this.btnSearchPosts.click(); };
        _this.btnTogglePostFeedFilter.onclick = function (event) { return _this.togglePostFeedFilter(); };
        btnRefreshProfilePostFeed.onclick = function (event) { return _this.refreshProfilePostFeed(); };
        _this.postBoxes = new ContentBox(_this.rootElm);
        _this.commentedPostsBox = new PostsBox(0, commentedPostsBoxWrapper, _this.rootElm, 'commentedPosts', function () { return _this.feedFilter; }, function () {
            _this.commentedPostsBox.messageElm.innerText = 'Comment Activity Posts';
            _this.postBoxesStage.updateStaging(_this.commentedPostsStaged);
            _this.commentedPostsBox.content.forEach(function (content) {
                var postCard = content;
                postCard.commentsSection.showCommentActivity(function () { return postCard.stage.updateStaging(postCard.commentsSection.allStaged); });
            });
        });
        _this.likedPostsBox = new PostsBox(0, likedPostsBoxWrapper, _this.rootElm, 'likedPosts', function () { return _this.feedFilter; }, function () {
            _this.likedPostsBox.messageElm.innerText = 'Liked Posts';
            _this.postBoxesStage.updateStaging(_this.likedPostsStaged);
        });
        _this.mainPostsBox = new PostsBox(0, mainPostsBoxWrapper, _this.rootElm, 'mainPosts', function () { return _this.feedFilter; }, function () {
            _this.mainPostsBox.messageElm.innerText = 'All Posts';
            _this.postBoxesStage.updateStaging(_this.mainPostsStaged);
        });
        return _this;
    }
    ProfilePostsCard.prototype.load = function (profileId) {
        var _this = this;
        this.profileId = profileId;
        this.postBoxesStage = new Stage([this.mainPostsStaged], function () { return _this.displayPosts(); });
        this.mainPostsBox.onLoadEnd = function () { return _this.postBoxesStage.updateStaging(_this.mainPostsStaged); };
        this.mainPostsBox.profileId = profileId;
        this.mainPostsBox.start();
    };
    ProfilePostsCard.prototype.togglePostFeedFilter = function () {
        var _this = this;
        var feedFilterSecondIcon = this.btnTogglePostFeedFilter.children[1];
        switch (this.feedFilter) {
            case 'recent': {
                this.feedFilter = 'likes';
                this.btnTogglePostFeedFilter.title = 'Sort by comment popularity';
                feedFilterSecondIcon.classList.remove('fa-thumbs-up');
                feedFilterSecondIcon.classList.add('fa-comments');
                break;
            }
            case 'likes': {
                this.feedFilter = 'comments';
                this.btnTogglePostFeedFilter.title = 'Sort by recent';
                feedFilterSecondIcon.classList.remove('fa-comments');
                feedFilterSecondIcon.classList.add('fa-calendar');
                break;
            }
            case 'comments': {
                this.feedFilter = 'recent';
                this.btnTogglePostFeedFilter.title = 'Sort by like popularity';
                feedFilterSecondIcon.classList.remove('fa-calendar');
                feedFilterSecondIcon.classList.add('fa-thumbs-up');
                break;
            }
        }
        this.mainPostsBox.clear();
        this.mainPostsBox.requestCallback = function (skip, take) {
            Ajax.getProfilePosts(_this.profileId, skip, take, _this.feedFilter, 'mainPosts', function (postCards) {
                if (postCards == null)
                    return;
                _this.mainPostsBox.add(postCards);
            });
        };
        this.mainPostsBox.start();
    };
    ProfilePostsCard.prototype.refreshProfilePostFeed = function () {
        var _this = this;
        this.postBoxesStage = new Stage([this.mainPostsStaged], function () { return _this.displayPosts(); });
        ViewUtil.hide(this.postBoxes.rootElm);
        this.mainPostsBox.refreshPosts(function () {
            if (_this.commentedPostsBox.length > 0 || _this.likedPostsBox.length > 0)
                _this.mainPostsBox.messageElm.innerText = 'All Posts';
            _this.postBoxesStage.updateStaging(_this.mainPostsStaged);
        });
        if (this.commentedPostsBox.length > 0) {
            this.postBoxesStage.stageFlags.push(this.commentedPostsStaged);
            this.commentedPostsBox.refreshPosts(function () { return _this.postBoxesStage.updateStaging(_this.commentedPostsStaged); });
        }
        if (this.likedPostsBox.length > 0) {
            this.postBoxesStage.stageFlags.push(this.likedPostsStaged);
            this.likedPostsBox.refreshPosts(function () { return _this.postBoxesStage.updateStaging(_this.likedPostsStaged); });
        }
    };
    ProfilePostsCard.prototype.searchPosts = function () {
        var _this = this;
        Ajax.searchPosts(this.profileId, 0, 5, this.txtSearchPosts.value, function (postCards) {
            _this.mainPostsBox.clear();
            if (postCards != null && postCards.length != 0) {
                _this.hideMyPostActivity();
                _this.mainPostsBox.add(postCards);
                _this.mainPostsBox.messageElm.innerText = 'Search results';
            }
            else
                _this.mainPostsBox.messageElm.innerText = 'Search results - No posts found';
        });
    };
    ProfilePostsCard.prototype.showSearchBar = function () {
        ViewUtil.show(this.txtSearchPosts);
        ViewUtil.show(this.btnSearchPosts);
        this.btnToggleSearchBar.toggle();
        this.txtSearchPosts.focus();
    };
    ProfilePostsCard.prototype.hideSearchBar = function () {
        ViewUtil.hide(this.txtSearchPosts);
        ViewUtil.hide(this.btnSearchPosts);
        this.txtSearchPosts.value = '';
        this.btnToggleSearchBar.toggle();
        this.mainPostsBox.clear();
        this.mainPostsBox.request(15);
        this.mainPostsBox.messageElm.innerText = '';
    };
    ProfilePostsCard.prototype.showMyPostActivity = function () {
        var _this = this;
        this.postBoxesStage = new Stage([this.commentedPostsStaged, this.likedPostsStaged], function () { return _this.displayPosts(); });
        ViewUtil.hide(this.postBoxes.rootElm);
        this.commentedPostsBox.request(15);
        this.likedPostsBox.request(15);
        this.setBtnMyPostActivity(false);
    };
    ProfilePostsCard.prototype.hideMyPostActivity = function () {
        this.commentedPostsBox.clear();
        this.likedPostsBox.clear();
        this.commentedPostsBox.messageElm.innerText = '';
        this.likedPostsBox.messageElm.innerText = '';
        this.mainPostsBox.messageElm.innerText = '';
        this.setBtnMyPostActivity(true);
    };
    ProfilePostsCard.prototype.setBtnMyPostActivity = function (makeBtnShowActivity) {
        this.mainPostsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Posts';
        this.btnMyPostActivity.toggle();
    };
    ProfilePostsCard.prototype.displayPosts = function () {
        ViewUtil.show(this.postBoxes.rootElm, 'block');
    };
    ProfilePostsCard.prototype.clear = function () {
        this.hideMyPostActivity();
        this.mainPostsBox.clear();
        this.mainPostsBox.messageElm.innerText = '';
    };
    return ProfilePostsCard;
}(Card));
//# sourceMappingURL=ProfilePostsCard.js.map
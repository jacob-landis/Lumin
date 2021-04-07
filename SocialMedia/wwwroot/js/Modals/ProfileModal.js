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
var ProfileModal = (function (_super) {
    __extends(ProfileModal, _super);
    function ProfileModal(rootElm, content, profileNameWrapper, postBoxesWrapper, mainPostsBoxWrapper, likedPostsBoxWrapper, commentedPostsBoxWrapper, imageWrapper, profileBioWrapper, imageBoxElm, imageScrollBox, friendBoxElm, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, imageClassList, editorClassList, doubleEditorClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.feedFilter = 'recent';
        _this.fullProfileStaged = new StageFlag();
        _this.imagesBoxStaged = new StageFlag();
        _this.friendsStaged = new StageFlag();
        _this.commentedPostsStaged = new StageFlag();
        _this.likedPostsStaged = new StageFlag();
        _this.mainPostsStaged = new StageFlag();
        _this.content = content;
        _this.postBoxesWrapper = postBoxesWrapper;
        _this.commentedPostsBoxWrapper = commentedPostsBoxWrapper;
        _this.likedPostsBoxWrapper = likedPostsBoxWrapper;
        _this.mainPostsBoxWrapper = mainPostsBoxWrapper;
        _this.imageWrapper = imageWrapper;
        _this.profileNameWrapper = profileNameWrapper;
        _this.profileBioWrapper = profileBioWrapper;
        _this.imageScrollBox = imageScrollBox;
        _this.friendBoxElm = friendBoxElm;
        _this.btnTogglePostFeedFilter = btnTogglePostFeedFilter;
        _this.btnRefreshProfilePostFeed = btnRefreshProfilePostFeed;
        _this.btnChangeName = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' });
        _this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });
        _this.btnMyPostActivity = new ToggleButton(null, '', 'showingMyPostActivity', 'Show my activity', 'Hide my activity', null, btnMyPostActivity, function () { return _this.showMyPostActivity(); }, function () { return _this.hideMyPostActivity(); });
        _this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        _this.nameEditor = new DoubleEditor(_this.btnChangeName, '', '', doubleEditorClassList, 30, function (firstName, lastName) {
            ProfileCard.changeUserProfileName(firstName, lastName);
            Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
        });
        _this.profileNameWrapper.append(_this.nameEditor.rootElm);
        _this.bioEditor = new Editor(_this.btnChangeBio, '', editorClassList, true, 250, function (bio) { return Ajax.updateBio(bio); });
        _this.profileBioWrapper.append(_this.bioEditor.rootElm);
        _this.btnTogglePostFeedFilter.onclick = function (event) { return _this.togglePostFeedFilter(); };
        _this.btnRefreshProfilePostFeed.onclick = function (event) { return _this.refreshProfilePostFeed(); };
        _this.postBoxes = new ContentBox(_this.postBoxesWrapper);
        _this.commentedPostsBox = new PostsBox(0, _this.commentedPostsBoxWrapper, _this.rootElm, function () {
            _this.commentedPostsBox.messageElm.innerText = 'Comment Activity Posts';
            _this.postBoxesStage.updateStaging(_this.commentedPostsStaged);
            _this.commentedPostsBox.content.forEach(function (content) {
                var postCard = content;
                postCard.commentsSection.showCommentActivity(function () { return postCard.stage.updateStaging(postCard.commentsSection.allStaged); });
            });
        });
        _this.likedPostsBox = new PostsBox(0, _this.likedPostsBoxWrapper, _this.rootElm, function () {
            _this.likedPostsBox.messageElm.innerText = 'Liked Posts';
            _this.postBoxesStage.updateStaging(_this.likedPostsStaged);
        });
        _this.mainPostsBox = new PostsBox(0, _this.mainPostsBoxWrapper, _this.rootElm, function () {
            _this.mainPostsBox.messageElm.innerText = 'All Posts';
            _this.postBoxesStage.updateStaging(_this.mainPostsStaged);
        });
        _this.summaryStageContainers = [
            _this.profilePictureBox.rootElm, _this.profileNameWrapper,
            _this.profileBioWrapper, _this.friendBoxElm, _this.imageScrollBox
        ];
        _this.summaryStage = new Stage([_this.fullProfileStaged, _this.imagesBoxStaged, _this.friendsStaged], function () {
            _this.summaryStageContainers.forEach(function (container) {
                ViewUtil.show(container, null, function () {
                    container.style.opacity = '1';
                });
            });
        });
        return _this;
    }
    ProfileModal.prototype.load = function (profileId) {
        var _this = this;
        this.reset();
        Ajax.getFullProfile(profileId, function (fullProfile) {
            _this.profile = fullProfile;
            _this.nameEditor.setText2(_this.profile.firstName, _this.profile.lastName);
            _this.bioEditor.setText(_this.profile.bio);
            _this.profilePictureBox.loadImage(new ImageCard(_this.profile.profilePicture));
            _this.summaryStage.updateStaging(_this.fullProfileStaged);
        });
        if (profileId == User.profileId) {
            this.profilePictureBox.heldImageClick = function (target) { return _this.selectProfilePicture(); };
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';
            this.profileNameWrapper.append(this.btnChangeName);
            this.profileBioWrapper.append(this.btnChangeBio);
        }
        else {
            this.profilePictureBox.heldImageClick = function (target) { return fullSizeImageModal.loadSingle(target.image.imageId); };
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';
            ViewUtil.remove(this.btnChangeName);
            ViewUtil.remove(this.btnChangeBio);
        }
        this.imagesBox = new ProfileImagesBox(profileId, 'Fullscreen', this.imageScrollBox, function (target) {
            return fullSizeImageModal.load(_this.imagesBox.content.indexOf(target), profileId);
        });
        this.imagesBox.onLoadEnd = function () { return _this.summaryStage.updateStaging(_this.imagesBoxStaged); };
        this.imageWrapper.append(this.imagesBox.rootElm);
        Ajax.getFriends(profileId, null, function (profileCards) {
            _this.friendBox.add(profileCards);
            _this.summaryStage.updateStaging(_this.friendsStaged);
        });
        this.postBoxesStage = new Stage([this.mainPostsStaged], function () { return _this.displayPosts(); });
        this.mainPostsBox.onLoadEnd = function () { return _this.postBoxesStage.updateStaging(_this.mainPostsStaged); };
        this.mainPostsBox.profileId = profileId;
        this.mainPostsBox.start();
        _super.prototype.open.call(this);
    };
    ProfileModal.prototype.togglePostFeedFilter = function () {
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
            Ajax.getProfilePosts(_this.profile.profileId, skip, take, _this.feedFilter, function (postCards) {
                if (postCards == null)
                    return;
                _this.mainPostsBox.add(postCards);
            });
        };
        this.mainPostsBox.start();
    };
    ProfileModal.prototype.refreshProfilePostFeed = function () {
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
    ProfileModal.prototype.showMyPostActivity = function () {
        var _this = this;
        this.postBoxesStage = new Stage([this.commentedPostsStaged, this.likedPostsStaged], function () { return _this.displayPosts(); });
        ViewUtil.hide(this.postBoxes.rootElm);
        this.commentedPostsBox.request(15);
        this.likedPostsBox.request(15);
        this.setBtnMyPostActivity(false);
    };
    ProfileModal.prototype.hideMyPostActivity = function () {
        this.commentedPostsBox.clear();
        this.likedPostsBox.clear();
        this.commentedPostsBox.messageElm.innerText = '';
        this.likedPostsBox.messageElm.innerText = '';
        this.mainPostsBox.messageElm.innerText = '';
        this.setBtnMyPostActivity(true);
    };
    ProfileModal.prototype.setBtnMyPostActivity = function (makeBtnShowActivity) {
        this.mainPostsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Posts';
        this.btnMyPostActivity.toggle();
    };
    ProfileModal.prototype.displayPosts = function () {
        ViewUtil.show(this.postBoxes.rootElm, 'block');
    };
    ProfileModal.prototype.selectProfilePicture = function () {
        var _this = this;
        imageDropdown.load(User.profileId, "Select a profile picture", "Set profile picture", function (target) {
            imageDropdown.close();
            imageDropdown.rootElm.style.zIndex = '0';
            ProfileCard.changeUserProfilePicture(target);
            User.profilePictureId = target.image.imageId;
            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target));
            _this.profilePictureBox.loadImage(ImageCard.copy(target, null, 'Change profile picture'));
            Ajax.updateProfilePicture(target.image.imageId, null, 'Change profile picture', null, function (imageCard) {
                return _this.profilePictureBox.loadImage(imageCard);
            });
        });
    };
    ProfileModal.prototype.reset = function () {
        ViewUtil.empty(this.imageWrapper);
        delete this.imagesBox;
        this.nameEditor.setText2('', '');
        this.bioEditor.setText('');
        this.friendBox = new ContentBox(this.friendBoxElm);
        this.friendBox.clear();
        this.mainPostsBox.clear();
        this.summaryStageContainers.forEach(function (container) {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });
        this.summaryStage.stageFlags.forEach(function (flag) { return flag.lower(); });
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
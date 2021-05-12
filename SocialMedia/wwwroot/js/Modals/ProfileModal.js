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
    function ProfileModal(rootElm, profileNameWrapper, imageWrapper, profileBioWrapper, imageScrollBox, friendBoxElm, relationWrapper, postBoxesWrapper, mainPostsBoxWrapper, likedPostsBoxWrapper, commentedPostsBoxWrapper, imageBoxElm, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, btnSearchPosts, txtSearchPosts, profileSettingsSection, btnToggleSettingsSection, selectProfilePictureSetting, selectBioSetting, selectImagesSetting, selectFriendsSetting, selectPostsSetting, imageClassList, editorClassList, doubleEditorClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.profileNameWrapper = profileNameWrapper;
        _this.imageWrapper = imageWrapper;
        _this.profileBioWrapper = profileBioWrapper;
        _this.imageScrollBox = imageScrollBox;
        _this.friendBoxElm = friendBoxElm;
        _this.relationWrapper = relationWrapper;
        _this.fullProfileStaged = new StageFlag();
        _this.imagesBoxStaged = new StageFlag();
        _this.friendsStaged = new StageFlag();
        _this.profileSettingsCard = new ProfileSettingsCard(profileSettingsSection, btnToggleSettingsSection, selectProfilePictureSetting, selectBioSetting, selectImagesSetting, selectFriendsSetting, selectPostsSetting);
        _this.profilePostsCard = new ProfilePostsCard(postBoxesWrapper, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, btnSearchPosts, txtSearchPosts, commentedPostsBoxWrapper, likedPostsBoxWrapper, mainPostsBoxWrapper);
        _this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        _this.nameEditor = new DoubleEditor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' }), '', '', doubleEditorClassList, 30, function (firstName, lastName) {
            ProfileCard.changeUserProfileName(firstName, lastName);
            Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
        });
        _this.bioEditor = new Editor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' }), '', editorClassList, true, 250, function (bio) { return Ajax.updateBio(bio); });
        _this.profileNameWrapper.append(_this.nameEditor.rootElm);
        _this.profileBioWrapper.append(_this.bioEditor.rootElm);
        _this.summaryStageContainers = [
            _this.profilePictureBox.rootElm, _this.profileNameWrapper, _this.profileBioWrapper,
            _this.friendBoxElm, _this.imageScrollBox, _this.relationWrapper
        ];
        _this.summaryStage = new Stage([_this.fullProfileStaged, _this.imagesBoxStaged, _this.friendsStaged], function () {
            return _this.summaryStageContainers.forEach(function (container) {
                return ViewUtil.show(container, null, function () { return container.style.opacity = '1'; });
            });
        });
        _this.friendBox = new ContentBox(_this.friendBoxElm);
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
        Ajax.getProfile(profileId, function (profileCard) {
            if (profileCard.profile.relationToUser != 'me')
                _this.relationWrapper.append(new RelationCard(profileCard.profile).rootElm);
        });
        if (profileId == User.profileId) {
            this.profilePictureBox.heldImageClick = function (target) { return _this.selectProfilePicture(); };
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';
            this.nameEditor.enableEditing();
            this.bioEditor.enableEditing();
        }
        else {
            this.profilePictureBox.heldImageClick = function (target) { return fullSizeImageModal.loadSingle(target.image.imageId); };
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';
            this.nameEditor.disableEditing();
            this.bioEditor.disableEditing();
        }
        this.imagesBox = new ProfileImagesBox(profileId, 'Fullscreen', this.imageScrollBox, function (target) {
            return fullSizeImageModal.load(_this.imagesBox.content.indexOf(target), profileId);
        });
        this.imagesBox.onLoadEnd = function () { return _this.summaryStage.updateStaging(_this.imagesBoxStaged); };
        this.imageWrapper.append(this.imagesBox.rootElm);
        Ajax.getFriends(profileId, null, function (profileCards) {
            if (profileCards != null)
                _this.friendBox.add(profileCards);
            _this.summaryStage.updateStaging(_this.friendsStaged);
        });
        this.profilePostsCard.load(profileId);
        _super.prototype.open.call(this);
    };
    ProfileModal.prototype.selectProfilePicture = function () {
        var _this = this;
        var callback = function (event) {
            var hit = false;
            ['btnImageModalUploadImage', 'plusIcon', 'imageFileIcon', 'imageDropdown', 'imageDropDownContent'].forEach(function (id) {
                if (event.srcElement == document.getElementById(id))
                    hit = true;
            });
            if (!hit && !uploadImageModal.hasFocus) {
                imageDropdown.close();
                window.removeEventListener('mouseup', callback);
            }
        };
        window.addEventListener('mouseup', callback);
        imageDropdown.load(User.profileId, "Select a profile picture", "Set profile picture", function (target) {
            imageDropdown.rootElm.style.zIndex = '0';
            ProfileCard.changeUserProfilePicture(target);
            User.profilePictureId = target.image.imageId;
            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target));
            Ajax.updateProfilePicture(target.image.imageId, null, 'Change profile picture', null, function (imageCard) {
                return _this.profilePictureBox.loadImage(imageCard);
            });
        });
    };
    ProfileModal.prototype.reset = function () {
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.relationWrapper);
        delete this.imagesBox;
        this.nameEditor.setText2('', '');
        this.bioEditor.setText('');
        this.friendBox.clear();
        this.profilePostsCard.clear();
        this.friendBox = new ContentBox(this.friendBoxElm);
        this.summaryStageContainers.forEach(function (container) {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });
        this.summaryStage.flags.forEach(function (flag) { return flag.lower(); });
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
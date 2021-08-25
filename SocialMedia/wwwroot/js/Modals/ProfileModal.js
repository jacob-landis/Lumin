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
    function ProfileModal(contentElm, profileNameWrapper, imageWrapper, profileBioWrapper, imageScrollBox, friendBoxElm, relationWrapper, imageBoxElm, summaryWrapper, profilePosts, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, btnSearchPosts, txtSearchPosts, commentedPostsBoxWrapper, likedPostsBoxWrapper, mainPostsBoxWrapper, profileSettingsCard, imageClassList, editorClassList, doubleEditorClassList) {
        var _this = _super.call(this, contentElm) || this;
        _this.contentElm = contentElm;
        _this.profileNameWrapper = profileNameWrapper;
        _this.imageWrapper = imageWrapper;
        _this.profileBioWrapper = profileBioWrapper;
        _this.imageScrollBox = imageScrollBox;
        _this.friendBoxElm = friendBoxElm;
        _this.relationWrapper = relationWrapper;
        _this.summaryWrapper = summaryWrapper;
        _this.profileSettingsCard = profileSettingsCard;
        _this.requestFriendsTrigger = function (skip, take) { return _this.requestFriends(skip, take); };
        _this.fullProfileStaged = new StageFlag();
        _this.imagesBoxStaged = new StageFlag();
        _this.friendsStaged = new StageFlag();
        _this.profilePostsCard = new ProfilePostsCard(_this.rootElm, profilePosts, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, btnMyPostActivity, btnSearchPosts, txtSearchPosts, commentedPostsBoxWrapper, likedPostsBoxWrapper, mainPostsBoxWrapper);
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
        _this.friendBox = new FriendsBox(_this.friendBoxElm, _this.friendBoxElm, _this.requestFriendsTrigger);
        return _this;
    }
    ProfileModal.prototype.load = function (profileId) {
        var _this = this;
        this.reset();
        Ajax.getFullProfile(profileId, function (fullProfile) {
            _this.profile = fullProfile;
            _this.nameEditor.setText2(_this.profile.firstName, _this.profile.lastName);
            _this.bioEditor.setText(_this.profile.bio);
            if (_this.profile.profilePicture != null)
                _this.profilePictureBox.loadImage(new ImageCard(_this.profile.profilePicture));
            _this.summaryStage.updateStaging(_this.fullProfileStaged);
        });
        Ajax.getProfile(profileId, function (profileCard) {
            if (profileCard.profile.relationToUser != 'me') {
                if (profileCard.profile.relationToUser != "unrelated") {
                    var preface = void 0;
                    var relation = profileCard.profile.relationToUser;
                    if (relation == "friend") {
                        preface = "Friends since";
                    }
                    else if (relation == "userRequested" || relation == "requestedUser") {
                        preface = "Pending since";
                    }
                    else if (profileCard.profile.blockerProfileId == User.profileId) {
                        preface = "Blocked since";
                    }
                    var lblRelationshipDatetime = ViewUtil.tag("div", { innerText: preface + " " + Util.formatDateTime(profileCard.profile.relationshipChangeDatetime) });
                    _this.relationWrapper.append(lblRelationshipDatetime);
                }
                _this.relationWrapper.append(new RelationCard(profileCard.profile).rootElm);
            }
            else if (profileCard.profile.relationToUser == 'me') {
                _this.profileSettingsCard.setPrivacySelectValues(profileCard.profile);
                _this.relationWrapper.append(ViewUtil.tag("div", { innerText: "Account created on " + Util.formatDateTime(profileCard.profile.accountCreationDatetime) }));
            }
            _this.summaryWrapper.style.backgroundColor = profileCard.profile.profileColor;
            if (profileCard.profile.profileFriendsPrivacyLevel <= profileCard.profile.relationshipTier) {
                _this.requestFriends = function (skip, take) {
                    Ajax.getFriends(profileId, "profileModal", skip, take, null, function (profileCards) {
                        if (profileCards != null)
                            _this.friendBox.add(profileCards);
                        _this.summaryStage.updateStaging(_this.friendsStaged);
                    });
                };
                _this.friendBox.request(20);
            }
            else {
                _this.friendBox.messageElm.innerText = "This user's friends are private.";
                _this.summaryStage.updateStaging(_this.friendsStaged);
            }
            _this.profilePostsCard.load(profileId);
            _this.imagesBox = new ProfileImagesBox('Fullscreen', _this.imageScrollBox, function (target) {
                return imageGalleryModal.load(_this.imagesBox.content.indexOf(target), profileId);
            });
            _this.imagesBox.onLoadEnd = function () {
                _this.summaryStage.updateStaging(_this.imagesBoxStaged);
                if (_this.imagesBox.content.length == 0)
                    _this.imageWrapper.innerHTML = 'No images were retrieved.';
            };
            _this.imagesBox.load(profileId);
            _this.imageWrapper.append(_this.imagesBox.rootElm);
            _super.prototype.open.call(_this);
        });
        if (profileId == User.profileId) {
            ViewUtil.show(this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block', function () { return ViewUtil.show(_this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block'); });
            this.profilePictureBox.heldImageClick = function (target) { return _this.selectProfilePicture(); };
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';
            this.nameEditor.enableEditing();
            this.bioEditor.enableEditing();
        }
        else {
            this.profilePictureBox.heldImageClick = function (target) { return imageGalleryModal.loadSingle(target.imageCard.image.imageId); };
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';
            this.nameEditor.disableEditing();
            this.bioEditor.disableEditing();
        }
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
            ProfileCard.changeUserProfilePicture(target.imageCard);
            User.profilePictureId = target.imageCard.image.imageId;
            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target.imageCard));
            Ajax.updateProfilePicture(target.imageCard.image.imageId, null, 'Change profile picture', null, function (imageCard) {
                return _this.profilePictureBox.loadImage(imageCard);
            });
        });
    };
    ProfileModal.prototype.reset = function () {
        ViewUtil.hide(this.profileSettingsCard.btnToggleSettingsSection.rootElm);
        ViewUtil.hide(this.profileSettingsCard.rootElm);
        this.profileSettingsCard.btnToggleSettingsSection.reset();
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.relationWrapper);
        delete this.imagesBox;
        this.nameEditor.setText2('', '');
        this.bioEditor.setText('');
        this.friendBox.clear();
        ViewUtil.empty(this.friendBoxElm);
        this.friendBox = new FriendsBox(this.friendBoxElm, this.friendBoxElm, this.requestFriendsTrigger);
        this.profilePostsCard.clear();
        this.summaryStageContainers.forEach(function (container) {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });
        this.summaryStage.flags.forEach(function (flag) { return flag.lower(); });
    };
    ProfileModal.prototype.close = function () {
        var _this = this;
        if (ViewUtil.isDisplayed(this.profileSettingsCard.rootElm)) {
            if (this.profileSettingsCard.isChanged()) {
                confirmPrompt.load("Are you sure you want to revert all changes to your privacy settings?", function (answer) {
                    if (answer == true) {
                        _this.profileSettingsCard.btnToggleSettingsSection.toggle();
                        _super.prototype.close.call(_this);
                    }
                });
            }
            else {
                this.profileSettingsCard.btnToggleSettingsSection.toggle();
                _super.prototype.close.call(this);
            }
        }
        else {
            _super.prototype.close.call(this);
        }
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
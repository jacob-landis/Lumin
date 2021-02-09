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
    function ProfileModal(rootElm, content, profileNameWrapper, postWrapper, imageWrapper, profileBioWrapper, imageBoxElm, imageScrollBox, friendBoxElm, imageClassList, editorClassList, doubleEditorClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.content = content;
        _this.postWrapper = postWrapper;
        _this.imageWrapper = imageWrapper;
        _this.profileNameWrapper = profileNameWrapper;
        _this.profileBioWrapper = profileBioWrapper;
        _this.imageScrollBox = imageScrollBox;
        _this.friendBoxElm = friendBoxElm;
        _this.btnChangeName = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' });
        _this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });
        _this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        _this.nameEditor = new DoubleEditor(_this.btnChangeName, '', '', doubleEditorClassList, 30, function (firstName, lastName) {
            ProfileCard.changeUserProfileName(firstName, lastName);
            Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
        });
        _this.profileNameWrapper.append(_this.nameEditor.rootElm);
        _this.bioEditor = new Editor(_this.btnChangeBio, '', editorClassList, 250, function (bio) { return Ajax.updateBio(bio); });
        _this.profileBioWrapper.append(_this.bioEditor.rootElm);
        _this.postBox = new PostsBox(0, _this.postWrapper, _this.rootElm);
        return _this;
    }
    ProfileModal.prototype.launch = function (profileId) {
        var _this = this;
        Ajax.getFullProfile(profileId, function (fullProfile) { return _this.load(fullProfile); });
    };
    ProfileModal.prototype.load = function (fullProfile) {
        var _this = this;
        this.reset();
        this.profile = fullProfile;
        this.nameEditor.setText2(fullProfile.firstName, fullProfile.lastName);
        this.bioEditor.setText(fullProfile.bio);
        if (this.profile.profileId == User.profileId) {
            this.profilePictureBox.heldImageClick = function (target) { return _this.selectProfilePicture(); };
            this.profileNameWrapper.append(this.btnChangeName);
            this.profileBioWrapper.append(this.btnChangeBio);
        }
        else {
            this.profilePictureBox.heldImageClick = function (target) { return fullSizeImageModal.loadSingle(target.image.imageId); };
            ViewUtil.remove(this.btnChangeName);
            ViewUtil.remove(this.btnChangeBio);
        }
        this.profilePictureBox.loadImage(new ImageCard(this.profile.profilePicture));
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, this.imageScrollBox, function (target) {
            return fullSizeImageModal.load(_this.imagesBox.content.indexOf(target), _this.profile.profileId);
        });
        this.imageWrapper.append(this.imagesBox.rootElm);
        this.imageScrollBox.onscroll = function (e) {
            var divHeight = Util.getElmHeight(_this.imageScrollBox);
            var offset = _this.imageScrollBox.scrollTop + divHeight - 50;
            if (offset >= divHeight)
                _this.imagesBox.request(5);
        };
        this.friendBox = new ContentBox(this.friendBoxElm);
        this.friendBox.clear();
        Ajax.getFriends(this.profile.profileId, null, function (profileCards) { return _this.friendBox.add(profileCards); });
        this.postBox.profileId = this.profile.profileId;
        this.postBox.clear();
        this.postBox.start();
        this.rootElm.onscroll = function (e) {
            var divHeight = Util.getDocumentHeight();
            var offset = _this.rootElm.scrollTop + window.innerHeight + 2000;
            if (offset >= divHeight)
                _this.postBox.request();
        };
        _super.prototype.open.call(this);
    };
    ProfileModal.prototype.selectProfilePicture = function () {
        var _this = this;
        imageDropdown.load(User.profileId, "Select a profile picture", function (target) {
            imageDropdown.close();
            imageDropdown.rootElm.style.zIndex = '0';
            ProfileCard.changeUserProfilePicture(target);
            User.profilePictureId = target.image.imageId;
            _this.profilePictureBox.loadImage(target);
            Ajax.updateProfilePicture(target.image.imageId, null, null, function (imageCard) {
                return _this.profilePictureBox.loadImage(imageCard);
            });
        });
    };
    ProfileModal.prototype.reset = function () {
        ViewUtil.empty(this.imageWrapper);
        delete this.imagesBox;
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
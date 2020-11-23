var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ProfileModal = (function (_super) {
    __extends(ProfileModal, _super);
    function ProfileModal(rootElm, content, profileModalName, postWrapper, imageWrapper, profileBioWrapper, imageBoxElm, imageScrollBox, friendBoxElm, imageClassList, editorClassList) {
        var _this = _super.call(this, rootElm) || this;
        _this.content = content;
        _this.profileModalName = profileModalName;
        _this.postWrapper = postWrapper;
        _this.imageWrapper = imageWrapper;
        _this.profileBioWrapper = profileBioWrapper;
        _this.imageScrollBox = imageScrollBox;
        _this.friendBoxElm = friendBoxElm;
        _this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });
        _this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        _this.bioEditor = new Editor(_this.btnChangeBio, '', editorClassList, 250, function (bio) { return Ajax.updateBio(bio); });
        _this.profileBioWrapper.append(_this.bioEditor.tag);
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
        this.profileModalName.innerText = fullProfile.name;
        this.bioEditor.setText(fullProfile.bio);
        if (this.profile.profileId == User.profileId) {
            this.profilePictureBox.heldImageClick = function () { return _this.selectProfilePicture; };
            this.profileBioWrapper.append(this.btnChangeBio);
            this.btnChangeBio.onclick = function () { return _this.bioEditor.start(); };
        }
        else {
            this.profilePictureBox.heldImageClick = Behavior.singleFullSizeImage;
            ViewUtil.remove(this.btnChangeBio);
        }
        this.profilePictureBox.loadImage(new ImageCard(this.profile.profilePicture));
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, function (imageCard) { return function () {
            return fullSizeImageModal.load(_this.imagesBox.content.indexOf(imageCard), _this.profile.profileId);
        }; });
        this.imageWrapper.append(this.imagesBox.rootElm);
        this.imageScrollBox.onscroll = function () {
            var divHeight = Util.getElmHeight(_this.imageScrollBox);
            var offset = _this.imageScrollBox.scrollTop + divHeight - 50;
            if (offset >= divHeight)
                _this.imagesBox.request(5);
        };
        this.friendBox = new ContentBox(this.friendBoxElm);
        this.friendBox.clear();
        Ajax.getFriends(this.profile.profileId, null, function (profileCards) { return _this.friendBox.add(profileCards); });
        this.postBox = new PostsBox(this.profile.profileId);
        this.postWrapper.append(this.postBox.rootElm);
        this.postBox.start();
        this.rootElm.onscroll = function () {
            var divHeight = Util.getDocumentHeight();
            var offset = _this.rootElm.scrollTop + window.innerHeight + 2000;
            if (offset >= divHeight)
                _this.postBox.request();
        };
        _super.prototype.open.call(this);
    };
    ProfileModal.prototype.selectProfilePicture = function () {
        var _this = this;
        imageDropdown.load(function (imageCard) {
            imageDropdown.close();
            imageDropdown.rootElm.style.zIndex = '0';
            ProfileCard.changeUserProfilePicture(null, imageCard);
            Ajax.updateProfilePicture(imageCard.image.imageId, null, null, function (imageCard) { return _this.profilePictureBox.loadImage(imageCard); });
        });
    };
    ProfileModal.prototype.reset = function () {
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.postWrapper);
        delete this.imagesBox;
        delete this.postBox;
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
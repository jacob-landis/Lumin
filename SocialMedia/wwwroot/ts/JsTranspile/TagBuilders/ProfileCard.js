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
var ProfileCard = (function (_super) {
    __extends(ProfileCard, _super);
    function ProfileCard(profile) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'profileCard' })) || this;
        _this.profile = profile;
        _this.case = ProfileCard.cases[_this.profile.relationToUser];
        _this.imageBox = new ImageBox(ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }), 'sqr', null, true);
        _this.imageBox.loadImage(new ImageCard(_this.profile.profilePicture, 'sqr', function () { }));
        _this.rootElm.append(_this.imageBox.rootElm, ViewUtil.tag('span', { classList: 'profileCardName', innerText: _this.profile.name }));
        if (_this.profile.relationToUser == 'friend' || _this.profile.relationToUser == 'me')
            _this.rootElm.onclick = function (e) { return profileModal.launch(_this.profile.profileId); };
        if (_this.profile.relationToUser != 'me') {
            _this.rootElm.oncontextmenu = function (e) { return contextModal.load(e, [
                new ContextOption(_this.case.icon, function () {
                    var id = _this.profile.profileId;
                    switch (_this.case.label) {
                        case 'Accept':
                            Ajax.acceptFriendRequest(id);
                            break;
                        case 'Request':
                            Ajax.sendFriendRequest(id);
                            break;
                        case 'Cancel':
                            _this.remove();
                            break;
                        case 'Unfriend': confirmModal.load('Are you sure you want to unfriend this user?', function (confirmation) { if (confirmation)
                            _this.remove(); });
                    }
                    _this.case = ProfileCard.cases[_this.case.nextCase];
                })
            ]); };
        }
        ProfileCard.profileCards.push(_this);
        return _this;
    }
    ProfileCard.list = function (profiles) {
        var profileCards = [];
        profiles.forEach(function (p) { return profileCards.push(new ProfileCard(p)); });
        return profileCards;
    };
    ProfileCard.changeUserProfilePicture = function (imageId, imageCard) {
        if (imageId)
            Ajax.getImage(imageId, true, null, null, function (imageCard) { return applyChanges(imageCard); });
        else
            applyChanges(imageCard);
        function applyChanges(imageCard) {
            ProfileCard.profileCards.forEach(function (p) {
                if (p.profile.profileId == User.profileId)
                    p.imageBox.loadImage(ImageCard.copy(imageCard));
            });
            profileModal.profilePictureBox.loadImage(ImageCard.copy(imageCard));
            User.profilePictureId = imageCard.rawImage.id;
            Ajax.updateProfilePicture(imageCard.rawImage.id);
        }
    };
    ProfileCard.prototype.remove = function () {
        var _this = this;
        PostCard.postCards.forEach(function (p) {
            if (p.post.profile.profileId == _this.profile.profileId)
                ViewUtil.remove(p.rootElm);
        });
        Ajax.deleteFriend(this.profile.profileId);
    };
    ProfileCard.profileCards = [];
    ProfileCard.cases = {
        'friend': {
            label: 'Unfriend',
            icon: Icons.removeFriend(),
            nextCase: 'unrelated'
        },
        'userRequested': {
            label: 'Cancel',
            icon: Icons.cancelRequest(),
            nextCase: 'unrelated'
        },
        'requestedUser': {
            label: 'Accept',
            icon: Icons.acceptRequest(),
            nextCase: 'friend'
        },
        'unrelated': {
            label: 'Request',
            icon: Icons.sendRequest(),
            nextCase: 'userRequested'
        }
    };
    return ProfileCard;
}(Card));
//# sourceMappingURL=ProfileCard.js.map
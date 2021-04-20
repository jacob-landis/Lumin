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
var ProfileCard = (function (_super) {
    __extends(ProfileCard, _super);
    function ProfileCard(profile) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'profileCard' })) || this;
        _this.profile = profile;
        _this.imageBox = new ImageBox(ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }), 'sqr', null, null, true);
        _this.imageBox.loadImage(new ImageCard(_this.profile.profilePicture, 'sqr', null, function (target) { }));
        _this.txtName = ViewUtil.tag('span', { classList: 'profileCardName', innerText: _this.profile.firstName + " " + _this.profile.lastName });
        _this.rootElm.append(_this.imageBox.rootElm, _this.txtName);
        if (_this.profile.relationToUser == 'friend' || _this.profile.relationToUser == 'me')
            _this.rootElm.onclick = function (e) { return profileModal.load(_this.profile.profileId); };
        if (_this.profile.relationToUser != 'me') {
            _this.relationCard = new RelationCard(profile);
            _this.rootElm.oncontextmenu = function (e) { return contextMenu.load(e, [
                new ContextOption(_this.relationCard.case.icon, function (e) { return _this.relationCard.changeRelation(); })
            ]); };
        }
        ProfileCard.profileCards.push(_this);
        return _this;
    }
    ProfileCard.list = function (profiles) {
        var profileCards = [];
        profiles.forEach(function (profileRecord) { return profileCards.push(new ProfileCard(profileRecord)); });
        return profileCards;
    };
    ProfileCard.changeUserProfilePicture = function (imageCard) {
        ProfileCard.profileCards.forEach(function (profileCard) {
            if (profileCard.profile.profileId == User.profileId)
                profileCard.imageBox.loadImage(ImageCard.copy(imageCard));
        });
    };
    ProfileCard.changeUserProfileName = function (firstName, lastName) {
        ProfileCard.profileCards.forEach(function (profileCard) {
            if (profileCard.profile.profileId == User.profileId)
                profileCard.txtName.innerText = firstName + " " + lastName;
        });
    };
    ProfileCard.profileCards = [];
    return ProfileCard;
}(Card));
//# sourceMappingURL=ProfileCard.js.map
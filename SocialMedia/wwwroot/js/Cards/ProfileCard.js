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
    function ProfileCard(profile, includeRelationButton) {
        var _this = _super.call(this, ViewUtil.tag('div', { classList: 'profileCard' })) || this;
        _this.profile = profile;
        _this.imageBox = new ImageBox(ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }), 'sqr', null, null, true);
        if (_this.profile.profilePicture != null)
            _this.imageBox.loadImage(new ImageCard(_this.profile.profilePicture, 'sqr', null, function (target) { }));
        _this.txtName = ViewUtil.tag('span', { classList: 'profileCardName', innerText: _this.profile.firstName + " " + _this.profile.lastName });
        _this.rootElm.append(_this.imageBox.rootElm, _this.txtName);
        var isFriendOrMe = _this.profile.relationToUser == 'friend' || _this.profile.relationToUser == 'me';
        _this.rootElm.onclick = function (e) {
            if (e.target == _this.rootElm || e.target == _this.txtName || e.target == _this.imageBox.imageCard.rootElm)
                profileModal.load(_this.profile.profileId);
        };
        if (_this.profile.relationToUser != 'me') {
            _this.relationCard = new RelationCard(profile);
            if (includeRelationButton) {
                _this.rootElm.append(_this.relationCard.rootElm);
            }
            else {
                _this.rootElm.oncontextmenu = function (e) { return contextMenu.load(e, [
                    new ContextOption(_this.relationCard.rootElm, _this.relationCard.case.label, function (e) { return _this.relationCard.changeRelation(); })
                ]); };
            }
        }
        if (isFriendOrMe)
            _this.rootElm.title = 'View full profile';
        if (_this.profile.relationToUser == 'friend' && !includeRelationButton)
            _this.rootElm.title = 'View full profile + Right-Click options';
        ProfileCard.profileCards.push(_this);
        return _this;
    }
    ProfileCard.list = function (profiles, includeRelationButton) {
        if (profiles == null)
            return null;
        var profileCards = [];
        profiles.forEach(function (profileRecord) { return profileCards.push(new ProfileCard(profileRecord, includeRelationButton)); });
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
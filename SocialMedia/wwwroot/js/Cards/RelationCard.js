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
var RelationCard = (function (_super) {
    __extends(RelationCard, _super);
    function RelationCard(profile) {
        var _this = _super.call(this, ViewUtil.tag("div", { classList: "relationCard" })) || this;
        _this.profile = profile;
        _this.case = RelationCard.cases[_this.profile.relationToUser];
        _this.rootElm.append(_this.case.icon());
        _this.rootElm.onclick = function (event) { return _this.changeRelation(); };
        _this.rootElm.title = _this.case.label;
        return _this;
    }
    RelationCard.remove = function (profileId) {
        PostCard.postCards.forEach(function (p) {
            if (p.post.profile.profileId == profileId)
                ViewUtil.remove(p.rootElm);
        });
        Ajax.deleteFriend(profileId);
    };
    RelationCard.prototype.changeRelation = function () {
        var _this = this;
        this.case.action(this.profile.profileId);
        this.case = RelationCard.cases[this.case.nextCase];
        this.rootElm.onclick = function (event) { return _this.case.action(_this.profile.profileId); };
        ViewUtil.empty(this.rootElm);
        this.rootElm.append(this.case.icon());
    };
    RelationCard.cases = {
        'friend': {
            label: 'Unfriend',
            icon: function () { return Icons.removeFriend(); },
            nextCase: 'unrelated',
            action: function (profileId) {
                confirmPrompt.load('Are you sure you want to unfriend this user?', function (confirmation) { if (confirmation)
                    RelationCard.remove(profileId); });
            }
        },
        'userRequested': {
            label: 'Cancel',
            icon: function () { return Icons.cancelRequest(); },
            nextCase: 'unrelated',
            action: function (profileId) { return RelationCard.remove(profileId); }
        },
        'requestedUser': {
            label: 'Accept',
            icon: function () { return Icons.acceptRequest(); },
            nextCase: 'friend',
            action: function (profileId) { return Ajax.acceptFriendRequest(profileId); }
        },
        'unrelated': {
            label: 'Request',
            icon: function () { return Icons.sendRequest(); },
            nextCase: 'userRequested',
            action: function (profileId) { return Ajax.sendFriendRequest(profileId); }
        }
    };
    return RelationCard;
}(Card));
//# sourceMappingURL=RelationCard.js.map
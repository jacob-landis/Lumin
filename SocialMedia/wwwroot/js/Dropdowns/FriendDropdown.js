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
var FriendDropdown = (function (_super) {
    __extends(FriendDropdown, _super);
    function FriendDropdown(rootElm, contentElm, txtSearch, btnSearch, lblPrompt, friendBoxElm, btnOpen) {
        var _this = _super.call(this, rootElm, contentElm, btnOpen) || this;
        _this.txtSearch = txtSearch;
        _this.btnSearch = btnSearch;
        _this.lblPrompt = lblPrompt;
        _this.friendsBox = new ContentBox(friendBoxElm, _this.contentElm);
        _this.btnSearch.onclick = function (e) { return _this.requestFriendables(); };
        _this.txtSearch.onkeyup = function (e) { if (e.keyCode == 13)
            _this.btnSearch.click(); };
        return _this;
    }
    FriendDropdown.prototype.open = function () {
        this.requestFriends();
        this.txtSearch.value = "";
        _super.prototype.open.call(this);
    };
    FriendDropdown.prototype.requestFriends = function () {
        var _this = this;
        this.friendsBox.clear();
        this.lblPrompt.innerText = "My Friends";
        Ajax.getFriends(null, null, function (profiles) { return _this.friendsBox.add(profiles); });
        Ajax.getFriends(User.profileId, null, function (profiles) { return _this.friendsBox.add(profiles); });
    };
    FriendDropdown.prototype.requestFriendables = function () {
        var _this = this;
        var search = this.txtSearch.value;
        if (search == "") {
            this.requestFriends();
            return;
        }
        this.friendsBox.clear();
        this.lblPrompt.innerText = "Search Results";
        Ajax.getFriends(null, search, function (profiles) {
            _this.friendsBox.add(profiles);
            if (profiles.length == 0)
                _this.lblPrompt.innerText = "No Results";
        });
    };
    return FriendDropdown;
}(Dropdown));
//# sourceMappingURL=FriendDropdown.js.map
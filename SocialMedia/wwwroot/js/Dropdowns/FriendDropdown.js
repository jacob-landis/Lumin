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
    function FriendDropdown(rootElm, contentElm, txtSearch, btnSearch, btnFriendRequests, lblPrompt, friendBoxElm, btnOpen) {
        var _this = _super.call(this, rootElm, contentElm, btnOpen) || this;
        _this.btnFriendRequests = btnFriendRequests;
        _this.requestCallbackTrigger = function (skip, take) { return _this.requestCallback(skip, take); };
        _this.txtSearch = txtSearch;
        _this.btnSearch = btnSearch;
        _this.lblPrompt = lblPrompt;
        _this.loadingGif = ViewUtil.tag("img", { classList: "loadingGif" });
        _this.loadingGif.src = "/ImgStatic/Loading.gif";
        _this.friendsBox = new FriendsBox(friendBoxElm, _this.contentElm, _this.requestCallbackTrigger);
        _this.contentElm.onscroll = function (event) {
            _this.friendsBox.lazyLoad();
        };
        _this.btnSearch.onclick = function (e) { return _this.searchFriends(); };
        _this.txtSearch.onkeyup = function (e) { if (e.keyCode == 13)
            _this.btnSearch.click(); };
        _this.btnFriendRequests.onclick = function (event) {
            if (_this.lblPrompt.innerText == "Friend Requests")
                _this.requestFriends();
            else
                _this.requestFriendRequests();
        };
        return _this;
    }
    FriendDropdown.prototype.open = function () {
        var _this = this;
        this.requestFriends();
        this.txtSearch.value = "";
        Ajax.getHasFriendRequest(User.profileId, function (hasFriendRequest) {
            if (hasFriendRequest == '1') {
                _this.btnFriendRequests.classList.add("hasFriendRequests");
            }
            else if (hasFriendRequest == '0') {
                _this.btnFriendRequests.classList.remove("hasFriendRequests");
            }
        });
        _super.prototype.open.call(this);
    };
    FriendDropdown.prototype.requestFriends = function () {
        var _this = this;
        this.friendsBox.clear();
        this.lblPrompt.innerText = "My Friends";
        this.requestCallback = function (skip, take) {
            Ajax.getFriends(User.profileId, "friendDropdown", skip, take, null, function (profiles) { return _this.friendsBox.add(profiles); });
        };
        this.friendsBox.request(20);
    };
    FriendDropdown.prototype.requestFriendRequests = function () {
        var _this = this;
        this.friendsBox.clear();
        this.lblPrompt.innerText = "Friend Requests";
        this.requestCallback = function (skip, take) {
            Ajax.getFriends(null, "friendDropdown", skip, take, null, function (profiles) { return _this.friendsBox.add(profiles); });
        };
        this.friendsBox.request(20);
    };
    FriendDropdown.prototype.searchFriends = function () {
        var _this = this;
        var search = this.txtSearch.value;
        if (search == "") {
            this.requestFriends();
            return;
        }
        this.friendsBox.clear();
        this.friendsBox.contentElm.append(this.loadingGif);
        this.requestCallback = function (skip, take) {
            Ajax.getFriends(null, "friendDropdown", skip, take, search, function (profiles) {
                _this.friendsBox.clear();
                if (profiles.length == 0)
                    _this.lblPrompt.innerText = "No Results";
                else {
                    _this.lblPrompt.innerText = "Search Results";
                    _this.friendsBox.add(profiles);
                }
            });
        };
        this.friendsBox.request(20);
    };
    FriendDropdown.prototype.updateFriendRequests = function (profileId) {
        var _this = this;
        if (this.lblPrompt.innerText == "Friend Requests") {
            this.friendsBox.content.forEach(function (c) {
                if (c.profile.profileId == profileId)
                    _this.friendsBox.remove(c);
            });
            if (this.friendsBox.length == 0) {
                this.btnFriendRequests.classList.remove("hasFriendRequests");
            }
        }
    };
    return FriendDropdown;
}(Dropdown));
//# sourceMappingURL=FriendDropdown.js.map
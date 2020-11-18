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
/*
    This class controls the content in the friends dropdown.

    Two types of results are displayed:
    (1) A mixture of profiles from friend records with statuses of 'friend' and 'requestedUser' (See Friends in /Documentation/Guide.txt).
    (2) The profiles that related most highly to the search query.
*/
var FriendDropdown = /** @class */ (function (_super) {
    __extends(FriendDropdown, _super);
    /*
        Gets handles on all necessary components.
        Sets up event listeners.
        Sudo-inherits from sudo-base class.
    */
    function FriendDropdown(rootElm, contentElm, txtSearch, btnSearch, friendBoxElm) {
        var _this = _super.call(this, rootElm, contentElm) || this;
        // Get handles on dropdown HTML elms.
        _this.txtSearch = txtSearch;
        _this.btnSearch = btnSearch;
        // Create a new content box using a dropdown HTML component and get a handle on it.
        _this.friendsBox = new ContentBox(friendBoxElm);
        // Set up the event listeners for invoking a search either by clicking on btnSearch or pressing the Enter key.
        _this.btnSearch.onclick = function () { return _this.requestFriendables(); };
        _this.txtSearch.onkeyup = function (e) { if (e.keyCode == 13)
            _this.btnSearch.click(); };
        return _this;
    }
    FriendDropdown.prototype.open = function () {
        this.requestFriends();
        this.txtSearch.value = "";
        _super.prototype.open.call(this);
    };
    /*
        Display accepted friends and pending request to the current user's profile.
    */
    FriendDropdown.prototype.requestFriends = function () {
        var _this = this;
        // Clear any previous results from friendsBox.
        this.friendsBox.clear();
        // Request unnaccepted friend requests to the current user's profile (requestedUser) and add to friendsBox.
        Repo.friends(null, null, function (profiles) { return _this.friendsBox.add(profiles); });
        // Request accepted friend requests to and from the current user's profile (friend) and add to friendsBox.
        // XXX may need to use currentUser.id instead of profileId if this dropdown is not used to display other profiles' friends.
        Repo.friends(User.id, null, function (profiles) { return _this.friendsBox.add(profiles); });
    };
    /*
        Send a search request to the host with the user input.
    */
    FriendDropdown.prototype.requestFriendables = function () {
        var _this = this;
        // Extract user search input and get a handle on it.
        var search = this.txtSearch.value;
        // If nothing was entered,
        if (search == "") {
            // invoke request friends (refresh the list),
            this.requestFriends();
            return;
        }
        // else, clear the list,
        this.friendsBox.clear();
        // and send a search request.
        Repo.friends(null, search, 
        // When the results return as profile cards, add them to the friends box.
        function (profiles) { return _this.friendsBox.add(profiles); });
    };
    return FriendDropdown;
}(Dropdown));
//# sourceMappingURL=FriendDropdown.js.map
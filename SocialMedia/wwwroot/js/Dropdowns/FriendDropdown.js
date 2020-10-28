/*
    This class controls the content in the friends dropdown.

    Two types of results are displayed:
    (1) A mixture of profiles from friend records with statuses of 'friend' and 'requestedUser' (See Friends in /Documentation/Guide.txt).
    (2) The profiles that related most highly to the search query.
*/
class FriendDropdown {

    /*
    
    // A requirement of being a dropdown. The base class shows and hides this on open() and close().
    dropdownCon;

    // A requirement of being a dropdown. The base class constricts the height of this elm so content is not overlapped by nav bar.
    content;

    // Input elm for user to enter serach terms in.
    // XXX If this dropdown is used to display someone elses friends the search bar will be hidden!!!
    txtSearch;

    // Button set to invoke a search.
    // XXX If this dropdown is used to display someone elses friends the search btn will be hidden!!!
    btnSearch;

    // A container elm enhanced by the ContentBox class used to store profile cards from search results.
    friendsBox;

    // The ProfileID of the profile who's friends are being shown.
    // XXX May not be necessary if this dropdown is not used to sshow other peoples friends.
    profileId;
    */

    /*
        Gets handles on all necessary components.
        Sets up event listeners.
        Sudo-inherits from sudo-base class.
    */
    static initialize() {

        // Get handles on dropdown HTML elms.
        this.dropdownCon = document.getElementById('friendsDropdown');
        this.content = document.getElementById('friendDropdownContent');
        this.txtSearch = document.getElementById('txtSearchFriends');
        this.btnSearch = document.getElementById('btnSearchFriends');

        // Create a new content box using a dropdown HTML component and get a handle on it.
        this.friendsBox = new ContentBox(document.getElementById('friends'));

        // Set up the event listeners for invoking a search either by clicking on btnSearch or pressing the Enter key.
        this.btnSearch.onclick = () => this.requestFriendables()
        this.txtSearch.onkeyup =e=> { if (e.keyCode == 13) this.btnSearch.click(); }

        // Inherit from base class.
        Dropdown.add(this);
    }

    /*
        This method is invoked in Dropdown. XXX this method is only ever invoked by Main THROUGH Dropdown.

        XXX does the friend dropdown ever get used to show another profile's friends?

        XXX comment this when it's surrounding logic has been re-examined.
    */
    static load(profileId, showSearchInput = true) {
        this.profileId = profileId ? profileId : User.id;
        this.requestFriends();
        this.txtSearch.value = "";

        if (showSearchInput) {
            ViewUtil.show(this.txtSearch);
            ViewUtil.show(this.btnSearch);
        }
        else {
            ViewUtil.hide(this.txtSearch);
            ViewUtil.hide(this.btnSearch);
        }
        this.open();
    }

    /*
        Display accepted friends and pending request to the current user's profile.
    */
    static requestFriends() {

        // Clear any previous results from friendsBox.
        this.friendsBox.clear();

        // Request unnaccepted friend requests to the current user's profile (requestedUser) and add to friendsBox.
        Repo.friends(null, null, profiles => this.friendsBox.add(profiles));

        // Request accepted friend requests to and from the current user's profile (friend) and add to friendsBox.
        // XXX may need to use currentUser.id instead of profileId if this dropdown is not used to display other profiles' friends.
        Repo.friends(this.profileId, null, profiles => this.friendsBox.add(profiles));
    }

    /*
        Send a search request to the host with the user input.
    */
    static requestFriendables() {

        // Extract user search input and get a handle on it.
        let search = this.txtSearch.value;

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
            profiles => this.friendsBox.add(profiles));
    }
}
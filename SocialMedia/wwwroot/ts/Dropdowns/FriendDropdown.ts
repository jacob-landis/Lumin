/*
    This class controls the content in the friends dropdown.

    Two types of results are displayed:
    (1) A mixture of profiles from friend records with statuses of 'friend' and 'requestedUser' (See Friends in /Documentation/Guide.txt).
    (2) The profiles that related most highly to the search query.
*/
class FriendDropdown extends Dropdown {
    
    // Input elm for user to enter serach terms in.
    // XXX If this dropdown is used to display someone elses friends the search bar will be hidden!!!
    private txtSearch: HTMLInputElement;

    // Button set to invoke a search.
    // XXX If this dropdown is used to display someone elses friends the search btn will be hidden!!!
    private btnSearch: HTMLElement;

    private lblPrompt: HTMLElement;

    private loadingGif: HTMLImageElement;

    // A container elm enhanced by the ContentBox class used to store profile cards from search results.
    private friendsBox: FriendsBox;

    private requestCallback: (skip: number, take: number) => void;
    private requestCallbackTrigger: (skip: number, take: number) => void
        = (skip: number, take: number) => this.requestCallback(skip, take);

    /*
        Gets handles on all necessary components.
        Sets up event listeners.
        Sudo-inherits from sudo-base class.
    */
    public constructor(
        rootElm: HTMLElement,
        contentElm: HTMLElement,
        txtSearch: HTMLInputElement,
        btnSearch: HTMLElement,
        private btnFriendRequests: HTMLElement,
        lblPrompt: HTMLElement,
        friendBoxElm: HTMLElement,
        btnOpen: HTMLElement
    ) {

        super(rootElm, contentElm, btnOpen);

        // Get handles on dropdown HTML elms.
        this.txtSearch = txtSearch;
        this.btnSearch = btnSearch;
        this.lblPrompt = lblPrompt;

        this.loadingGif = <HTMLImageElement>ViewUtil.tag("img", { classList: "loadingGif" });
        this.loadingGif.src = "/ImgStatic/Loading.gif";

        // Create a new content box using a dropdown HTML component and get a handle on it.
        this.friendsBox = new FriendsBox(friendBoxElm, this.contentElm, this.requestCallbackTrigger);

        this.contentElm.onscroll = (event: UIEvent) => {
            this.friendsBox.lazyLoad();
        }

        // Set up the event listeners for invoking a search either by clicking on btnSearch or pressing the Enter key.
        this.btnSearch.onclick = (e: MouseEvent) => this.searchFriends()
        this.txtSearch.onkeyup = (e: KeyboardEvent) => { if (e.keyCode == 13) this.btnSearch.click(); }

        this.btnFriendRequests.onclick = (event: MouseEvent) => {
            if (this.lblPrompt.innerText == "Friend Requests") this.requestFriends();
            else this.requestFriendRequests();
        }
    }
    
    public open(): void {
        this.requestFriends();
        this.txtSearch.value = "";

        Ajax.getHasFriendRequest((hasFriendRequest: string) => {
            if (hasFriendRequest == '1') {
                this.btnFriendRequests.classList.add("hasFriendRequests");
            }
            else if (hasFriendRequest == '0') {
                this.btnFriendRequests.classList.remove("hasFriendRequests");
            }
        });

        super.open();
    }

    /*
        Display accepted friends and pending request to the current user's profile.
    */
    private requestFriends(): void {

        // Clear any previous results from friendsBox.
        this.friendsBox.clear();
        this.lblPrompt.innerText = "My Friends";

        this.requestCallback = (skip: number, take: number) => {

            // Request accepted friend requests to and from the current user's profile (friend) and add to friendsBox.
            // XXX may need to use currentUser.id instead of profileId if this dropdown is not used to display other profiles' friends.
            Ajax.getFriends(User.profileId, "friendDropdown", skip, take, null, (profiles: ProfileCard[]) => this.friendsBox.add(profiles));
        }
        this.friendsBox.request(20);
    }

    private requestFriendRequests(): void {
        this.friendsBox.clear();
        this.lblPrompt.innerText = "Friend Requests";

        this.requestCallback = (skip: number, take: number) => {

            // Request unnaccepted friend requests to the current user's profile (requestedUser) and add to friendsBox.
            Ajax.getFriends(null, "friendDropdown", skip, take, null, (profiles: ProfileCard[]) => this.friendsBox.add(profiles));
        }
        this.friendsBox.request(20);
    }

    /*
        Send a search request to the host with the user input.
    */
    private searchFriends(): void {

        // Extract user search input and get a handle on it.
        let search: string = this.txtSearch.value;

        // If nothing was entered,
        if (search == "") {

            // invoke request friends (refresh the list),
            this.requestFriends();
            return;
        }

        // else, clear the list,
        this.friendsBox.clear();

        this.friendsBox.contentElm.append(this.loadingGif);

        this.requestCallback = (skip: number, take: number) => {

            // and send a search request.
            Ajax.getFriends(null, "friendDropdown", skip, take, search, (profiles: ProfileCard[]) => {

                this.friendsBox.clear();

                if (profiles.length == 0) this.lblPrompt.innerText = "No Results";
                else {
                    this.lblPrompt.innerText = "Search Results";
                    this.friendsBox.add(profiles)
                }
            });
        }
        this.friendsBox.request(20);
    }

    public updateFriendRequests(profileId: number): void {
        if (this.lblPrompt.innerText == "Friend Requests") {

            this.friendsBox.content.forEach((c: IAppendable) => {
                if ((<ProfileCard>c).profile.profileId == profileId)
                    this.friendsBox.remove(c);
            });

            if (this.friendsBox.length == 0) {
                this.btnFriendRequests.classList.remove("hasFriendRequests");
            }
        }
    }
}
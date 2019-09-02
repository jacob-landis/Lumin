class FriendDropdown {
    
    static initialize() {
        this.dropdownCon = document.getElementById('friendsDropdown');
        this.content = document.getElementById('friendDropdownContent');
        this.friendsBox = new ContentBox(document.getElementById('friends'));
        this.txtSearch = document.getElementById('txtSearchFriends');
        this.btnSearch = document.getElementById('btnSearchFriends');

        this.btnSearch.onclick =()=> this.requestFriendables()
        this.txtSearch.onkeyup =e=> { if (e.keyCode == 13) this.btnSearch.click(); }
        
        Dropdown.add(this);
    }

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

    static requestFriends() {
        this.friendsBox.clear();
        Repo.friends(null, null, profiles => this.friendsBox.add(profiles));

        Repo.friends(this.profileId, null, profiles => this.friendsBox.add(profiles));
    }

    static requestFriendables() {
        let search = this.txtSearch.value;

        if (search == "") {
            this.requestFriends();
            return;
        }
        this.friendsBox.clear();
        Repo.friends(null, search,
            profiles => this.friendsBox.add(profiles));
    }
}
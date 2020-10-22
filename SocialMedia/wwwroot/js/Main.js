class Main {
    
    static initialize(profile) {
        User.id = profile.profileId;
        User.profilePictureId = profile.profilePicture;

        this.navBar = document.getElementById("navBar"); // used to asses height of display port by other classes
        
        Modal.initialize();
        ContextModal.initialize();
        CreatePostModal.initialize();
        FullSizeImageModal.initialize();
        ProfileModal.initialize();
        UploadImageModal.initialize();
        PublicPosts.initialize();
        ConfirmModal.initialize();
        HelpModal.initialize();

        ImageDropdown.initialize();
        FriendDropdown.initialize();

        // ----------------------------- SET UP ON-CLICKS -------------------------

        // OPEN HELP MODAL
        document.getElementById('btnOpenHelpModal').onclick =()=> HelpModal.open();

        // OPEN USER PROFILE MODAL
        document.getElementById('btnOpenUserProfileModal').onclick =()=> ProfileModal.launch(User.id)

        // CREATE POST
        document.getElementById('btnCreatePost').onclick =()=> CreatePostModal.load()

        // SHOW FRIENDS
        document.getElementById('btnShowFriends').onclick =()=> FriendDropdown.toggle(User.id, true)

        // SHOW IMAGES
        document.getElementById('btnShowImages').onclick =()=> ImageDropdown.toggle()
    }
}
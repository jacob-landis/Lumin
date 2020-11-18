var modal;
var contextModal;
var createPostModal;
var fullSizeImageModal;
var profileModal;
var uploadImageModal;
var publicPosts;
var confirmModal;
var helpModal;
var imageDropdown;
var friendDropdown;
var Main = /** @class */ (function () {
    function Main() {
    }
    Main.initialize = function (profile) {
        User.id = profile.profileId;
        User.profilePictureId = profile.profilePicture;
        this.navBar = document.getElementById("navBar"); // used to asses height of display port by other classes
        // MODALS
        Modal.initialize(document.getElementById('modalFrameTemplate'), document.getElementById('btnCloseModal'), document.getElementById('modalFrameContainer'));
        contextModal = new ContextModal(document.getElementById('contextModal'), document.getElementById('btnConfirmYes'));
        confirmModal = new ConfirmModal(document.getElementById('confirmModal'), document.getElementById('promptMessage'), document.getElementById('btnConfirmYes'), document.getElementById('btnConfirmNo'));
        createPostModal = new CreatePostModal(document.getElementById('createPostModal'), document.getElementById('caption'), document.getElementById('captionWrapper'), document.getElementById('btnSelectPostImage'), document.getElementById('btnClearPostImage'), document.getElementById('btnSubmit'), document.getElementById('btnCancel'), document.getElementById('selectedImageCon'), 'selectedPostImage', 'createPostErrorBox');
        fullSizeImageModal = new FullSizeImageModal(document.getElementById('fullsizeImageModal'), document.getElementById('fullSizeImageModalContent'), document.getElementById('btnFullsizePrevious'), document.getElementById('btnFullsizeNext'), document.getElementById('imageCount'), document.getElementById('fullsizeImageCon'), 'fullSizeImage');
        profileModal = new ProfileModal(document.getElementById('profileModal'), document.getElementById('profileModalContent'), document.getElementById('profileModalName'), document.getElementById('profilePosts'), document.getElementById('profileImages'), document.getElementById('profileBioWrapper'), document.getElementById('profileModalPictureWrapper'), document.getElementById('profileImagesWrapper'), document.getElementById('profileFriends'), 'profile-picture sqr', 'bio');
        uploadImageModal = new UploadImageModal(document.getElementById('imageUploadModal'), document.getElementById('stagedUploadCon'), document.getElementById('btnConfirmImageUpload'), document.getElementById('uploadImageModalUploadImage'), 'stagedUpload', 'errorMsg uploadImageError');
        publicPosts = new PublicPosts(document.getElementById('publicPosts'));
        helpModal = new HelpModal(document.getElementById('helpModal'));
        // DROPDOWNS
        Dropdown.initialize(document.getElementById('dropdownFrameTemplate'), document.getElementById('dropdownFrameContainer'));
        imageDropdown = new ImageDropdown(document.getElementById('imageDropdown'), document.getElementById('imageDropDownContent'), document.getElementById('selectImages'), document.getElementById('selectImagePrompt'), document.getElementById('imageModalUploadImage'));
        friendDropdown = new FriendDropdown(document.getElementById('friendsDropdown'), document.getElementById('friendDropdownContent'), document.getElementById('txtSearchFriends'), document.getElementById('btnSearchFriends'), document.getElementById('friends'));
        // ----------------------------- SET UP ON-CLICKS -------------------------
        // OPEN HELP MODAL
        document.getElementById('btnOpenHelpModal').onclick = function () { return helpModal.open(); };
        // OPEN USER PROFILE MODAL
        document.getElementById('btnOpenUserProfileModal').onclick = function () { return profileModal.launch(User.id); };
        // CREATE POST
        document.getElementById('btnCreatePost').onclick = function () { return createPostModal.load(); };
        // SHOW FRIENDS
        document.getElementById('btnShowFriends').onclick = function () { return friendDropdown.toggle(); };
        // SHOW IMAGES
        document.getElementById('btnShowImages').onclick = function () { return imageDropdown.toggle(); };
    };
    return Main;
}());
//# sourceMappingURL=Main.js.map
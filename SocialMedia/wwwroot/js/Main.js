var contextMenu;
var confirmPrompt;
var modal;
var createPostModal;
var fullSizeImageModal;
var profileModal;
var uploadImageModal;
var publicPosts;
var helpModal;
var imageDropdown;
var friendDropdown;
var Main = (function () {
    function Main() {
    }
    Main.initialize = function (profile) {
        User.profileId = profile.profileId;
        User.profilePictureId = profile.profilePicture;
        NavBar.initialize(document.getElementById('navBar'), document.getElementById('publicPosts'));
        publicPosts = new PublicPosts(document.getElementById('publicPosts'));
        contextMenu = new ContextMenu(document.getElementById('contextMenu'), document.getElementById('contextContent'));
        confirmPrompt = new ConfirmPrompt(document.getElementById('confirmPrompt'), document.getElementById('confirmContent'), document.getElementById('promptMessage'), document.getElementById('btnConfirmYes'), document.getElementById('btnConfirmNo'));
        Modal.initialize(document.getElementById('modalFrameTemplate'), document.getElementById('modalFrameContainer'), document.getElementById('btnCloseModal'));
        createPostModal = new CreatePostModal(document.getElementById('createPostModal'), document.getElementById('caption'), document.getElementById('captionWrapper'), document.getElementById('btnSelectPostImage'), document.getElementById('btnClearPostImage'), document.getElementById('btnSubmit'), document.getElementById('btnCancel'), document.getElementById('selectedImageCon'), 'selectedPostImage', 'createPostErrorBox');
        fullSizeImageModal = new FullSizeImageModal(document.getElementById('fullSizeImageModalContent'), document.getElementById('btnFullsizePrevious'), document.getElementById('btnFullsizeNext'), document.getElementById('imageCount'), document.getElementById('fullsizeImageBox'), 'fullSizeImage');
        profileModal = new ProfileModal(document.getElementById('profileModal'), document.getElementById('profileModalContent'), document.getElementById('profileNameWrapper'), document.getElementById('profilePosts'), document.getElementById('profileImages'), document.getElementById('profileBioWrapper'), document.getElementById('profileModalPictureWrapper'), document.getElementById('profileImagesWrapper'), document.getElementById('profileFriends'), 'profile-picture sqr', 'bio', 'name');
        uploadImageModal = new UploadImageModal(document.getElementById('imageUploadModal'), document.getElementById('stagedUploadCon'), document.getElementById('btnConfirmImageUpload'), document.getElementById('uploadImageModalUploadImage'), 'stagedUpload', 'errorMsg uploadImageError');
        helpModal = new HelpModal(document.getElementById('helpContent'));
        Dropdown.initialize(document.getElementById('dropdownFrameTemplate'), document.getElementById('dropdownFrameContainer'));
        imageDropdown = new ImageDropdown(document.getElementById('imageDropdown'), document.getElementById('imageDropDownContent'), document.getElementById('selectImages'), document.getElementById('selectImagePrompt'), document.getElementById('imageModalUploadImage'));
        friendDropdown = new FriendDropdown(document.getElementById('friendsDropdown'), document.getElementById('friendDropdownContent'), document.getElementById('txtSearchFriends'), document.getElementById('btnSearchFriends'), document.getElementById('friends'));
        document.getElementById('btnOpenHelpModal').onclick = function (e) { return helpModal.open(); };
        document.getElementById('btnOpenUserProfileModal').onclick = function (e) { return profileModal.launch(User.profileId); };
        document.getElementById('btnCreatePost').onclick = function (e) { return createPostModal.load(); };
        document.getElementById('btnShowFriends').onclick = function (e) { return friendDropdown.toggle(); };
        document.getElementById('btnShowImages').onclick = function (e) { return imageDropdown.toggle(); };
    };
    return Main;
}());
//# sourceMappingURL=Main.js.map
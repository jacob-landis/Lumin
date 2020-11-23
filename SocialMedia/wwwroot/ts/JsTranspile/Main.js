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
var Main = (function () {
    function Main() {
    }
    Main.initialize = function (profile) {
        User.profileId = profile.profileId;
        User.profilePictureId = profile.profilePicture;
        this.navBar = document.getElementById("navBar");
        Modal.initialize(document.getElementById('modalFrameTemplate'), document.getElementById('btnCloseModal'), document.getElementById('modalFrameContainer'));
        contextModal = new ContextModal(document.getElementById('contextModal'), document.getElementById('btnConfirmYes'));
        confirmModal = new ConfirmModal(document.getElementById('confirmModal'), document.getElementById('promptMessage'), document.getElementById('btnConfirmYes'), document.getElementById('btnConfirmNo'));
        createPostModal = new CreatePostModal(document.getElementById('createPostModal'), document.getElementById('caption'), document.getElementById('captionWrapper'), document.getElementById('btnSelectPostImage'), document.getElementById('btnClearPostImage'), document.getElementById('btnSubmit'), document.getElementById('btnCancel'), document.getElementById('selectedImageCon'), 'selectedPostImage', 'createPostErrorBox');
        fullSizeImageModal = new FullSizeImageModal(document.getElementById('fullsizeImageModal'), document.getElementById('fullSizeImageModalContent'), document.getElementById('btnFullsizePrevious'), document.getElementById('btnFullsizeNext'), document.getElementById('imageCount'), document.getElementById('fullsizeImageCon'), 'fullSizeImage');
        profileModal = new ProfileModal(document.getElementById('profileModal'), document.getElementById('profileModalContent'), document.getElementById('profileModalName'), document.getElementById('profilePosts'), document.getElementById('profileImages'), document.getElementById('profileBioWrapper'), document.getElementById('profileModalPictureWrapper'), document.getElementById('profileImagesWrapper'), document.getElementById('profileFriends'), 'profile-picture sqr', 'bio');
        uploadImageModal = new UploadImageModal(document.getElementById('imageUploadModal'), document.getElementById('stagedUploadCon'), document.getElementById('btnConfirmImageUpload'), document.getElementById('uploadImageModalUploadImage'), 'stagedUpload', 'errorMsg uploadImageError');
        publicPosts = new PublicPosts(document.getElementById('publicPosts'));
        helpModal = new HelpModal(document.getElementById('helpModal'));
        Dropdown.initialize(document.getElementById('dropdownFrameTemplate'), document.getElementById('dropdownFrameContainer'));
        imageDropdown = new ImageDropdown(document.getElementById('imageDropdown'), document.getElementById('imageDropDownContent'), document.getElementById('selectImages'), document.getElementById('selectImagePrompt'), document.getElementById('imageModalUploadImage'));
        friendDropdown = new FriendDropdown(document.getElementById('friendsDropdown'), document.getElementById('friendDropdownContent'), document.getElementById('txtSearchFriends'), document.getElementById('btnSearchFriends'), document.getElementById('friends'));
        document.getElementById('btnOpenHelpModal').onclick = function () { return helpModal.open(); };
        document.getElementById('btnOpenUserProfileModal').onclick = function () { return profileModal.launch(User.profileId); };
        document.getElementById('btnCreatePost').onclick = function () { return createPostModal.load(); };
        document.getElementById('btnShowFriends').onclick = function () { return friendDropdown.toggle(); };
        document.getElementById('btnShowImages').onclick = function () { return imageDropdown.toggle(); };
    };
    return Main;
}());
//# sourceMappingURL=Main.js.map
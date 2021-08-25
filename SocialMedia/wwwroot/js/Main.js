var navBar;
var contextMenu;
var confirmPrompt;
var createPostModal;
var imageGalleryModal;
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
        User.profilePicturePrivacyLevel = profile.profilePicturePrivacyLevel;
        User.bioPrivacyLevel = profile.profileBioPrivacyLevel;
        User.imagesPrivacyLevel = profile.profileImagesPrivacyLevel;
        User.friendsPrivacyLevel = profile.profileFriendsPrivacyLevel;
        User.postsPrivacyLevel = profile.profilePostsPrivacyLevel;
        navBar = new NavBar(document.getElementById('navBar'), document.getElementById('publicPosts'), document.getElementById('btnOpenUserProfileModal'));
        publicPosts = new PublicPosts(document.getElementById('publicPosts'));
        contextMenu = new ContextMenu(document.getElementById('contextMenu'), document.getElementById('contextContent'));
        confirmPrompt = new ConfirmPrompt(document.getElementById('confirmPrompt'), document.getElementById('confirmContent'), document.getElementById('promptMessage'), document.getElementById('btnConfirmYes'), document.getElementById('btnConfirmNo'));
        Modal.initialize(document.getElementById('modalFrameTemplate'), document.getElementById('modalFrameContainer'), document.getElementById('btnCloseModal'));
        createPostModal = new CreatePostModal(document.getElementById('createPostModal'), document.getElementById('caption'), document.getElementById('captionWrapper'), document.getElementById('btnSubmit'), document.getElementById('btnClearAttachment'), document.getElementById('selectedImageCon'), document.getElementById('lblCaptionCharacterCount'), document.getElementById('postPrivacySetting'), 'selectedPostImage', 'createPostErrorBox');
        imageGalleryModal = new ImageGalleryModal(document.getElementById('imageGalleryModalContent'), document.getElementById('btnGalleryPrevious'), document.getElementById('btnGalleryNext'), document.getElementById('imageCount'), document.getElementById('imageOwnership'), document.getElementById('imageOwner'), document.getElementById('galleryImagePrivacy'), document.getElementById('selectGalleryImagePrivacy'), document.getElementById('imageDateTime'), document.getElementById('fullsizeImageBox'), 'galleryImage');
        profileModal = new ProfileModal(document.getElementById('profileModal'), document.getElementById('profileNameWrapper'), document.getElementById('profileImages'), document.getElementById('profileBioWrapper'), document.getElementById('profileImagesWrapper'), document.getElementById('profileFriends'), document.getElementById('relationWrapper'), document.getElementById('profileModalPictureWrapper'), document.getElementById('profileSummary'), document.getElementById('profilePostBoxes'), document.getElementById('btnToggleSearchBar'), document.getElementById('btnTogglePostFeedFilter'), document.getElementById('btnRefreshProfilePostFeed'), document.getElementById('btnMyPostActivity'), document.getElementById('btnSearchPosts'), document.getElementById('txtSearchPosts'), document.getElementById('commentedProfilePostsBox'), document.getElementById('likedProfilePostsBox'), document.getElementById('mainProfilePostsBox'), new ProfileSettingsCard(document.getElementById('profileSettings'), document.getElementById('btnToggleProfileSettings'), document.getElementById('profilePictureSetting'), document.getElementById('profileBioSetting'), document.getElementById('profileImagesSetting'), document.getElementById('profileFriendsSetting'), document.getElementById('profilePostsSetting'), document.getElementById('profileColorPalette'), document.getElementById('txtProfileColor'), document.getElementById('btnSetProfileColor'), document.getElementById('btnSaveProfileSettings')), 'profile-picture sqr', 'bio', 'name');
        uploadImageModal = new UploadImageModal(document.getElementById('imageUploadModal'), document.getElementById('stagedUploadCon'), document.getElementById('imagePrivacySetting'), document.getElementById('btnConfirmImageUpload'), document.getElementById('uploadImageModalUploadImage'), 'stagedUpload', 'errorMsg uploadImageError');
        helpModal = new HelpModal(document.getElementById('helpContent'));
        Dropdown.initialize(document.getElementById('dropdownFrameTemplate'), document.getElementById('dropdownFrameContainer'));
        imageDropdown = new ImageDropdown(document.getElementById('imageDropdown'), document.getElementById('imageDropDownContent'), document.getElementById('selectImages'), document.getElementById('selectImagePrompt'), document.getElementById('imageModalUploadImage'), document.getElementById('btnShowImages'));
        friendDropdown = new FriendDropdown(document.getElementById('friendsDropdown'), document.getElementById('friendDropdownContent'), document.getElementById('txtSearchFriends'), document.getElementById('btnSearchFriends'), document.getElementById('btnFriendRequests'), document.getElementById('friendsPrompt'), document.getElementById('friends'), document.getElementById('btnShowFriends'));
    };
    return Main;
}());
//# sourceMappingURL=Main.js.map
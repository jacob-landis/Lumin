﻿var navBar: NavBar;
var contextMenu: ContextMenu;
var confirmPrompt: ConfirmPrompt;

var createPostModal: CreatePostModal;
var imageGalleryModal : ImageGalleryModal;
var profileModal : ProfileModal;
var uploadImageModal : UploadImageModal;
var publicPosts : PublicPosts;
var helpModal: HelpModal;

var imageDropdown : ImageDropdown;
var friendDropdown : FriendDropdown;

class Main {
    
    static initialize(profile) {

        User.profileId = profile.profileId;
        User.profilePictureId = profile.profilePicture;
        User.profilePicturePrivacyLevel = profile.profilePicturePrivacyLevel;
        User.bioPrivacyLevel = profile.profileBioPrivacyLevel;
        User.imagesPrivacyLevel = profile.profileImagesPrivacyLevel;
        User.friendsPrivacyLevel = profile.profileFriendsPrivacyLevel;
        User.postsPrivacyLevel = profile.profilePostsPrivacyLevel;

        navBar = new NavBar(
            document.getElementById('navBar'),
            document.getElementById('publicPosts'),
            document.getElementById('btnOpenUserProfileModal')
        );

        // PUBLIC POST FEED
        publicPosts = new PublicPosts(document.getElementById('publicPosts'));

        // CONTEXT PROMPT
        contextMenu = new ContextMenu(
            document.getElementById('contextMenu'),
            document.getElementById('contextContent')
        );

        // CONFIRM MENU
        confirmPrompt = new ConfirmPrompt(
            document.getElementById('confirmPrompt'),
            document.getElementById('promptMessage'),
            document.getElementById('btnConfirmYes'),
            document.getElementById('btnConfirmNo')
        );

        // MODALS --------------------------------------------------
        Modal.initialize(
            document.getElementById('modalFrameTemplate'),
            document.getElementById('modalFrameContainer'),
            document.getElementById('btnCloseModal')
        );

        createPostModal = new CreatePostModal(
            document.getElementById('createPostModal'),
            <HTMLInputElement>document.getElementById('caption'),
            document.getElementById('captionWrapper'),
            document.getElementById('btnSubmit'),
            document.getElementById('btnClearAttachment'),
            document.getElementById('selectedImageCon'),
            document.getElementById('lblCaptionCharacterCount'),
            <HTMLSelectElement>document.getElementById('postPrivacySetting'),
            'selectedPostImage',
            'createPostErrorBox'
        );

        imageGalleryModal = new ImageGalleryModal(
            document.getElementById('imageGalleryModalContent'),
            document.getElementById('btnGalleryPrevious'),
            document.getElementById('btnGalleryNext'),
            document.getElementById('imageCount'), 
            document.getElementById('imageOwnership'),
            document.getElementById('imageOwner'),
            document.getElementById('galleryImagePrivacy'),
            <HTMLSelectElement>document.getElementById('selectGalleryImagePrivacy'),
            document.getElementById('imageDateTime'),
            document.getElementById('fullsizeImageBox'),
            'galleryImage'
        );

        profileModal = new ProfileModal(
            document.getElementById('profileModal'),
            document.getElementById('profileNameWrapper'),
            document.getElementById('profileImages'),
            document.getElementById('profileBioWrapper'),
            document.getElementById('profileImagesWrapper'),
            document.getElementById('profileFriends'),
            document.getElementById('relationWrapper'),
            document.getElementById('profileModalPictureWrapper'),
            document.getElementById('profileSummary'),

            // Profile Posts Card elements
            document.getElementById('profilePostBoxes'),
            document.getElementById('btnToggleSearchBar'),
            document.getElementById('btnTogglePostFeedFilter'),
            document.getElementById('btnRefreshProfilePostFeed'),
            document.getElementById('btnMyPostActivity'),
            document.getElementById('btnSearchPosts'),
            <HTMLInputElement>document.getElementById('txtSearchPosts'),
            document.getElementById('commentedProfilePostsBox'),
            document.getElementById('likedProfilePostsBox'),
            document.getElementById('mainProfilePostsBox'),

            new ProfileSettingsCard(
                document.getElementById('profileSettings'),
                document.getElementById('btnToggleProfileSettings'),
                <HTMLSelectElement>document.getElementById('profilePictureSetting'),
                <HTMLSelectElement>document.getElementById('profileBioSetting'),
                <HTMLSelectElement>document.getElementById('profileImagesSetting'),
                <HTMLSelectElement>document.getElementById('profileFriendsSetting'),
                <HTMLSelectElement>document.getElementById('profilePostsSetting'),
                document.getElementById('profileColorPalette'),
                <HTMLInputElement>document.getElementById('txtProfileColor'),
                document.getElementById('btnSetProfileColor'),
                document.getElementById('btnSaveProfileSettings')
            ),

            'profile-picture sqr',
            'bio',
            'name'
        );

        uploadImageModal = new UploadImageModal(
            document.getElementById('imageUploadModal'),
            document.getElementById('stagedUploadCon'),
            <HTMLSelectElement>document.getElementById('imagePrivacySetting'),
            document.getElementById('btnConfirmImageUpload'),
            document.getElementById('uploadImageModalUploadImage'),
            'stagedUpload',
            'errorMsg uploadImageError'
        );

        helpModal = new HelpModal(document.getElementById('helpContent'));

        // DROPDOWNS
        Dropdown.initialize(
            document.getElementById('dropdownFrameTemplate'),
            document.getElementById('dropdownFrameContainer')
        );

        imageDropdown = new ImageDropdown(
            document.getElementById('imageDropdown'),
            document.getElementById('imageDropDownContent'),
            document.getElementById('selectImages'),
            document.getElementById('selectImagePrompt'),
            document.getElementById('imageModalUploadImage'),
            document.getElementById('btnShowImages')
        );

        friendDropdown = new FriendDropdown(
            document.getElementById('friendsDropdown'),
            document.getElementById('friendDropdownContent'),
            <HTMLInputElement> document.getElementById('txtSearchFriends'),
            document.getElementById('btnSearchFriends'),
            document.getElementById('btnFriendRequests'),
            document.getElementById('friendsPrompt'),
            document.getElementById('friends'),
            document.getElementById('btnShowFriends')
        );
    }
}
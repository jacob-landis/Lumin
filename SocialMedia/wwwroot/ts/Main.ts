var contextMenu: ContextMenu;
var confirmPrompt: ConfirmPrompt;

var modal: Modal;
var createPostModal: CreatePostModal;
var fullSizeImageModal : FullSizeImageModal;
var profileModal : ProfileModal;
var uploadImageModal : UploadImageModal;
var publicPosts : PublicPosts;
var helpModal : HelpModal;
var imageDropdown : ImageDropdown;
var friendDropdown : FriendDropdown;

class Main {

    static navBar: HTMLElement;

    // XXX Translate profile. XXX
    static initialize(profile) {

        User.profileId = profile.profileId;
        User.profilePictureId = profile.profilePicture;

        this.navBar = document.getElementById("navBar"); // used to assess height of display port by other classes

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
            document.getElementById('confirmContent'),
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
            document.getElementById('btnSelectPostImage'),
            document.getElementById('btnClearPostImage'),
            document.getElementById('btnSubmit'),
            document.getElementById('btnCancel'),
            document.getElementById('selectedImageCon'),
            'selectedPostImage',
            'createPostErrorBox'
        );

        fullSizeImageModal = new FullSizeImageModal(
            document.getElementById('fullSizeImageModalContent'),
            document.getElementById('btnFullsizePrevious'),
            document.getElementById('btnFullsizeNext'),
            document.getElementById('imageCount'),
            document.getElementById('fullsizeImageBox'),
            'fullSizeImage'
        );

        profileModal = new ProfileModal(
            document.getElementById('profileModal'),
            document.getElementById('profileModalContent'),
            document.getElementById('profileNameWrapper'),
            document.getElementById('profilePosts'),
            document.getElementById('profileImages'),
            document.getElementById('profileBioWrapper'),
            document.getElementById('profileModalPictureWrapper'),
            document.getElementById('profileImagesWrapper'),
            document.getElementById('profileFriends'),
            'profile-picture sqr',
            'bio',
            'name'
        );

        uploadImageModal = new UploadImageModal(
            document.getElementById('imageUploadModal'),
            document.getElementById('stagedUploadCon'),
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
            document.getElementById('imageModalUploadImage')
        );

        friendDropdown = new FriendDropdown(
            document.getElementById('friendsDropdown'),
            document.getElementById('friendDropdownContent'),
            <HTMLInputElement> document.getElementById('txtSearchFriends'),
            document.getElementById('btnSearchFriends'),
            document.getElementById('friends')
        );

        // ----------------------------- SET UP ON-CLICKS -------------------------

        // OPEN HELP MODAL
        document.getElementById('btnOpenHelpModal').onclick = (e: MouseEvent) => helpModal.open();

        // OPEN USER PROFILE MODAL
        document.getElementById('btnOpenUserProfileModal').onclick = (e: MouseEvent) => profileModal.launch(User.profileId)

        // CREATE POST
        document.getElementById('btnCreatePost').onclick = (e: MouseEvent) => createPostModal.load()

        // SHOW FRIENDS
        document.getElementById('btnShowFriends').onclick = (e: MouseEvent) => friendDropdown.toggle()

        // SHOW IMAGES
        document.getElementById('btnShowImages').onclick = (e: MouseEvent) => imageDropdown.toggle()
    }
}
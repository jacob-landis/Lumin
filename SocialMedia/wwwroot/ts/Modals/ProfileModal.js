var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
    This class contains the functionality for the profile modal.
*/
var ProfileModal = /** @class */ (function (_super) {
    __extends(ProfileModal, _super);
    function ProfileModal() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /*
    */
    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
    */
    ProfileModal.initialize = function () {
        // Inherit from base class.
        Modal.add(this);
        // Get handles on modal HTML elms.
        this.modalCon = document.getElementById('profileModal');
        this.content = document.getElementById('profileModalContent');
        this.profileModalName = document.getElementById('profileModalName');
        this.postWrapper = document.getElementById('profilePosts');
        this.imageWrapper = document.getElementById('profileImages');
        this.profileBioWrapper = document.getElementById('profileBioWrapper');
        this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });
        // Construct an ImageBox for the profile picture and get a handle on it.
        this.profilePictureBox = new ImageBox(document.getElementById('profileModalPictureWrapper'), '', 'profile-picture sqr', null);
        // Construct an Editor for profile bio and get a handle on it.
        this.bioEditor = new Editor(this.btnChangeBio, '', 'bio', 250, function (bio) { return Repo.updateBio(bio); });
        this.profileBioWrapper.append(this.bioEditor.tag);
    };
    /*
        Request a full profile and send it to load() when it arrives. XXX make this request in load and have the login in there be inside the callback. XXX
    */
    ProfileModal.launch = function (profileId) {
        var _this = this;
        Repo.fullProfile(profileId, function (fullProfile) { return _this.load(fullProfile); });
    };
    /*
        Loads profile information into the different slots and then opens this modal.
    */
    ProfileModal.load = function (fullProfile) {
        var _this = this;
        // Clear out modal.
        this.reset();
        // Get a handle on the new arrival.
        this.profile = fullProfile;
        // Set name display.
        this.profileModalName.innerText = fullProfile.name;
        // Set bio display.
        this.bioEditor.setText(fullProfile.bio);
        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (this.profile.profileId == User.id) {
            // set click callback of profile picture to invoke select profile picture,
            this.profilePictureBox.heldClick = function () { return _this.selectProfilePicture; };
            // give button for user to edit bio,
            this.profileBioWrapper.append(this.btnChangeBio);
            // and set click callback of that button.
            this.btnChangeBio.onclick = function () { return _this.bioEditor.start(); };
        }
        // else, this profile is not the current user's so,
        else {
            // set click callback of profile picture to display it in fullsize image modal,
            this.profilePictureBox.heldClick = Behavior.singleFullSizeImage;
            // and detach the button to edit the bio.
            ViewUtil.remove(this.btnChangeBio);
        }
        // Set profile picture display.
        this.profilePictureBox.loadImage(this.profile.profilePicture);
        // IMAGES BOX
        // Construct new ProfileImageBox and set up profile images display.
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, function (imageCard) { return function () {
            // XXX Mystery of the double callback. XXX
            // Set click callback of each image to open a collection in fullzise image modal.
            return FullSizeImageModal.load(_this.imagesBox.contentBox.content.indexOf(imageCard), _this.profile.profileId);
        }; });
        // Append new profile images box to container elm.
        this.imageWrapper.append(this.imagesBox.contentBox.tag);
        this.imageScrollBox = document.getElementById('profileImagesWrapper'); // XXX move this to initialize
        // LAZY LOADING IMAGES
        // On image box scroll,
        this.imageScrollBox.onscroll = function () {
            // create shortcut,
            var divHeight = Util.getDivHeight(_this.imageScrollBox);
            // take measurement,
            var offset = _this.imageScrollBox.scrollTop + divHeight - 50;
            // and if threshold is surpassed, request more images.
            if (offset >= divHeight)
                _this.imagesBox.contentBox.request(5);
        };
        // FRIENDS BOX
        // Construct new Content box and set of friends display.
        this.friendBox = new ContentBox(document.getElementById('profileFriends'));
        // Clear friends box. Even though this was just constructed it reused an existing elm that could still have profile cards in it.
        this.friendBox.clear();
        // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
        Repo.friends(this.profile.profileId, null, function (profiles) { return _this.friendBox.add(profiles); });
        // POSTS BOX
        // Construct a new PostsBox and set it to load this profile's ProfileID.
        this.postBox = new PostsBox(this.profile.profileId);
        // Append new PostsBox to container elm.
        this.postWrapper.append(this.postBox.contentBox.tag);
        // Start post feed to make first request.
        this.postBox.start();
        // LAZY LOADING POSTS
        // Set scroll callback for modalCon.
        this.modalCon.onscroll = function () {
            // Make shortcut.
            var divHeight = Util.getDocumentHeight();
            // Take measurment.
            var offset = _this.modalCon.scrollTop + window.innerHeight + 2000;
            // If threshold was surpassed, request more posts.
            if (offset >= divHeight)
                _this.postBox.contentBox.request();
        };
        // Open this modal.
        Modal.open(this);
    };
    /*
        Opens and configures the image dropdown to return the image the user selects.
    */
    ProfileModal.selectProfilePicture = function () {
        // Load image dropdown with callback. When the image the user selected returns,
        ImageDropdown.load(function (imageCard) {
            // close the image dropdown,
            Dropdown.close(ImageDropdown);
            // reset z index of dropdown,
            ImageDropdown.rootElm.style.zIndex = 0; // XXX move to onclose of imageDropdown. XXX
            // change any occurence of the user's profile picture to the newly selected one,
            // (This has the side effect of using the thumbnail as a placeholder for the profile modal picture until the fullsize arrives.)
            ProfileCard.changeUserProfilePicture(null, imageCard);
            // and send an update request to the host to change the profile picture in the profile record.
            Repo.updateProfilePicture(imageCard.rawImage.id, null, null, 
            // When the host sends back the fullsize version of the new profile picture, load it into the profile modal display.
            function (imageCard) { return ProfileModal.profilePictureBox.loadImage(imageCard); });
        });
    };
    /*
        Empties out the containers that are refilled on load and deletes the components that are reconstructed on load.
    */
    ProfileModal.reset = function () {
        // Emptie out the containers that are refilled on load.
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.postWrapper);
        // Delete the components that are reconstructed on load.
        delete this.imagesBox;
        delete this.postBox;
    };
    return ProfileModal;
}(Modal));
//# sourceMappingURL=ProfileModal.js.map
/*
    This class contains the functionality for the profile modal.
*/
class ProfileModal extends Modal {

    // XXX This is not used. XXX
    private content;
    
    // The profile name display elm.
    private profileModalName;
    
    // Container elm for a PostsBox that is below the profile modal header.
    private postWrapper;
    
    // ImageBox for profile picture.
    private profilePictureBox;
    
    // Container elm for an ProfileImagesBox.
    private imageWrapper;
    
    // Container elm for Editor. Also used to store btnChangeBio.
    private profileBioWrapper;
    
    // Starts editing process. Added and removed from profileBioWrapper depending on if profile is the current user's.
    private btnChangeBio;
    
    // An Editor used to display and sometimes edit the bio.
    private bioEditor;
    
    // A FULL profile. The profile being displayed. 
    private profile;
    
    // Container elm for imageWrapper. Enables scrolling.
    private imageScrollBox: HTMLElement;
    
    // A ProfileImagesBox used to show a profile's images.
    private imagesBox: ProfileImagesBox;
    
    // A ContentBox used to show a profile's friends.
    private friendBox: ContentBox;
    private friendBoxElm: HTMLElement;
    
    // A PostsBox for displaying a profile's posts.
    private postBox: PostsBox;
    
    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
    */
    public constructor(
        rootElm: HTMLElement,
        content: HTMLElement,
        profileModalName: HTMLElement,
        postWrapper: HTMLElement,
        imageWrapper: HTMLElement,
        profileBioWrapper: HTMLElement,
        imageBoxElm: HTMLElement,
        imageScrollBox: HTMLElement,
        friendBoxElm: HTMLElement,
        imageClassList: string,
        editorClassList: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.content = content;
        this.profileModalName = profileModalName;
        this.postWrapper = postWrapper;
        this.imageWrapper = imageWrapper;
        this.profileBioWrapper = profileBioWrapper;
        this.imageScrollBox = imageScrollBox;
        this.friendBoxElm = friendBoxElm;
        this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });

        // Construct an ImageBox for the profile picture and get a handle on it.
        this.profilePictureBox = new ImageBox(imageBoxElm, '', imageClassList, null);

        // Construct an Editor for profile bio and get a handle on it.
        this.bioEditor = new Editor(this.btnChangeBio, '', editorClassList, 250, bio => Repo.updateBio(bio));

        this.profileBioWrapper.append(this.bioEditor.tag);
    }

    /*
        Request a full profile and send it to load() when it arrives. XXX make this request in load and have the login in there be inside the callback. XXX
    */
    public launch(profileId: number): void { Repo.fullProfile(profileId, fullProfile => this.load(fullProfile)); }

    /*
        Loads profile information into the different slots and then opens this modal.
    */
    public load(fullProfile): void {

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
            this.profilePictureBox.heldClick = () => this.selectProfilePicture

            // give button for user to edit bio,
            this.profileBioWrapper.append(this.btnChangeBio);

            // and set click callback of that button.
            this.btnChangeBio.onclick = () => this.bioEditor.start();
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
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, imageCard => () =>

            // XXX Mystery of the double callback. XXX
            // Set click callback of each image to open a collection in fullzise image modal.
            fullSizeImageModal.load(this.imagesBox.content.indexOf(imageCard), this.profile.profileId));

        // Append new profile images box to container elm.
        this.imageWrapper.append(this.imagesBox.rootElm);
        
        // LAZY LOADING IMAGES
        // On image box scroll,
        this.imageScrollBox.onscroll = () => {

            // create shortcut,
            let divHeight = Util.getDivHeight(this.imageScrollBox);

            // take measurement,
            let offset = this.imageScrollBox.scrollTop + divHeight - 50;

            // and if threshold is surpassed, request more images.
            if (offset >= divHeight) this.imagesBox.request(5);
        }

        // FRIENDS BOX
        // Construct new Content box and set of friends display.
        this.friendBox = new ContentBox(this.friendBoxElm);

        // Clear friends box. Even though this was just constructed it reused an existing elm that could still have profile cards in it.
        this.friendBox.clear();

        // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
        Repo.friends(this.profile.profileId, null, profiles => this.friendBox.add(profiles));

        // POSTS BOX
        // Construct a new PostsBox and set it to load this profile's ProfileID.
        this.postBox = new PostsBox(this.profile.profileId);

        // Append new PostsBox to container elm.
        this.postWrapper.append(this.postBox.rootElm);

        // Start post feed to make first request.
        this.postBox.start();

        // LAZY LOADING POSTS
        // Set scroll callback for modalCon.
        this.rootElm.onscroll = () => {

            // Make shortcut.
            let divHeight = Util.getDocumentHeight();

            // Take measurment.
            let offset = this.rootElm.scrollTop + window.innerHeight + 2000;

            // If threshold was surpassed, request more posts.
            if (offset >= divHeight) this.postBox.request();
        }

        // Open this modal.
        super.open();
    }

    /*
        Opens and configures the image dropdown to return the image the user selects.
    */
    private selectProfilePicture(): void {

        // Load image dropdown with callback. When the image the user selected returns,
        imageDropdown.load(imageCard => {

            // close the image dropdown,
            imageDropdown.close();

            // reset z index of dropdown,
            imageDropdown.rootElm.style.zIndex = '0'; // XXX move to onclose of imageDropdown. XXX

            // change any occurence of the user's profile picture to the newly selected one,
            // (This has the side effect of using the thumbnail as a placeholder for the profile modal picture until the fullsize arrives.)
            ProfileCard.changeUserProfilePicture(null, imageCard);

            // and send an update request to the host to change the profile picture in the profile record.
            Repo.updateProfilePicture(imageCard.image.id, null, null,

                // When the host sends back the fullsize version of the new profile picture, load it into the profile modal display.
                imageCard => this.profilePictureBox.loadImage(imageCard));
        });
    }

    /*
        Empties out the containers that are refilled on load and deletes the components that are reconstructed on load.
    */
    private reset(): void {

        // Emptie out the containers that are refilled on load.
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.postWrapper);

        // Delete the components that are reconstructed on load.
        delete this.imagesBox;
        delete this.postBox;
    }
}
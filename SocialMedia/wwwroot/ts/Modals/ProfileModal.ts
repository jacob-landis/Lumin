/*
    This class contains the functionality for the profile modal.
*/
class ProfileModal extends Modal {

    // XXX This is not used. XXX
    private content;
    
    // Container elm for a PostsBox that is below the profile modal header.
    private postWrapper: HTMLElement;
    
    // ImageBox for profile picture.
    public profilePictureBox: ImageBox;
    
    // Container elm for an ProfileImagesBox.
    private imageWrapper: HTMLElement;

    // The profile name display wrapper.
    private profileNameWrapper: HTMLElement;
    private btnChangeName: HTMLElement;
    private nameEditor: DoubleEditor;
    
    // Container elm for Editor. Also used to store btnChangeBio.
    private profileBioWrapper: HTMLElement;

    // Starts editing process. Added and removed from profileBioWrapper depending on if profile is the current user's.
    private btnChangeBio: HTMLElement;
    
    // An Editor used to display and sometimes edit the bio.
    private bioEditor: Editor;
    
    // A FULL profile. The profile being displayed. 
    private profile: FullProfileRecord;
    
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
        profileNameWrapper: HTMLElement,
        postWrapper: HTMLElement,
        imageWrapper: HTMLElement,
        profileBioWrapper: HTMLElement,
        imageBoxElm: HTMLElement,
        imageScrollBox: HTMLElement,
        friendBoxElm: HTMLElement,
        imageClassList: string,
        editorClassList: string,
        doubleEditorClassList: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.content = content;
        this.postWrapper = postWrapper;
        this.imageWrapper = imageWrapper;
        this.profileNameWrapper = profileNameWrapper;
        this.profileBioWrapper = profileBioWrapper;
        this.imageScrollBox = imageScrollBox;
        this.friendBoxElm = friendBoxElm;
        this.btnChangeName = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' });
        this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });

        // Construct an ImageBox for the profile picture and get a handle on it.
        this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        
        this.nameEditor = new DoubleEditor(this.btnChangeName, '', '', doubleEditorClassList, 30,
            (firstName: string, lastName: string) => {
                ProfileCard.changeUserProfileName(firstName, lastName);
                Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
            });
        this.profileNameWrapper.append(this.nameEditor.rootElm);
        
        // Construct an Editor for profile bio and get a handle on it.
        this.bioEditor = new Editor(this.btnChangeBio, '', editorClassList, 250, (bio: string) => Ajax.updateBio(bio));
        this.profileBioWrapper.append(this.bioEditor.rootElm);

        this.postBox = new PostsBox(0, this.postWrapper, this.rootElm);
    }

    /*
        Request a full profile and send it to load() when it arrives. XXX make this request in load and have the login in there be inside the callback. XXX
    */
    public launch(profileId: number): void { Ajax.getFullProfile(profileId, (fullProfile: FullProfileRecord) => this.load(fullProfile)); }

    /*
        Loads profile information into the different slots and then opens this modal.
    */
    public load(fullProfile: FullProfileRecord): void {

        // Clear out modal.
        this.reset();

        // Get a handle on the new arrival.
        this.profile = fullProfile;
        
        // Set name display.
        this.nameEditor.setText2(fullProfile.firstName, fullProfile.lastName);

        // Set bio display.
        this.bioEditor.setText(fullProfile.bio);

        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (this.profile.profileId == User.profileId) {

            // set click callback of profile picture to invoke select profile picture,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => this.selectProfilePicture()

            // give button for user to edit bio,
            this.profileNameWrapper.append(this.btnChangeName);
            this.profileBioWrapper.append(this.btnChangeBio);
        }

        // else, this profile is not the current user's so,
        else {

            // set click callback of profile picture to display it in fullsize image modal,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId);

            // and detach the button to edit the bio.
            ViewUtil.remove(this.btnChangeName);
            ViewUtil.remove(this.btnChangeBio);
        }

        // Set profile picture display.
        this.profilePictureBox.loadImage(new ImageCard(this.profile.profilePicture));

        // IMAGES BOX
        // Construct new ProfileImageBox and set up profile images display.
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, this.imageScrollBox, (target: ImageCard) =>
            
            // Set click callback of each image to open a collection in fullzise image modal.
            fullSizeImageModal.load(this.imagesBox.content.indexOf(target), this.profile.profileId));

        // Append new profile images box to container elm.
        this.imageWrapper.append(this.imagesBox.rootElm);
        
        // LAZY LOADING IMAGES
        // On image box scroll,
        this.imageScrollBox.onscroll = (e: UIEvent) => {

            // create shortcut,
            let divHeight: number = Util.getElmHeight(this.imageScrollBox);

            // take measurement,
            let offset: number = this.imageScrollBox.scrollTop + divHeight - 50;

            // and if threshold is surpassed, request more images.
            if (offset >= divHeight) this.imagesBox.request(5);
        }

        // FRIENDS BOX
        // Construct new Content box and set of friends display.
        this.friendBox = new ContentBox(this.friendBoxElm);

        // Clear friends box. Even though this was just constructed it reused an existing elm that could still have profile cards in it.
        this.friendBox.clear();

        // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
        Ajax.getFriends(this.profile.profileId, null, (profileCards: ProfileCard[]) => this.friendBox.add(profileCards));

        // POSTS BOX
        this.postBox.profileId = this.profile.profileId;

        this.postBox.clear();

        // Start post feed to make first request.
        this.postBox.start();

        // LAZY LOADING POSTS
        // Set scroll callback for modalCon.
        this.rootElm.onscroll = (e: UIEvent) => {

            // Make shortcut.
            let divHeight: number = Util.getDocumentHeight();

            // Take measurment.
            let offset: number = this.rootElm.scrollTop + window.innerHeight + 2000;

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

        // Load image dropdown for current user and set the onclick to change profile picture.
        imageDropdown.load(User.profileId, "Select a profile picture", (target: ImageCard) => {

            // Close the image dropdown.
            imageDropdown.close();

            // Reset z index of dropdown.
            imageDropdown.rootElm.style.zIndex = '0'; // XXX move to onclose of imageDropdown. XXX

            // Change any occurence of the user's profile picture to the newly selected one.
            ProfileCard.changeUserProfilePicture(target);

            // Update stored shorcut to profile picture.
            User.profilePictureId = target.image.imageId;

            // Inserts the low res thumbnail as a placeholder until the fullsize version is returned.
            this.profilePictureBox.loadImage(target);

            // Send an update request to the host to change the profile picture in the profile record.
            Ajax.updateProfilePicture(target.image.imageId, null, null,

                // When the host sends back the fullsize version of the new profile picture, load it into the profile modal display.
                (imageCard: ImageCard) =>
                    this.profilePictureBox.loadImage(imageCard));
        });
    }

    /*
        Empties out the containers that are refilled on load and deletes the components that are reconstructed on load.
    */
    private reset(): void {

        // Emptie out the containers that are refilled on load.
        ViewUtil.empty(this.imageWrapper);
        //ViewUtil.empty(this.postWrapper);

        // Delete the components that are reconstructed on load.
        delete this.imagesBox;
        //delete this.postBox;
    }
}
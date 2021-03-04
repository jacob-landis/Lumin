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

    // STAGE FLAGS
    private fullProfileStaged: StageFlag = new StageFlag();
    private imagesBoxStaged: StageFlag = new StageFlag();
    private friendsStaged: StageFlag = new StageFlag();

    private stageFlags: StageFlag[];

    private stageContainers: HTMLElement[];

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

        // Populate stage flags array.
        this.stageFlags = [this.fullProfileStaged, this.imagesBoxStaged, this.friendsStaged];
        
        // Construct an ImageBox for the profile picture and get a handle on it.
        this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        
        this.nameEditor = new DoubleEditor(this.btnChangeName, '', '', doubleEditorClassList, 30,
            (firstName: string, lastName: string) => {
                ProfileCard.changeUserProfileName(firstName, lastName);
                Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
            });
        this.profileNameWrapper.append(this.nameEditor.rootElm);
        
        // Construct an Editor for profile bio and get a handle on it.
        this.bioEditor = new Editor(this.btnChangeBio, '', editorClassList, true, 250, (bio: string) => Ajax.updateBio(bio));
        this.profileBioWrapper.append(this.bioEditor.rootElm);

        this.postBox = new PostsBox(0, this.postWrapper, this.rootElm);

        this.stageContainers = [
            this.profilePictureBox.rootElm, this.profileNameWrapper,
            this.profileBioWrapper, this.friendBoxElm, this.imageScrollBox
        ];
    }
    
    /*
        Loads profile information into the different slots and then opens this modal.
    */
    public load(profileId: number): void {
        
        // Clear out modal.
        this.reset();

        Ajax.getFullProfile(profileId, (fullProfile: FullProfileRecord) => {

            // Get a handle on the new profile.
            this.profile = fullProfile;

            // Set name display.
            this.nameEditor.setText2(this.profile.firstName, this.profile.lastName); 
            this.bioEditor.setText(this.profile.bio);

            // Set profile picture display.
            this.profilePictureBox.loadImage(new ImageCard(this.profile.profilePicture));

            this.updateStage(this.fullProfileStaged);
        });

        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (profileId == User.profileId) { // AWAIT

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

        // IMAGES BOX
        // Hide images box.

        // Construct new ProfileImageBox and set up profile images display.
        this.imagesBox = new ProfileImagesBox(profileId, this.imageScrollBox, (target: ImageCard) =>  // AWAIT. Use ContentBox.loading
            
            // Set click callback of each image to open a collection in fullzise image modal.
            fullSizeImageModal.load(this.imagesBox.content.indexOf(target), profileId));

        this.imagesBox.onLoadEnd = () => this.updateStage(this.imagesBoxStaged);

        // Append new profile images box to container elm.
        this.imageWrapper.append(this.imagesBox.rootElm);

        // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
        Ajax.getFriends(profileId, null, (profileCards: ProfileCard[]) => {
            this.friendBox.add(profileCards);
            this.updateStage(this.friendsStaged);
        });
    
        // Create post box and start feed.
        this.postBox.profileId = profileId;
        this.postBox.start();
        
        // Open this modal.
        super.open();
    }

    private updateStage(stageFlag: StageFlag) {

        stageFlag.raise();

        let hit: boolean = false;
        this.stageFlags.forEach((flag: StageFlag) => {
            if (!flag.isRaised) hit = true;
        });

        // All stage flags were raised.
        // Display results.
        if (!hit) {

            this.stageContainers.forEach((container: HTMLElement) => {
                ViewUtil.show(container, null, () => {
                    container.style.opacity = '1';
                });
            });
        }
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

            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target));

            // Inserts the low res thumbnail as a placeholder until the fullsize version is returned.
            this.profilePictureBox.loadImage(ImageCard.copy(target));

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

        // Delete the components that are reconstructed on load.
        delete this.imagesBox;

        // Clear name and bio.
        this.nameEditor.setText2('', '');
        this.bioEditor.setText('');

        // FRIENDS BOX
        // Construct new Content box and set of friends display.
        this.friendBox = new ContentBox(this.friendBoxElm);

        // Clear friends box and posts box. Even though these were just constructed, they reused an existing elm that could still have cards in it.
        this.friendBox.clear();
        this.postBox.clear();

        // Change style to 'blank' state.
        this.stageContainers.forEach((container: HTMLElement) => {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });

        this.stageFlags.forEach((flag: StageFlag) => flag.lower());
    }
}
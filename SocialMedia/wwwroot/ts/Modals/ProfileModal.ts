/*
    This class contains the functionality for the profile modal.
*/
class ProfileModal extends Modal {
    
    // ImageBox for profile picture.
    public profilePictureBox: ImageBox;
    
    private nameEditor: DoubleEditor;
    private bioEditor: Editor;

    // A FULL profile. The profile being displayed. 
    private profile: FullProfileRecord;
    
    // A ProfileImagesBox used to show a profile's images.
    private imagesBox: ProfileImagesBox;
    
    // A ContentBox used to show a profile's friends.
    private friendBox: ContentBox;
    
    // STAGE FLAGS
    private fullProfileStaged: StageFlag = new StageFlag();
    private imagesBoxStaged: StageFlag = new StageFlag();
    private friendsStaged: StageFlag = new StageFlag();

    private summaryStage: Stage;
    private summaryStageContainers: HTMLElement[];

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
    */
    public constructor(
        rootElm: HTMLElement,                       private profileNameWrapper: HTMLElement,
        private imageWrapper: HTMLElement,          private profileBioWrapper: HTMLElement,
        private imageScrollBox: HTMLElement,        private friendBoxElm: HTMLElement,
        private relationWrapper: HTMLElement,       imageBoxElm: HTMLElement,
        private profilePostsCard: ProfilePostsCard, private profileSettingsCard: ProfileSettingsCard,
        imageClassList: string,                     editorClassList: string,
        doubleEditorClassList: string
    ) {
        super(rootElm);
        
        this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);
        
        this.nameEditor = new DoubleEditor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' }), '', '', doubleEditorClassList, 30,
            (firstName: string, lastName: string) => {
                ProfileCard.changeUserProfileName(firstName, lastName);
                Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
            });
        
        this.bioEditor = new Editor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' }), '', editorClassList, true, 250,
            (bio: string) => Ajax.updateBio(bio));

        this.profileNameWrapper.append(this.nameEditor.rootElm);
        this.profileBioWrapper.append(this.bioEditor.rootElm);

        this.summaryStageContainers = [
            this.profilePictureBox.rootElm, this.profileNameWrapper, this.profileBioWrapper,
            this.friendBoxElm, this.imageScrollBox, this.relationWrapper
        ]

        this.summaryStage = new Stage([this.fullProfileStaged, this.imagesBoxStaged, this.friendsStaged], () =>
            this.summaryStageContainers.forEach((container: HTMLElement) =>
                ViewUtil.show(container, null, () => container.style.opacity = '1')
            )
        );

        // Construct new Content box and set of friends display.
        this.friendBox = new ContentBox(this.friendBoxElm);
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

            this.summaryStage.updateStaging(this.fullProfileStaged);
        });

        Ajax.getProfile(profileId, (profileCard: ProfileCard) => {

            // If NOT current user.
            if (profileCard.profile.relationToUser != 'me') 
                this.relationWrapper.append(new RelationCard(profileCard.profile).rootElm);

            // If current user.
            else if (profileCard.profile.relationToUser == 'me')
                this.profileSettingsCard.setPrivacySelectValues(profileCard.profile);

            if (profileCard.profile.profileFriendsPrivacyLevel <= profileCard.profile.relationshipTier) {

                // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
                Ajax.getFriends(profileId, null, (profileCards: ProfileCard[]) => {
                    if (profileCards != null) this.friendBox.add(profileCards);
                    this.summaryStage.updateStaging(this.friendsStaged);
                });
            }

            if (profileCard.profile.profilePostsPrivacyLevel <= profileCard.profile.relationshipTier)
                this.profilePostsCard.load(profileId);

            if (profileCard.profile.profileImagesPrivacyLevel <= profileCard.profile.relationshipTier) {

                // Construct new ProfileImageBox and set up profile images display.
                this.imagesBox = new ProfileImagesBox(profileId, 'Fullscreen', this.imageScrollBox, (target: ImageCard) =>

                    // Set click callback of each image to open a collection in fullzise image modal.
                    fullSizeImageModal.load(this.imagesBox.content.indexOf(target), profileId));

                this.imagesBox.onLoadEnd = () => this.summaryStage.updateStaging(this.imagesBoxStaged);

                // Append new profile images box to container elm.
                this.imageWrapper.append(this.imagesBox.rootElm);
            }
        });

        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (profileId == User.profileId) {

            // Callback is used to workaround issue caused by a delay in hiding.
            ViewUtil.show(this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block',
                () => ViewUtil.show(this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block'));

            // set click callback of profile picture to invoke select profile picture,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => this.selectProfilePicture()
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';

            // give button for user to edit bio,
            this.nameEditor.enableEditing();
            this.bioEditor.enableEditing();
        }

        // else, this profile is not the current user's so,
        else {

            // set click callback of profile picture to display it in fullsize image modal,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId);
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';

            // and detach the button to edit the bio.
            this.nameEditor.disableEditing();
            this.bioEditor.disableEditing();
        }
        
        // Open this modal.
        super.open();
    }
    
    /*
        Opens and configures the image dropdown to return the image the user selects.
    */
    private selectProfilePicture(): void {

        // Off-click detection.
        // Listen for any clicks not related to the process of selecting an image and end the process if one is found.
        // callback is stored in a variable so that the variable can be referenced to remove the event listener.
        let callback = (event: MouseEvent) => {

            let hit = false;
            ['btnImageModalUploadImage', 'plusIcon', 'imageFileIcon', 'imageDropdown', 'imageDropDownContent'].forEach((id: string) => {
                if (event.srcElement == document.getElementById(id)) hit = true;
            });

            if (!hit && !uploadImageModal.hasFocus) {
                imageDropdown.close();
                window.removeEventListener('mouseup', callback);
            }
        }
        window.addEventListener('mouseup', callback);

        // Load image dropdown for current user and set the onclick to change profile picture.
        imageDropdown.load(User.profileId, "Select a profile picture", "Set profile picture", (target: ImageCard) => {
            
            // Reset z index of dropdown.
            imageDropdown.rootElm.style.zIndex = '0'; // XXX move to onclose of imageDropdown. XXX

            // Change any occurence of the user's profile picture to the newly selected one.
            ProfileCard.changeUserProfilePicture(target);

            // Update stored shorcut to profile picture.
            User.profilePictureId = target.image.imageId;

            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target));
            
            // Send an update request to the host to change the profile picture in the profile record.
            Ajax.updateProfilePicture(target.image.imageId, null, 'Change profile picture', null,

                // When the host sends back the fullsize version of the new profile picture, load it into the profile modal display.
                (imageCard: ImageCard) =>
                    this.profilePictureBox.loadImage(imageCard));
        });
    }

    /*
        Empties out the containers that are refilled on load and deletes the components that are reconstructed on load.
    */
    private reset(): void {

        ViewUtil.hide(this.profileSettingsCard.btnToggleSettingsSection.rootElm);
        ViewUtil.hide(this.profileSettingsCard.rootElm);
        this.profileSettingsCard.btnToggleSettingsSection.reset();

        // Emptie out the containers that are refilled on load.
        ViewUtil.empty(this.imageWrapper);
        ViewUtil.empty(this.relationWrapper);

        // Delete the components that are reconstructed on load.
        delete this.imagesBox;

        // Clear name and bio.
        this.nameEditor.setText2('', '');
        this.bioEditor.setText('');

        // FRIENDS BOX
        // Construct new Content box and set of friends display.
        // Clear friends box and posts box.
        this.friendBox.clear();
        this.profilePostsCard.clear();
        this.friendBox = new ContentBox(this.friendBoxElm);


        // Change style to 'blank' state.
        this.summaryStageContainers.forEach((container: HTMLElement) => {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });

        this.summaryStage.flags.forEach((flag: StageFlag) => flag.lower());
    }
}
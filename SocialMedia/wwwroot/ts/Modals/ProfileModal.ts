﻿/*
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
    private friendBox: FriendsBox;
    private requestFriends: (skip: number, take: number) => void;
    private requestFriendsTrigger: (skip: number, take: number) => void = (skip: number, take: number) => this.requestFriends(skip, take);

    private profilePostsCard: ProfilePostsCard;

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
        contentElm: HTMLElement,                    private profileNameWrapper: HTMLElement,
        private imageWrapper: HTMLElement,          private profileBioWrapper: HTMLElement,
        private imageScrollBox: HTMLElement,        private friendBoxElm: HTMLElement,
        private relationWrapper: HTMLElement,       imageBoxElm: HTMLElement,
        public summaryWrapper: HTMLElement,

        // ProfilePostsCard elements
        profilePosts: HTMLElement,                  btnToggleSearchBar: HTMLElement,
        btnTogglePostFeedFilter: HTMLElement,       btnRefreshProfilePostFeed: HTMLElement,
        btnMyPostActivity: HTMLElement,             btnSearchPosts: HTMLElement,
        txtSearchPosts: HTMLInputElement,           commentedPostsBoxWrapper: HTMLElement,
        likedPostsBoxWrapper: HTMLElement,          mainPostsBoxWrapper: HTMLElement,

        private profileSettingsCard: ProfileSettingsCard,
        imageClassList: string,
        editorClassList: string,
        doubleEditorClassList: string
    ) {
        super(contentElm);
        
        this.profilePictureBox = new ImageBox(imageBoxElm, imageClassList, null);

        this.profilePostsCard = new ProfilePostsCard(this.rootElm, profilePosts, btnToggleSearchBar, btnTogglePostFeedFilter, btnRefreshProfilePostFeed, 
            btnMyPostActivity, btnSearchPosts, txtSearchPosts, commentedPostsBoxWrapper, likedPostsBoxWrapper, mainPostsBoxWrapper, this);

        this.nameEditor = new DoubleEditor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' }), '', '', doubleEditorClassList, 30,
            (firstName: string, lastName: string) => {
                ProfileCard.changeUserProfileName(firstName, lastName);
                Ajax.updateName(JSON.stringify({ FirstName: firstName, LastName: lastName }));
            },
            this
        );
        
        this.bioEditor = new Editor(ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' }), '', editorClassList, true, 250, this,
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
        this.friendBox = new FriendsBox(this.friendBoxElm, this.friendBoxElm, this.requestFriendsTrigger);
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
            if (this.profile.profilePicture != null)
                this.profilePictureBox.loadImage(new ImageCard(this.profile.profilePicture));

            this.summaryStage.updateStaging(this.fullProfileStaged);
        });

        Ajax.getProfile(profileId, (profileCard: ProfileCard) => {

            // If NOT current user.
            if (profileCard.profile.relationToUser != 'me') {

                if (profileCard.profile.relationToUser != "unrelated") {

                    let preface: string;
                    let relation: string = profileCard.profile.relationToUser;

                    if (relation == "friend") {
                        preface = "Friends since";
                    }
                    else if (relation == "userRequested" || relation == "requestedUser") {
                        preface = "Pending since";
                    }
                    else if (profileCard.profile.blockerProfileId == User.profileId) {
                        preface = "Blocked since";
                    }

                    let lblRelationshipDatetime: HTMLElement =
                        ViewUtil.tag("div", { innerText: `${preface} ${Util.formatDateTime(profileCard.profile.relationshipChangeDatetime)}` })

                    this.relationWrapper.append(lblRelationshipDatetime);
                }

                this.relationWrapper.append(new RelationCard(profileCard.profile).rootElm);
            }

            // Else if current user.
            else if (profileCard.profile.relationToUser == 'me') {

                this.profileSettingsCard.setPrivacySelectValues(profileCard.profile);

                this.relationWrapper.append(
                    ViewUtil.tag("div", { innerText: `Account created on ${Util.formatDateTime(profileCard.profile.accountCreationDatetime)}` }));
            }

            this.summaryWrapper.style.backgroundColor = profileCard.profile.profileColor;

            if (profileCard.profile.profileFriendsPrivacyLevel <= profileCard.profile.relationshipTier) {

                this.requestFriends = (skip: number, take: number) => {

                    // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
                    Ajax.getFriends(profileId, "profileModal", skip, take, null, (profileCards: ProfileCard[]) => {
                        if (profileCards != null) this.friendBox.add(profileCards);
                        this.summaryStage.updateStaging(this.friendsStaged);
                    });
                }
                this.friendBox.request(20);
            }
            else {
                this.friendBox.messageElm.innerText = `This user's friends are private.`;
                this.summaryStage.updateStaging(this.friendsStaged);
            }

            this.profilePostsCard.load(profileId);
            
            // Construct new ProfileImageBox and set up profile images display.
            this.imagesBox = new ProfileImagesBox('Fullscreen', this.imageScrollBox, (target: ImageBox) =>

                // Set click callback of each image to open a collection in fullzise image modal.
                imageGalleryModal.load(this.imagesBox.content.indexOf(target), profileId));

            this.imagesBox.onLoadEnd = () => {
                this.summaryStage.updateStaging(this.imagesBoxStaged);

                if (this.imagesBox.content.length == 0)
                    this.imageWrapper.innerHTML = 'No images were retrieved.';
            }

            this.imagesBox.load(profileId);

            // Append new profile images box to container elm.
            this.imageWrapper.append(this.imagesBox.rootElm);

            // Open this modal.
            super.open();
        });

        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (profileId == User.profileId) {

            // Callback is used to workaround issue caused by a delay in hiding.
            ViewUtil.show(this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block',
                () => ViewUtil.show(this.profileSettingsCard.btnToggleSettingsSection.rootElm, 'block'));

            // set click callback of profile picture to invoke select profile picture,
            this.profilePictureBox.heldImageClick = (target: ImageBox) => this.selectProfilePicture()
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';

            // give button for user to edit bio,
            this.nameEditor.enableEditing();
            this.bioEditor.enableEditing();
        }

        // else, this profile is not the current user's so,
        else {

            // set click callback of profile picture to display it in fullsize image modal,
            this.profilePictureBox.heldImageClick = (target: ImageBox) => imageGalleryModal.loadSingle(target.imageCard.image.imageId);
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';

            // and detach the button to edit the bio.
            this.nameEditor.disableEditing();
            this.bioEditor.disableEditing();
        }
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
        imageDropdown.load(User.profileId, "Select a profile picture", "Set profile picture", (target: ImageBox) => {
            
            // Reset z index of dropdown.
            imageDropdown.rootElm.style.zIndex = '0'; // XXX move to onclose of imageDropdown. XXX

            // Change any occurence of the user's profile picture to the newly selected one.
            ProfileCard.changeUserProfilePicture(target.imageCard);

            // Update stored shorcut to profile picture.
            User.profilePictureId = target.imageCard.image.imageId;

            navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(target.imageCard));
            
            // Send an update request to the host to change the profile picture in the profile record.
            Ajax.updateProfilePicture(target.imageCard.image.imageId, null, 'Change profile picture', null,

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
        ViewUtil.empty(this.friendBoxElm);
        this.friendBox = new FriendsBox(this.friendBoxElm, this.friendBoxElm, this.requestFriendsTrigger);

        this.profilePostsCard.clear();

        // Change style to 'blank' state.
        this.summaryStageContainers.forEach((container: HTMLElement) => {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });

        this.summaryStage.flags.forEach((flag: StageFlag) => flag.lower());
    }

    public close(): void {

        // If there are unsaved changes in the settings, ask the user to confirm reverting those changes.
        if (ViewUtil.isDisplayed(this.profileSettingsCard.rootElm)) {

            if (this.profileSettingsCard.isChanged()) {
                confirmPrompt.load("Are you sure you want to revert all changes to your privacy settings?", (answer: boolean) => {
                    if (answer == true) {
                        this.profileSettingsCard.btnToggleSettingsSection.toggle();
                        this.checkForActiveEditor();
                    }
                });
            }
            // If nothing was changed, but the settings section needs to be closed.
            else {
                this.profileSettingsCard.btnToggleSettingsSection.toggle();
                this.checkForActiveEditor();
            }
        }
        else {
            this.checkForActiveEditor();
        }
    }

    private checkForActiveEditor(): void {

        if (Editor.activeEditor != null && Editor.activeEditor.revertDependency == this) {
            Editor.activeEditor.revert(() => super.close());
        }
        else super.close();
    }
}
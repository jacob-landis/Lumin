/*
    This class contains the functionality for the profile modal.
*/
class ProfileModal extends Modal {

    // XXX This is not used. XXX
    private content;
    
    // Container elm for a PostsBox that is below the profile modal header.
    private postBoxesWrapper: HTMLElement;
    private mainPostsBoxWrapper: HTMLElement;
    private likedPostsBoxWrapper: HTMLElement;
    private commentedPostsBoxWrapper: HTMLElement;

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

    private feedFilter: 'recent' | 'likes' | 'comments' = 'recent';

    private btnTogglePostFeedFilter: HTMLElement;
    private btnRefreshProfilePostFeed: HTMLElement;
    private btnMyPostActivity: ToggleButton;

    // A PostsBox for displaying a profile's posts.
    private postBoxes: ContentBox;
    private mainPostsBox: PostsBox;
    private likedPostsBox: PostsBox;
    private commentedPostsBox: PostsBox;

    // STAGE FLAGS
    private fullProfileStaged: StageFlag = new StageFlag();
    private imagesBoxStaged: StageFlag = new StageFlag();
    private friendsStaged: StageFlag = new StageFlag();

    private summaryStage: Stage;
    private summaryStageContainers: HTMLElement[];

    private commentedPostsStaged: StageFlag = new StageFlag();
    private likedPostsStaged: StageFlag = new StageFlag();
    private mainPostsStaged: StageFlag = new StageFlag();

    private postBoxesStage: Stage;

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
    */
    public constructor(
        rootElm: HTMLElement,
        content: HTMLElement,
        profileNameWrapper: HTMLElement,
        postBoxesWrapper: HTMLElement,
        mainPostsBoxWrapper: HTMLElement,
        likedPostsBoxWrapper: HTMLElement,
        commentedPostsBoxWrapper: HTMLElement,
        imageWrapper: HTMLElement,
        profileBioWrapper: HTMLElement,
        imageBoxElm: HTMLElement,
        imageScrollBox: HTMLElement,
        friendBoxElm: HTMLElement,
        btnTogglePostFeedFilter: HTMLElement,
        btnRefreshProfilePostFeed: HTMLElement,
        btnMyPostActivity: HTMLElement,
        imageClassList: string,
        editorClassList: string,
        doubleEditorClassList: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.content = content;
        this.postBoxesWrapper = postBoxesWrapper;
        this.commentedPostsBoxWrapper = commentedPostsBoxWrapper;
        this.likedPostsBoxWrapper = likedPostsBoxWrapper;
        this.mainPostsBoxWrapper = mainPostsBoxWrapper;
        this.imageWrapper = imageWrapper;
        this.profileNameWrapper = profileNameWrapper;
        this.profileBioWrapper = profileBioWrapper;
        this.imageScrollBox = imageScrollBox;
        this.friendBoxElm = friendBoxElm;
        this.btnTogglePostFeedFilter = btnTogglePostFeedFilter;
        this.btnRefreshProfilePostFeed = btnRefreshProfilePostFeed;
        this.btnChangeName = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeName' });
        this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });

        this.btnMyPostActivity = new ToggleButton(null, '', 'showingMyPostActivity', 'Show my activity', 'Hide my activity', null, btnMyPostActivity,
            () => this.showMyPostActivity(), () => this.hideMyPostActivity());

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

        this.btnTogglePostFeedFilter.onclick = (event: MouseEvent) => this.togglePostFeedFilter();
        this.btnRefreshProfilePostFeed.onclick = (event: MouseEvent) => this.refreshProfilePostFeed();

        this.postBoxes = new ContentBox(this.postBoxesWrapper);

        this.commentedPostsBox = new PostsBox(0, this.commentedPostsBoxWrapper, this.rootElm, () => {
            this.commentedPostsBox.messageElm.innerText = 'Comment Activity Posts';
            this.postBoxesStage.updateStaging(this.commentedPostsStaged);

            // ShowCommentActivity on each post card in commentedPosts.
            this.commentedPostsBox.content.forEach((content: IAppendable) => {
                let postCard = <PostCard>content;
                postCard.commentsSection.showCommentActivity(() => postCard.stage.updateStaging(postCard.commentsSection.allStaged));
            });
        });

        this.likedPostsBox = new PostsBox(0, this.likedPostsBoxWrapper, this.rootElm, () => {
            this.likedPostsBox.messageElm.innerText = 'Liked Posts';
            this.postBoxesStage.updateStaging(this.likedPostsStaged);
        });

        this.mainPostsBox = new PostsBox(0, this.mainPostsBoxWrapper, this.rootElm, () => {
            this.mainPostsBox.messageElm.innerText = 'All Posts'
            this.postBoxesStage.updateStaging(this.mainPostsStaged);
        });

        this.summaryStageContainers = [
            this.profilePictureBox.rootElm, this.profileNameWrapper,
            this.profileBioWrapper, this.friendBoxElm, this.imageScrollBox
        ]

        this.summaryStage = new Stage([this.fullProfileStaged, this.imagesBoxStaged, this.friendsStaged],
            () => {
                this.summaryStageContainers.forEach((container: HTMLElement) => {
                    ViewUtil.show(container, null, () => {
                        container.style.opacity = '1';
                    });
                });
            }
        );
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

        // PRIVATE PROFILE OPTIONS
        // If profile is current user's,
        if (profileId == User.profileId) {

            // set click callback of profile picture to invoke select profile picture,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => this.selectProfilePicture()
            this.profilePictureBox.heldTooltipMsg = 'Change profile picture';

            // give button for user to edit bio,
            this.profileNameWrapper.append(this.btnChangeName);
            this.profileBioWrapper.append(this.btnChangeBio);
        }

        // else, this profile is not the current user's so,
        else {

            // set click callback of profile picture to display it in fullsize image modal,
            this.profilePictureBox.heldImageClick = (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId);
            this.profilePictureBox.heldTooltipMsg = 'Fullscreen';

            // and detach the button to edit the bio.
            ViewUtil.remove(this.btnChangeName);
            ViewUtil.remove(this.btnChangeBio);
        }
        
        // Construct new ProfileImageBox and set up profile images display.
        this.imagesBox = new ProfileImagesBox(profileId, 'Fullscreen', this.imageScrollBox, (target: ImageCard) =>
            
            // Set click callback of each image to open a collection in fullzise image modal.
            fullSizeImageModal.load(this.imagesBox.content.indexOf(target), profileId));

        this.imagesBox.onLoadEnd = () => this.summaryStage.updateStaging(this.imagesBoxStaged);

        // Append new profile images box to container elm.
        this.imageWrapper.append(this.imagesBox.rootElm);

        // Request friends by ProfileID and load them into friendBox when they arrive as profile cards.
        Ajax.getFriends(profileId, null, (profileCards: ProfileCard[]) => {
            this.friendBox.add(profileCards);
            this.summaryStage.updateStaging(this.friendsStaged);
        });

        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts());
        this.mainPostsBox.onLoadEnd = () => this.postBoxesStage.updateStaging(this.mainPostsStaged);

        // Create post box and start feed.
        this.mainPostsBox.profileId = profileId;
        this.mainPostsBox.start();
        
        // Open this modal.
        super.open();
    }

    private togglePostFeedFilter(): void {

        let feedFilterSecondIcon = this.btnTogglePostFeedFilter.children[1];
        
        switch (this.feedFilter) {
            case 'recent': { // Switch to likes. Next: comments
                this.feedFilter = 'likes';
                this.btnTogglePostFeedFilter.title = 'Sort by comment popularity';
                feedFilterSecondIcon.classList.remove('fa-thumbs-up');
                feedFilterSecondIcon.classList.add('fa-comments');
                break;
            }
            case 'likes': { // Switch to comments. Next: recent
                this.feedFilter = 'comments';
                this.btnTogglePostFeedFilter.title = 'Sort by recent';
                feedFilterSecondIcon.classList.remove('fa-comments');
                feedFilterSecondIcon.classList.add('fa-calendar');
                break;
            }
            case 'comments': { // Switch to recent. Next: likes
                this.feedFilter = 'recent';
                this.btnTogglePostFeedFilter.title = 'Sort by like popularity';
                feedFilterSecondIcon.classList.remove('fa-calendar');
                feedFilterSecondIcon.classList.add('fa-thumbs-up');
                break;
            }
        }

        this.mainPostsBox.clear();
        this.mainPostsBox.requestCallback = (skip: number, take: number) => {
            Ajax.getProfilePosts(this.profile.profileId, skip, take, this.feedFilter, (postCards: PostCard[]) => {

                if (postCards == null) return;
                this.mainPostsBox.add(postCards);
            });
        }

        this.mainPostsBox.start();
    }

    private refreshProfilePostFeed(): void {
        //this.mainPostsBox.clear();
        //this.mainPostsBox.start();

        this.postBoxesStage = new Stage([this.mainPostsStaged], () => this.displayPosts());
        ViewUtil.hide(this.postBoxes.rootElm);

        this.mainPostsBox.refreshPosts(() => {

            if (this.commentedPostsBox.length > 0 || this.likedPostsBox.length > 0) this.mainPostsBox.messageElm.innerText = 'All Posts';
            this.postBoxesStage.updateStaging(this.mainPostsStaged);
        });

        if (this.commentedPostsBox.length > 0) {

            this.postBoxesStage.stageFlags.push(this.commentedPostsStaged);
            this.commentedPostsBox.refreshPosts(() => this.postBoxesStage.updateStaging(this.commentedPostsStaged));
        }

        if (this.likedPostsBox.length > 0) {

            this.postBoxesStage.stageFlags.push(this.likedPostsStaged);
            this.likedPostsBox.refreshPosts(() => this.postBoxesStage.updateStaging(this.likedPostsStaged));
        }
    }

    private showMyPostActivity(): void {
        this.postBoxesStage = new Stage([this.commentedPostsStaged, this.likedPostsStaged], () => this.displayPosts());
        ViewUtil.hide(this.postBoxes.rootElm);
        this.commentedPostsBox.request(15);
        this.likedPostsBox.request(15);
        this.setBtnMyPostActivity(false);
    }

    private hideMyPostActivity(): void {
        this.commentedPostsBox.clear();
        this.likedPostsBox.clear();
        this.commentedPostsBox.messageElm.innerText = '';
        this.likedPostsBox.messageElm.innerText = '';
        this.mainPostsBox.messageElm.innerText = '';
        this.setBtnMyPostActivity(true);
    }

    private setBtnMyPostActivity(makeBtnShowActivity: boolean): void {
        this.mainPostsBox.messageElm.innerText = makeBtnShowActivity ? '' : 'All Posts';
        this.btnMyPostActivity.toggle();
    }

    private displayPosts(): void {
        ViewUtil.show(this.postBoxes.rootElm, 'block');
    }

    /*
        Opens and configures the image dropdown to return the image the user selects.
    */
    private selectProfilePicture(): void {

        // Load image dropdown for current user and set the onclick to change profile picture.
        imageDropdown.load(User.profileId, "Select a profile picture", "Set profile picture", (target: ImageCard) => {

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
            this.profilePictureBox.loadImage(ImageCard.copy(target, null, 'Change profile picture'));

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
        this.mainPostsBox.clear();

        // Change style to 'blank' state.
        this.summaryStageContainers.forEach((container: HTMLElement) => {
            container.style.opacity = '0';
            ViewUtil.hide(container);
        });

        this.summaryStage.stageFlags.forEach((flag: StageFlag) => flag.lower());
    }
}
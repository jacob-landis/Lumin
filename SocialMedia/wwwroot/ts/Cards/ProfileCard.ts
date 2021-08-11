class ProfileCard extends Card {

    public static profileCards: ProfileCard[] = [];

    public static list(profiles: ProfileRecord[], includeRelationButton?: boolean): ProfileCard[] {
        if (profiles == null) return null;
        let profileCards: ProfileCard[] = [];
        profiles.forEach((profileRecord: ProfileRecord) => profileCards.push(new ProfileCard(profileRecord, includeRelationButton)));
        return profileCards;
    }

    public static changeUserProfilePicture(imageCard: ImageCard): void {
        ProfileCard.profileCards.forEach((profileCard: ProfileCard) => {
            if (profileCard.profile.profileId == User.profileId) profileCard.imageBox.loadImage(ImageCard.copy(imageCard));
        });
    }

    public static changeUserProfileName(firstName: string, lastName: string): void {
        ProfileCard.profileCards.forEach((profileCard: ProfileCard) => {
            if (profileCard.profile.profileId == User.profileId) profileCard.txtName.innerText = firstName + " " + lastName;
        });
    }

    private static blockCases = {
        'unblocked': {
            label: 'Block user',
            nextCase: 'blocked',
            action: (profileCard: ProfileCard) => {
                confirmPrompt.load('Are you sure you want to block this user?',
                    (confirmation: boolean) => {
                        if (confirmation) {

                            // Remove posts by this profile.
                            PostCard.postCards.forEach((p: PostCard) => {
                                if (p.post.profile.profileId == profileCard.profile.profileId) ViewUtil.remove(p.rootElm);
                            });

                            // Remove relation context option and relation button.
                            profileCard.contextOptions = [profileCard.blockOption];

                            profileCard.relationCard.rootElm.remove();

                            Ajax.blockProfile(profileCard.profile.profileId);
                        }
                    });
            }
        },
        'blocked': {
            label: 'Unblock user',
            nextCase: 'unblocked',
            action: (profileCard: ProfileCard) => {
                confirmPrompt.load('Are you sure you want to unblock this user?',
                    (confirmation: boolean) => {
                        if (confirmation) {

                            // Add context option and relation button.
                            profileCard.contextOptions.push(profileCard.blockOption, profileCard.relationOption);

                            if (profileCard.includeRelationButton)
                                profileCard.rootElm.append(profileCard.relationCard.rootElm);

                            Ajax.unblockProfile(profileCard.profile.profileId);
                        }
                    });
            }
        }
    }

    private blockCase: { label: string, nextCase: string, action: (profileCard: ProfileCard) => void };
    public blockOption: ContextOption;
    public relationOption: ContextOption;
    public contextOptions: ContextOption[] = [];


    public relationCard: RelationCard;

    private imageBox: ImageBox;
    public txtName: HTMLElement;

    /*
        Example:
        <div class="profileCard">
            <div class="profileCardThumbWrapper image-box">
                <img class="sqr" src="{image data}">
            </div>
            <span class="profileCardName">Jane Doe</span>
        </div>
    */
    public constructor(public profile: ProfileRecord, public includeRelationButton?: boolean) {

        super(ViewUtil.tag('div', { classList: 'profileCard' }));
        
        this.imageBox = new ImageBox(ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }), 'sqr', null, null, 0);

        this.imageBoxes.push(this.imageBox);

        if (this.profile.profilePicture != null)
            this.imageBox.loadImage(new ImageCard(this.profile.profilePicture, 'sqr', null, (target: ImageBox) => { }));

        this.txtName = ViewUtil.tag('span', { classList: 'profileCardName', innerText: `${this.profile.firstName} ${this.profile.lastName}` });

        this.rootElm.append(this.imageBox.rootElm, this.txtName);

        let isFriendOrMe: boolean = this.profile.relationToUser == 'friend' || this.profile.relationToUser == 'me'

        // card click
        this.rootElm.onclick = e => {
            if (e.target == this.rootElm || e.target == this.txtName || e.target == this.imageBox.imageCard.rootElm)
                profileModal.load(this.profile.profileId);
        }

        if (this.profile.relationToUser != 'me') {
            
            this.relationCard = new RelationCard(profile);
            
            this.blockCase = ProfileCard.blockCases[this.profile.blockerProfileId == User.profileId ? 'blocked' : 'unblocked']; 
            
            this.blockOption = new ContextOption(
                Icons.blockProfile(),
                this.blockCase.label,
                (event: MouseEvent) => {
                    this.blockCase.action(this);
                    this.blockCase = ProfileCard.blockCases[this.blockCase.nextCase];
                    this.blockOption.rootElm.title = this.blockCase.label;
                }
            );

            this.relationOption = new ContextOption(
                ViewUtil.copy(this.relationCard.rootElm),
                this.relationCard.case.label,
                (event: MouseEvent) => this.relationCard.changeRelation()
            );

            this.contextOptions.push(this.blockOption);

            // If not blocked
            if (this.profile.blockerProfileId != User.profileId) {

                this.contextOptions.push(this.relationOption);

                if (includeRelationButton) this.rootElm.append(this.relationCard.rootElm);
            }
            
            this.rootElm.oncontextmenu = (e: MouseEvent) => contextMenu.load(e, this.contextOptions);
        }

        if (isFriendOrMe)
            this.rootElm.title = 'View full profile';
        
        if (this.profile.relationToUser == 'friend' && !includeRelationButton)
            this.rootElm.title = 'View full profile + Right-Click options';

        ProfileCard.profileCards.push(this);
    }
}
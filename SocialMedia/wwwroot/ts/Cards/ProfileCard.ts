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
    public constructor(public profile: ProfileRecord, includeRelationButton?: boolean) {

        super(ViewUtil.tag('div', { classList: 'profileCard' }));
        
        this.imageBox = new ImageBox(ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }), 'sqr', null, null, true);

        this.imageBox.loadImage(new ImageCard(this.profile.profilePicture, 'sqr', null, (target: ImageCard) => { }));

        this.txtName = ViewUtil.tag('span', { classList: 'profileCardName', innerText: `${this.profile.firstName} ${this.profile.lastName}` });

        this.rootElm.append(this.imageBox.rootElm, this.txtName);

        let isFriendOrMe: boolean = this.profile.relationToUser == 'friend' || this.profile.relationToUser == 'me'

        // card click
        if (isFriendOrMe) {
            this.rootElm.onclick = e => profileModal.load(this.profile.profileId);
        }

        if (this.profile.relationToUser != 'me') {
            
            this.relationCard = new RelationCard(profile);

            if (includeRelationButton) {
                this.rootElm.append(this.relationCard.rootElm);
            }
            else {
                this.rootElm.oncontextmenu = (e: MouseEvent) => contextMenu.load(e, [
                    new ContextOption(this.relationCard.rootElm, this.relationCard.case.label, (e: MouseEvent) => this.relationCard.changeRelation())
                ]);
            }
        }

        if (isFriendOrMe)
            this.rootElm.title = 'View full profile';

        if (!isFriendOrMe && !includeRelationButton)
            this.rootElm.title = 'Right-Click options';

        if (this.profile.relationToUser == 'friend' && !includeRelationButton)
            this.rootElm.title = 'View full profile + Right-Click options';

        ProfileCard.profileCards.push(this);
    }
}
class ProfileCard extends Card {

    public static profileCards: ProfileCard[] = [];

    public static list(profiles: ProfileRecord[]): ProfileCard[] {
        let profileCards: ProfileCard[] = [];
        profiles.forEach((profileRecord: ProfileRecord) => profileCards.push(new ProfileCard(profileRecord)));
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
    
    private static cases = {
        'friend': {
            label: 'Unfriend',
            icon: Icons.removeFriend(),
            nextCase: 'unrelated'
        },
        'userRequested': {
            label: 'Cancel',
            icon: Icons.cancelRequest(),
            nextCase: 'unrelated'
        },
        'requestedUser': {
            label: 'Accept',
            icon: Icons.acceptRequest(),
            nextCase: 'friend'
        },
        'unrelated': {
            label: 'Request',
            icon: Icons.sendRequest(),
            nextCase: 'userRequested'
        }
    }

    public profile: ProfileRecord;
    private case: {label, icon, nextCase};

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
    public constructor(profile: ProfileRecord) {

        super(ViewUtil.tag('div', { classList: 'profileCard' }));

        this.profile = profile;
        this.case = ProfileCard.cases[this.profile.relationToUser];
        
        this.imageBox = new ImageBox(
            ViewUtil.tag('div', { classList: 'profileCardThumbWrapper' }),
            'sqr',
            null,
            true
        );
        this.imageBox.loadImage(new ImageCard(this.profile.profilePicture, 'sqr', (target: ImageCard) => { }));

        this.txtName = ViewUtil.tag('span', { classList: 'profileCardName', innerText: (this.profile.firstName + " " + this.profile.lastName) });

        this.rootElm.append(this.imageBox.rootElm, this.txtName);

        // card click
        if (this.profile.relationToUser == 'friend' || this.profile.relationToUser == 'me')
            this.rootElm.onclick = e => profileModal.launch(this.profile.profileId)

        if (this.profile.relationToUser != 'me') {
            this.rootElm.oncontextmenu = (e: MouseEvent) => contextMenu.load(e, [
                new ContextOption(this.case.icon, (e: MouseEvent) => {
                    
                    switch (this.case.label) {
                        case 'Accept': Ajax.acceptFriendRequest(this.profile.profileId); break;
                        case 'Request': Ajax.sendFriendRequest(this.profile.profileId); break;
                        case 'Cancel': this.remove(); break;
                        case 'Unfriend': confirmPrompt.load('Are you sure you want to unfriend this user?',
                            (confirmation: boolean) => { if (confirmation) this.remove(); });
                    }
                    this.case = ProfileCard.cases[this.case.nextCase];
                })
            ]);
        }
        ProfileCard.profileCards.push(this);
    }

    // removes posts from this friend in public feed
    // (removing friends from lists would require distinguishing those cards from profile cards that are attached to comments)
    private remove(): void {
        PostCard.postCards.forEach((p: PostCard) => {
            if (p.post.profile.profileId == this.profile.profileId) ViewUtil.remove(p.rootElm);
        });

        Ajax.deleteFriend(this.profile.profileId);
    }
}
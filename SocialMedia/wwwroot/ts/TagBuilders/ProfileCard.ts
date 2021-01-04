class ProfileCard extends Card {

    public static profileCards: ProfileCard[] = [];

    public static list(profiles: ProfileRecord[]): ProfileCard[] {
        let profileCards: ProfileCard[] = [];
        profiles.forEach(p => profileCards.push(new ProfileCard(p)));
        return profileCards;
    }

    public static changeUserProfilePicture(imageId: number, imageCard: ImageCard): void {
        if (imageId) Ajax.getImage(imageId, true, null, null, imageCard=> applyChanges(imageCard));
        else applyChanges(imageCard);

        // profile picture is not being set when image is deleted that IS prof pic
        function applyChanges(imageCard) {
            ProfileCard.profileCards.forEach(p => {
                if (p.profile.profileId == User.profileId) p.imageBox.loadImage(ImageCard.copy(imageCard));
            });

            // full scale prof pic will be loaded on ProfileModal because that is the only place to change it
            // however, the default prof pic cannot be selected, only from deleting the current picture
            profileModal.profilePictureBox.loadImage(ImageCard.copy(imageCard));

            User.profilePictureId = imageCard.rawImage.id;
            Ajax.updateProfilePicture(imageCard.rawImage.id);
        }
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
    private case: any;

    private imageBox: ImageBox;

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
        this.imageBox.loadImage(new ImageCard(this.profile.profilePicture, 'sqr', () => { }));
        this.rootElm.append(this.imageBox.rootElm,
            ViewUtil.tag('span', { classList: 'profileCardName', innerText: this.profile.name }));
        
        // card click
        if (this.profile.relationToUser == 'friend' || this.profile.relationToUser == 'me')
            this.rootElm.onclick = e => profileModal.launch(this.profile.profileId)

        if (this.profile.relationToUser != 'me') {
            this.rootElm.oncontextmenu = e => contextMenu.load(e, [
                new ContextOption(this.case.icon, () => {

                    let id = this.profile.profileId;
                    switch (this.case.label) {
                        case 'Accept': Ajax.acceptFriendRequest(id); break;
                        case 'Request': Ajax.sendFriendRequest(id); break;
                        case 'Cancel': this.remove(); break;
                        case 'Unfriend': confirmPrompt.load('Are you sure you want to unfriend this user?',
                            confirmation => { if (confirmation) this.remove(); });
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
        PostCard.postCards.forEach(p => {
            if (p.post.profile.profileId == this.profile.profileId) ViewUtil.remove(p.rootElm);
        });

        Ajax.deleteFriend(this.profile.profileId);
    }
}
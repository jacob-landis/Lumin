class ProfileCard {

    static profileCards = [];

    static list(profiles) {
        let profileCards = [];
        profiles.forEach(p => profileCards.push(new ProfileCard(p)));
        return profileCards;
    }

    static changeUserProfilePicture(imageId, imageCard) {
        if (imageId) Repo.image(imageId, null, null, true, imageCard=> applyChanges(imageCard));
        else applyChanges(imageCard);
        // profile picture is not being set when image is deleted that IS prof pic
        function applyChanges(imageCard) {
            ProfileCard.profileCards.forEach(p => {
                if (p.profile.profileId == User.id) p.imageBox.loadImage(ImageCard.copy(imageCard));
            });

            // full scale prof pic will be loaded on ProfileModal because that is the only place to change it
            // however, the default prof pic cannot be selected, only from deleting the current picture
            ProfileModal.profilePictureBox.loadImage(ImageCard.copy(imageCard));

            User.profilePictureId = imageCard.rawImage.id;
            Repo.updateProfilePicture(imageCard.rawImage.id);
        }
    }

    static cases = {
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

    constructor(profile) {
        this.profile = profile;
        this.case = ProfileCard.cases[this.profile.relationToUser];

        this.tag = ViewUtil.tag('div', { classList: 'profileCard' });
        this.imageBox = new ImageBox(null, 'profileCardThumbWrapper', 'sqr', null, true);
        this.imageBox.loadImage(new ImageCard(this.profile.profilePicture, 'sqr', () => { }));
        this.tag.append(this.imageBox.tag,
            ViewUtil.tag('span', { classList: 'profileCardName', innerText: this.profile.name }));
        
        // card click
        if (this.profile.relationToUser == 'friend' || this.profile.relationToUser == 'me')
            this.tag.onclick = e => ProfileModal.launch(this.profile.profileId)

        if (this.profile.relationToUser != 'me') {
            this.tag.oncontextmenu = e => ContextModal.load(e, [
                new ContextOption(this.case.icon, () => {

                    let id = this.profile.profileId;
                    switch (this.case.label) {
                        case 'Accept': Repo.acceptFriend(id); break;
                        case 'Request': Repo.requestFriend(id); break;
                        case 'Cancel': this.remove(id); break;
                        case 'Unfriend': ConfirmModal.load('Are you sure you want to unfriend this user?',
                            confirmation => { if (confirmation) this.remove(id); });
                    }
                    this.case = ProfileCard.cases[this.case.nextCase];
                })
            ]);
        }
        ProfileCard.profileCards.push(this);
    }

    // removes posts from this friend in public feed
    // (removing friends from lists would require distinguishing those cards from profile cards that are attached to comments)
    remove() {
        PostCard.postCards.forEach(p => {
            if (p.profileId == this.profile.profileId) ViewUtil.remove(p.tag);
        });

        Repo.removeFriend(this.profile.profileId);
    }
}
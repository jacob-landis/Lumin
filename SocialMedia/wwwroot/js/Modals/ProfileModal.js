class ProfileModal {
    
    static initialize() {
        Modal.add(this);
        this.modalCon = document.getElementById('profileModal');
        this.content = document.getElementById('profileModalContent');
        this.profileModalName = document.getElementById('profileModalName');
        this.postWrapper = document.getElementById('profilePosts');

        this.profilePictureBox = new ImageBox(document.getElementById('profileModalPictureWrapper'), '', 'profile-picture sqr', null);
        this.imageWrapper = document.getElementById('profileImages');

        this.profileBioWrapper = document.getElementById('profileBioWrapper');
        this.btnChangeBio = ViewUtil.tag('i', { classList: 'fa fa-edit', id: 'btnChangeBio' });
        this.bioEditor = new Editor(this.btnChangeBio, '', 'bio', 250, bio => Repo.updateBio(bio));
        this.profileBioWrapper.append(this.bioEditor.tag);
    }

    static launch(profileId) { Repo.fullProfile(profileId, fullProfile => this.load(fullProfile)); }

    static load(fullProfile) {
        this.reset();
        this.profile = fullProfile;
        this.profileModalName.innerText = fullProfile.name;
        this.bioEditor.setText(fullProfile.bio);

        // PRIVATE PROFILE OPTIONS
        if (this.profile.profileId == User.id) {
            this.profilePictureBox.heldClick = () => this.selectProfilePicture
            this.profileBioWrapper.append(this.btnChangeBio);
            this.btnChangeBio.onclick = () => this.bioEditor.start();
        }
        else {
            this.profilePictureBox.heldClick = Behavior.singleFullSizeImage;
            ViewUtil.remove(this.btnChangeBio);
        }

        this.profilePictureBox.loadImage(this.profile.profilePicture);

        // Images box
        this.imagesBox = new ProfileImagesBox(this.profile.profileId, imageCard => () =>
            FullSizeImageModal.load(this.imagesBox.contentBox.content.indexOf(imageCard), this.profile.profileId));
        this.imageWrapper.append(this.imagesBox.contentBox.tag);

        // On image box scroll
        this.imageScrollBox = document.getElementById('profileImagesWrapper');
        this.imageScrollBox.onscroll = () => {
            let divHeight = Util.getDivHeight(this.imageScrollBox);
            let offset = this.imageScrollBox.scrollTop + divHeight - 50;

            if (offset >= divHeight) this.imagesBox.contentBox.request(5);
        }

        // Friends box
        this.friendBox = new ContentBox(document.getElementById('profileFriends'));
        this.friendBox.clear();
        Repo.friends(this.profile.profileId, null, profiles => this.friendBox.add(profiles));

        // Posts box
        this.postBox = new PostsBox(this.profile.profileId);
        this.postWrapper.append(this.postBox.contentBox.tag);
        this.postBox.start();

        // On modal scroll
        this.modalCon.onscroll = () => {
            let divHeight = Util.getDocumentHeight();
            let offset = this.modalCon.scrollTop + window.innerHeight + 2000;

            if (offset >= divHeight) this.postBox.contentBox.request();
        }

        this.open();
    }

    static selectProfilePicture() {
        ImageDropdown.load(imageCard => {
            ImageDropdown.close();
            ImageDropdown.dropdownCon.style.zIndex = 0; // move to onclose of imageDropdown?
            ProfileCard.changeUserProfilePicture(null, imageCard);
            Repo.updateProfilePicture(imageCard.rawImage.id, null, null,
                imageCard => ProfileModal.profilePictureBox.loadImage(imageCard));
        });
    }

    static reset() {
        ViewUtil.empty(this.imageWrapper);
        delete this.imagesBox;

        ViewUtil.empty(this.postWrapper);
        delete this.postBox;
    }
}
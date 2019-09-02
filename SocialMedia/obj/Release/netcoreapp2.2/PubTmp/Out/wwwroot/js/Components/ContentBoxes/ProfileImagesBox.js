class ProfileImagesBox {

    static profileImageBoxes = [];

    constructor(profileId, click) {
        this.profileId = profileId ? profileId : User.id;
        this.click = click;

        this.contentBox = new ContentBox(null, 'images-box', 20, (skip, take) => {
            Repo.images(this.profileId, skip, take, 'listImage sqr', this.click, imageCards => this.contentBox.add(imageCards));
        });

        this.contentBox.request(40);

        ProfileImagesBox.profileImageBoxes.push(this);
    }

    addImageCard(imageCard) {
        imageCard.click = this.click;
        imageCard.tag.classList = 'listImage sqr';
        this.contentBox.add(imageCard, true);
    }
}
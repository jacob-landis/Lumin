class ImageCard {

    static imageCards = [];
    set click(click) { this.tag.onclick = click(this); }

    constructor(image, classList?, onImageClick?: (targetImageCard: ImageCard) => void) {
        this.rawImage = image;
        this.tag = ViewUtil.tag('img', {
            src: image.raw,
            classList: classList
        });

        //this.click = onImageClick ? onImageClick(this) : Behavior.singleFullSizeImage(this); XXX consider using this instead of line below. XXX
        this.tag.onclick = onImageClick ? onImageClick(this) : Behavior.singleFullSizeImage(this);

        this.tag.oncontextmenu = image.profileId == User.id ? ImageCard.userImageContextOpts(this) : false;

        ImageCard.imageCards.push(this);
    }

    remove() {
        Repo.deleteImage(this.rawImage.id);

        PostCard.postCards.forEach(p => {
            // Only need to remove tag. Cascading delete in db is done on server.
            if (p.imageId == this.rawImage.id) ViewUtil.remove(p.tag);
        });

        ImageCard.imageCards.forEach(i => {
            if (i.rawImage.id == this.rawImage.id) ViewUtil.remove(i.tag);
        });

        if (this.rawImage.id == User.profilePictureId)
            Repo.image(0, 'sqr', () => { }, true, imageCard =>
                ProfileCard.changeUserProfilePicture(null, imageCard));

        FullSizeImageModal.close();// temporary solution

        delete this;
    }

    static userImageContextOpts = imageCard => e => {
        ContextModal.load(e, [
            new ContextOption(Icons.createPost(), () => {
                ImageDropdown.close();
                CreatePostModal.load(imageCard);
            }),
            new ContextOption(Icons.deleteImage(), () => {
                ConfirmModal.load('Are you sure you want to delete this image?', confirmation => {
                    if (!confirmation) return;
                    imageCard.remove();
                });
            })
        ]);
    }

    static copy(imageCard, newClassList, newClick) {
        return new ImageCard(
            {
                id: imageCard.rawImage.id, 
                raw: imageCard.rawImage.raw 
            },
            (newClassList ? newClassList : imageCard.tag.classList),
            (newClick ? newClick : imageCard.onclick)
        );
    }

    static list(images, classList, onImageClick?: (targetImageCard: ImageCard) => void) {
        if (!images) return null;
        let imageCards = [];
        images.forEach(i => imageCards.push(new ImageCard(i, classList, onImageClick)));
        return imageCards;
    }
}
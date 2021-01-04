class ImageCard extends Card {
    
    public static imageCards = [];

    public static copy(
        imageCard: ImageCard,
        newClassList: string = imageCard.rootElm.classList.value,
        newOnImageClick: (targetImageCard: ImageCard) => void = () => imageCard.rootElm.onclick
    ): ImageCard {
        return new ImageCard(imageCard.image, newClassList, newOnImageClick);
    }

    public static list(images: ImageRecord[], classList: string, onImageClick?: (targetImageCard: ImageCard) => void): ImageCard[] {
        if (!images) return null;
        let imageCards = [];
        images.forEach(i => imageCards.push(new ImageCard(i, classList, onImageClick)));
        return imageCards;
    }

    /*
         Returns an anonymous function that is meant to be assigned to an oncontextmenu.

    */
    // A property that that is assigned 
    public static get userOwnerOptionSet() {

        // A function that returns a function that takes an ImageCard,
        // An oncontextmenu callback that loads the onImageClick into buttons.
        return (event: MouseEvent) => (targetImageCard: ImageCard) => 

            // and loads the context modal with options and the mouseEvent.
            contextMenu.load(event, [

                new ContextOption(Icons.createPost(), () => {
                    imageDropdown.close();
                    createPostModal.load(targetImageCard);
                }),
                new ContextOption(Icons.deleteImage(), () => {
                    confirmPrompt.load('Are you sure you want to delete this image?', confirmation => {
                        if (!confirmation) return;
                        targetImageCard.remove();

                        //return answer == false? null : imageCard.remove(); // TEST THIS XXXXXXXXXXXXX
                    });
                })
            ]);
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    public image: ImageRecord;

    private _onImageClick: (targetedImageCard: ImageCard) => void;

    get onImageClick(): (targetImageCard: ImageCard) => void { return this._onImageClick; }

    set onImageClick(onImageClick: (targetImageCard: ImageCard) => void) {

        // Set the value of the two properties to a function that send this instance back through the onImageClick callback.
        this.rootElm.onclick = (e) => onImageClick(this);
        this._onImageClick = (e) => onImageClick(this);
    }

    public constructor(image: ImageRecord, classList?: string, onImageClick?: (targetImageCard: ImageCard) => void) {
        
        super(ViewUtil.tag('img', {
            src: image.imageAsByteArray,
            classList: classList
        }));

        // Store the image record in this instance.
        this.image = image;

        // L-Click on imageCard action.
        this.onImageClick = onImageClick ? onImageClick : Behavior.singleFullSizeImage;

        // R-Click on imageCard action.
        this.rootElm.oncontextmenu = image.profileId == User.profileId ? ImageCard.userOwnerOptionSet : null;

        ImageCard.imageCards.push(this);
    }

    public remove(): void {
        Ajax.deleteImage(this.image.imageId);

        PostCard.postCards.forEach(p => {
            // Only need to remove tag. Cascading delete in db is done on server.
            if (p.post.image.imageId == this.image.imageId) ViewUtil.remove(p.rootElm);
        });

        ImageCard.imageCards.forEach(i => {
            if (i.rawImage.id == this.image.imageId) ViewUtil.remove(i.tag);
        });

        if (this.image.imageId == User.profilePictureId)
            Ajax.getImage(0, true, 'sqr', () => { }, imageCard =>
                ProfileCard.changeUserProfilePicture(null, imageCard));

        // XXX instead, fullsizeImage modal should change to the next or prev image (prev as default), and if singular THEN close.
        fullSizeImageModal.close();// temporary solution
        
        //delete this; XXX
    }

}
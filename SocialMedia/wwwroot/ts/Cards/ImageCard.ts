class ImageCard extends Card {
    
    public static imageCards: ImageCard[] = [];

    public static copy(
        imageCard: ImageCard,
        newClassList: string = imageCard.rootElm.classList.value,
        newTooltipMsg: string = imageCard.tooltipMsg,
        newOnImageClick: (target: ImageCard) => void = (target: ImageCard) => imageCard.rootElm.onclick
    ): ImageCard {

        return new ImageCard(imageCard.image, newClassList, newTooltipMsg, newOnImageClick);
    }

    public static list(
        images: ImageRecord[],
        classList: string,
        toolTip: string,
        onImageClick?: (targetImageCard: ImageCard) => void
    ): ImageCard[] {

        if (!images) return null;
        let imageCards: ImageCard[] = [];
        images.forEach((i: ImageRecord) => imageCards.push(new ImageCard(i, classList, toolTip, onImageClick)));
        return imageCards;
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    public image: ImageRecord;

    private _tooltipMsg: string = null;
    set tooltipMsg(msg: string) {
        this._tooltipMsg = msg;

        if (msg != null) {
            this.rootElm.title = msg;
            this.rootElm.setAttribute('alt', msg);
        }
    }
    get tooltipMsg() { return this._tooltipMsg; }

    // ON IMAGE CLICK
    private _onImageClick:         (target: ImageCard) => void;
    get onImageClick():            (target: ImageCard) => void  { return this._onImageClick; }
    set onImageClick(onImageClick: (target: ImageCard) => void) {

        // XXX consider getting rid of _onImageClick. Instead, get the value of this.rootElm.onclick. XXX
        // Set the value of the two properties to a function that send this instance back through the onImageClick callback.
        this._onImageClick = (target: ImageCard) => onImageClick(target);
        this.rootElm.onclick = (event: MouseEvent) => onImageClick(this);
    }

    /*
        Example:
        <img src="{image data}">
    */
    public constructor(
        image: ImageRecord,
        classList?: string,
        tooltipMsg?: string,
        onImageClick?: (target: ImageCard) => void
    ) {
        
        super(ViewUtil.tag('img', {
            src: image.imageAsByteArray,
            classList: classList
        }));

        // Store the image record in this instance.
        this.image = image;

        this.tooltipMsg = tooltipMsg;

        // L-Click on imageCard action.
        this.onImageClick = onImageClick ? onImageClick : (target: ImageCard) => fullSizeImageModal.loadSingle(target.image.imageId);

        // R-Click on imageCard action.
        if (image.profileId == User.profileId) this.rootElm.oncontextmenu = (event: MouseEvent) => 

            // and loads the context modal with options and the mouseEvent.
            contextMenu.load(event, [

                new ContextOption(Icons.createPost(), (e: MouseEvent) => {
                    createPostModal.load(this);
                }),
                new ContextOption(Icons.deleteImage(), (e: MouseEvent) => {
                    confirmPrompt.load('Are you sure you want to delete this image?',
                        (confirmation: boolean) => {
                            if (!confirmation) return;
                            this.remove();

                        //return answer == false? null : imageCard.remove(); // TEST THIS XXXXXXXXXXXXX
                    });
                })
            ]);
        
        ImageCard.imageCards.push(this);
    }

    public remove(): void {
        Ajax.deleteImage(this.image.imageId);

        PostCard.postCards.forEach((p: PostCard) => {
            // Only need to remove tag. Cascading delete in db is done on server.
            if (p.post.image != null && p.post.image.imageId == this.image.imageId)
                ViewUtil.remove(p.rootElm);
        });

        // XXX this ought to go in a static method in ProfileImagesBox. Or even in ContentBox. XXX
        ProfileImagesBox.profileImageBoxes.forEach((p: ProfileImagesBox) => {
            p.removeImageCard(this);
        });

        // If the user deleted the image that was their profile picture, change all occurances of their profile picture to the defualt.
        if (this.image.imageId == User.profilePictureId) {

            Ajax.getImage(0, true, 'sqr', null, (target: ImageCard) => { }, (imageCard: ImageCard) =>
                ProfileCard.changeUserProfilePicture(imageCard));

            Ajax.getImage(0, false, 'sqr', 'Change profile picture', (target: ImageCard) => { }, (imageCard: ImageCard) =>
                profileModal.profilePictureBox.loadImage(imageCard));
        }

        // XXX instead, fullsizeImage modal should change to the next or prev image (prev as default), and if singular THEN close.
        fullSizeImageModal.close();// temporary solution
        
        //delete this; XXX
    }

}
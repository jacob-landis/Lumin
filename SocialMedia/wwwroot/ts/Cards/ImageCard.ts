class ImageCard extends Card {
    
    private static imageCards: ImageCard[] = [];

    public static copy(
        imageCard: ImageCard,
        newClassList: string = imageCard.rootElm.classList.value,
        newTooltipMsg: string = imageCard.tooltipMsg,
        newOnImageClick: (target: ImageBox) => void = (target: ImageBox) => imageCard.rootElm.onclick
    ): ImageCard {

        return new ImageCard(imageCard.image, newClassList, newTooltipMsg, newOnImageClick);
    }

    public static list(
        images: ImageRecord[],
        classList: string,
        toolTip: string,
        onImageClick?: (targetImageCard: ImageBox) => void
    ): ImageCard[] {

        if (!images) return null;
        let imageCards: ImageCard[] = [];
        images.forEach((i: ImageRecord) => imageCards.push(new ImageCard(i, classList, toolTip, onImageClick)));
        return imageCards;
    }

    // /STATIC
    // ---------------------------------------------------------------------------------------------------------------
    // NON-STATIC

    public parentImageBox: ImageBox;
    public image: ImageRecord;

    private _tooltipMsg: string = null;
    set tooltipMsg(msg: string) {
        this._tooltipMsg = msg;

        if (msg != null) {
            this.rootElm.title = this.image.profileId == User.profileId ? msg + ' + Right-Click options' : msg;
            this.rootElm.setAttribute('alt', msg);
            this.rootElm.classList.add('imageCardHover');
        }
    }
    get tooltipMsg() { return this._tooltipMsg; }

    // ON IMAGE CLICK
    private _onImageClick:         (target: ImageBox) => void;
    get onImageClick():            (target: ImageBox) => void  { return this._onImageClick; }
    set onImageClick(onImageClick: (target: ImageBox) => void) {
        
        // Set the value of the two properties to a function that send this instance back through the onImageClick callback.
        this._onImageClick = (target: ImageBox) => onImageClick(target);
        this.rootElm.onclick = (event: MouseEvent) => onImageClick(this.parentImageBox);
    }

    /*
        Example:
        <img src="{image data}">
    */
    public constructor(
        image: ImageRecord,
        classList?: string,
        tooltipMsg?: string,
        onImageClick?: (target: ImageBox) => void
    ) {
        
        super(ViewUtil.tag('img', {
            src: image.imageAsByteArray,
            classList: classList
        }));

        // Store the image record in this instance.
        this.image = image;

        this.tooltipMsg = tooltipMsg;

        // L-Click on imageCard action.
        this.onImageClick = onImageClick ? onImageClick : (target: ImageBox) => imageGalleryModal.loadSingle(target.imageCard.image.imageId);

        // R-Click on imageCard action.
        if (image.profileId == User.profileId) 
            this.rootElm.oncontextmenu = (event: MouseEvent) =>

                // and loads the context modal with options and the mouseEvent.
                contextMenu.load(event, [

                    new ContextOption(Icons.createPost(), 'Post image', (e: MouseEvent) => {
                        createPostModal.load(this);
                    }),
                    new ContextOption(Icons.privacy(), 'Change privacy', (e: MouseEvent) => {
                        setTimeout(() => {
                            contextMenu.load(event, [
                                new ContextOption(ViewUtil.tag('div', { innerText: 'All' }),     null, () => Ajax.updateImagePrivacy(this.image.imageId, 0)),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'Mutual' }),  null, () => Ajax.updateImagePrivacy(this.image.imageId, 1)),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'Friends' }), null, () => Ajax.updateImagePrivacy(this.image.imageId, 2)),
                                new ContextOption(ViewUtil.tag('div', { innerText: 'None' }),    null, () => Ajax.updateImagePrivacy(this.image.imageId, 3))
                            ]);
                        }, 10);
                    }),
                    new ContextOption(Icons.deleteImage(), 'Delete image', (e: MouseEvent) => {
                        confirmPrompt.load('Are you sure you want to delete this image?',
                            (confirmation: boolean) => {
                                if (!confirmation) return;
                                this.remove();
                            });
                    })
                ]);
        
        ImageCard.imageCards.push(this);
    }

    private remove(): void {
        Ajax.deleteImage(this.image.imageId);

        PostCard.postCards.forEach((p: PostCard) => {
            // Only need to remove tag. Cascading delete in db is done on server.
            if (p.post.image != null && p.post.image.imageId == this.image.imageId)
                ViewUtil.remove(p.rootElm);
        });
        
        ProfileImagesBox.profileImageBoxes.forEach((p: ProfileImagesBox) => {
            p.removeImageCard(this);
        });

        // If the user deleted the image that was their profile picture, change all occurances of their profile picture to the defualt.
        if (this.image.imageId == User.profilePictureId) {

            Ajax.getImage(0, 0, 'sqr', null, (target: ImageBox) => { }, (imageCard: ImageCard) => {
                ProfileCard.changeUserProfilePicture(imageCard)
                navBar.btnOpenUserProfileModalImageBox.loadImage(ImageCard.copy(imageCard));
            });

            Ajax.getImage(0, 2, 'sqr', 'Change profile picture', (target: ImageBox) => { }, (imageCard: ImageCard) =>
                profileModal.profilePictureBox.loadImage(imageCard));
        }
        
        imageGalleryModal.close();// Temporary solution for not having a broken counter after the image is removed.
    }

}
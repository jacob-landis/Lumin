/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores a single profile's images.

    First images request is sent to the host upon contruction.
*/
class ProfileImagesBox extends ContentBox {

    // A global collection of ImageBox instances.
    public static profileImageBoxes: ProfileImagesBox[] = [];

    public tooltipMsg: string;

    // The click action that gets imbedded in every image in this image box's content box.
    public clickCallback: (target: ImageCard) => void;

    // The ProfileID of the profile who's images are being loaded.
    public profileId: number;
    
    /*
        PARAMETERS:
        profileId can be null.
        clickCallback is assigned as the onclick event for each profile card.
    */
    constructor(profileId?: number, tooltipMsg?: string, scrollElm?: HTMLElement, clickCallback?: (imageCard: ImageCard) => void) {

        let rootElm: HTMLElement = ViewUtil.tag('div', { classList: 'images-box' });

        super(rootElm, scrollElm, 400, 20,
            // When content box is ready for more content,
            (skip: number, take: number) => {
                // send an images request to the host with the set skip and take values along with the ProfileID of this image box,
                Ajax.getProfileImages(this.profileId, skip, take, 'listImage sqr', this.tooltipMsg, this.clickCallback,
                    // and when they return as image cards with the click value that was just provided,
                    (imageCards: ImageCard[]) => {
                        // add them to this image box.
                        this.addImageCards(imageCards);
                    }
                );
            }
        );

        // Get handle on ProfileID.
        // If a ProfileID was provided, this.profileID is profileId, else this.profileId is the current user's ProfileID.
        this.profileId = profileId ? profileId : User.profileId;

        this.tooltipMsg = tooltipMsg;

        // Get handle on click action.
        this.clickCallback = clickCallback;

        // Send first request to host.
        super.request(40);

        // Add this image box to the collection.
        ProfileImagesBox.profileImageBoxes.push(this);
    }

    /*
        Restart image loading with new profileId and onImageClick callback. 
    */
    public load(profileId: number, tooltipMsg: string, onImageClick: (target: ImageCard) => void): void {

        // Change stored values to parameter values.
        this.profileId = profileId;
        this.tooltipMsg = tooltipMsg;
        this.clickCallback = onImageClick;

        // Clear array and root element.
        super.clear();

        // Start requesting.
        super.request(40);
    }

    public addImageCards(imageCards: ImageCard[]): void {
        if (imageCards != null) imageCards.forEach(i => this.addImageCard(i));
        else if (this.onLoadEnd != null) this.onLoadEnd();
    }

    /*
        Takes an image card and does some final preparation before adding it to this image box's content box.
    */
    public addImageCard(imageCard: ImageCard, prepend?: boolean): void {

        // Imbed click action stored in this image box to image card.
        imageCard.onImageClick = this.clickCallback;
        imageCard.tooltipMsg = this.tooltipMsg;

        // Update classList of image card so it is square and fits in the grid.
        imageCard.rootElm.classList.add('listImage');
        imageCard.rootElm.classList.add('sqr');

        // Add image card to this image box's content box.
        super.add(imageCard, prepend);
    }

    /*
        Removes the given image from this ProfileImageBox. 
    */
    public removeImageCard(imageCard: ImageCard): void {

        // Loop through the content of this ProfileImagesBox.
        this.content.forEach((i: ImageCard) => {

            // If a match is found.
            if (i.image.imageId == imageCard.image.imageId) {

                // Splice from this.content.
                this.content.splice(this.content.indexOf(i), 1);

                // Remove the root element.
                ViewUtil.remove(i.rootElm);
            }
        });
    }
}
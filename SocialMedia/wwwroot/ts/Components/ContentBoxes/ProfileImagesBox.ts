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
    public clickCallback: (target: ImageBox) => void;

    // The ProfileID of the profile who's images are being loaded.
    public profileId: number;
    
    /*
        PARAMETERS:
        profileId can be null.
        clickCallback is assigned as the onclick event for each profile card.
    */
    constructor(tooltipMsg?: string, scrollElm?: HTMLElement, clickCallback?: (imageBox: ImageBox) => void) {

        let rootElm: HTMLElement = ViewUtil.tag('div', { classList: 'images-box' });

        super(rootElm, scrollElm, 400, 20,
            // When content box is ready for more content,
            (skip: number, take: number) => {
                // send an images request to the host with the set skip and take values along with the ProfileID of this image box,
                Ajax.getProfileImages(this.profileId, skip, take, 'listImage sqr', this.tooltipMsg, this.clickCallback,
                    // and when they return as image cards with the click value that was just provided,
                    (imageBoxes: ImageBox[]) => {
                        // add them to this image box.
                        this.addImages(imageBoxes);
                    }
                );
            }
        );

        this.tooltipMsg = tooltipMsg;

        // Get handle on click action.
        this.clickCallback = clickCallback;

        // Add this image box to the collection.
        ProfileImagesBox.profileImageBoxes.push(this);
    }

    /*
        Restart image loading with new profileId and onImageClick callback. 
    */
    public load(profileId: number, tooltipMsg?: string, onImageClick?: (target: ImageBox) => void): void {

        // Change stored values to parameter values.
        this.profileId = profileId;
        if (tooltipMsg) this.tooltipMsg = tooltipMsg;
        if (onImageClick) this.clickCallback = onImageClick;

        // Clear array and root element.
        super.clear();

        // Start requesting.
        super.request(30);
    }

    public addImages(imageBoxes: ImageBox[]): void {

        if (imageBoxes!= null) super.add(this.prepareImage(imageBoxes));
        if (this.onLoadEnd != null) this.onLoadEnd();
    }

    /*
        Takes an image card and does some final preparation before adding it to this image box's content box.
    */
    public addImage(imageBox: ImageBox, prepend?: boolean): void {
        
        // Add image card to this image box's content box.
        super.add(this.prepareImage(imageBox), prepend);
    }

    private prepareImage(imageBox: (ImageBox | ImageBox[])): (ImageBox| ImageBox[]) {

        let imageBoxes: ImageBox[];

        if (Array.isArray(imageBox)) imageBoxes = imageBox;
        else imageBoxes = [imageBox];

        imageBoxes.forEach((i: ImageBox) => {

            // Imbed click action stored in this image box to image card.
            i.imageCard.onImageClick = this.clickCallback;
            i.imageCard.tooltipMsg = this.tooltipMsg;

            // Update classList of image card so it is square and fits in the grid.
            i.imageCard.rootElm.classList.add('listImage');
            i.imageCard.rootElm.classList.add('sqr');
        });

        if (imageBoxes.length == 1) return imageBoxes[0];
        else return imageBoxes;
    }

    /*
        Removes the given image from this ProfileImageBox. 
    */
    public removeImageCard(imageCard: ImageCard): void {

        // Loop through the content of this ProfileImagesBox.
        this.content.forEach((imageBox: ImageBox) => {

            // If a match is found.
            if (imageBox.imageCard.image.imageId == imageCard.image.imageId) {

                // Splice from this.content.
                this.content.splice(this.content.indexOf(imageBox), 1);

                // Remove the root element.
                ViewUtil.remove(imageBox.rootElm);
            }
        });
    }
}
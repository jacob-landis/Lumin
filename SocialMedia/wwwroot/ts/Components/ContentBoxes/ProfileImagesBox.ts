/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores a single profile's images.

    First images request is sent to the host upon contruction.
*/
class ProfileImagesBox extends ContentBox {

    // A global collection of ImageBox instances.
    public static profileImageBoxes: ProfileImagesBox[] = [];

    // The click action that gets imbedded in every image in this image box's content box.
    private clickCallback: (imageCard: ImageCard) => void;

    // The ProfileID of the profile who's images are being loaded.
    public profileId: number;
    
    /*
        PARAMETERS:
        profileId can be null.
        clickCallback is assigned as the onclick event for each profile card.
    */
    constructor(profileId?: number, clickCallback?: (imageCard: ImageCard) => void) {

        let rootElm = ViewUtil.tag('div', { classList: 'images-box' });

        super(rootElm, 20,
            // When content box is ready for more content,
            (skip: number, take: number) => {
                // send an images request to the host with the set skip and take values along with the ProfileID of this image box,
                Ajax.getProfileImages(this.profileId, skip, take, 'listImage sqr', this.clickCallback,
                    // and when they return as image cards with the click value that was just provided,
                    (imageCards: ImageCard[]) => {
                        // add them to this image box.
                        this.add(imageCards);
                    }
                );
            }
        );

        // Get handle on ProfileID.
        // If a ProfileID was provided, this.profileID is profileId, else this.profileId is the current user's ProfileID.
        this.profileId = profileId ? profileId : User.profileId;

        // Get handle on click action.
        this.clickCallback = clickCallback;

        // Send first request to host.
        this.request(40);

        // Add this image box to the collection.
        ProfileImagesBox.profileImageBoxes.push(this);
    }

    public addImageCards(imageCards: ImageCard[]) {
        imageCards.forEach(i => this.addImageCard(i));
    }

    /*
        Takes an image card and does some final preparation before adding it to this image box's content box.
    */
    public addImageCard(imageCard: ImageCard): void {

        // Imbed click action stored in this image box to image card.
        imageCard.onImageClick = this.clickCallback;

        // Update classList of image card so it is square and fits in the grid.
        imageCard.rootElm.classList.add('listImage');
        imageCard.rootElm.classList.add('sqr');

        // Add image card to this image box's content box.
        this.add(imageCard, true);
    }

    /*
        Removes the given image from this ProfileImageBox. 
    */
    public removeImageCard(imageCard: ImageCard) {

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
/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores a single profile's images.

    First images request is sent to the host upon contruction.
*/
class ProfileImagesBox {

    // A global collection of ImageBox instances.
    static profileImageBoxes = [];

    // The click action that gets imbedded in every image in this image box's content box.
    click;

    // The ProfileID of the profile who's images are being loaded.
    profileId;

    // The base class used to store the image cards.
    contentBox;

    /*
        PARAMETERS:
        profileId can be null.
        click can be null.
    */
    constructor(profileId, click) {

        // Get handle on ProfileID.
        // If a ProfileID was provided, this.profileID is profileId, else this.profileId is the current user's ProfileID.
        this.profileId = profileId ? profileId : User.id;

        // Get handle on click action.
        this.click = click;

        // Construct a new content box and get a handle on it.
        this.contentBox = new ContentBox(null, 'images-box', 20,

            // When content box is ready for more content,
            (skip, take) => {

                // send an images request to the host with the set skip and take values along with the ProfileID of this image box,
                Repo.images(this.profileId, skip, take, 'listImage sqr', this.click,

                    // and when they return as image cards with the click value that was just provided,
                    imageCards =>

                        // add them to this image box's content box.
                        this.contentBox.add(imageCards));
            }
        );

        // Send first request to host.
        this.contentBox.request(40);

        // Add this image box to the collection.
        ProfileImagesBox.profileImageBoxes.push(this);
    }

    /*
        Takes an image card and does some final preparation before adding it to this image box's content box.
    */
    addImageCard(imageCard) {

        // Imbed click action stored in this image box to image card.
        imageCard.click = this.click;

        // Update classList of image card so it is square and fits in the grid.
        imageCard.tag.classList = 'listImage sqr';

        // Add image card to this image box's content box.
        this.contentBox.add(imageCard, true);
    }
}
/*
    This class controls the content in the image dropdown.
    
    It displays the current user's images.
    By default, clicking on the images opens them in the fullsize image modal.
    However, other classes can change the click behavior of the images temporarily.
        This functionality is utilized to select an image, either for a post or for a profile picture.
        There is also a parameter for a message that gets displayed to the user like "Select an image for profile picture."

    This image collection supports lazy loading.
*/
class ImageDropdown {

    /*
        
    // A requirement of being a dropdown. The base class shows and hides this on open() and close().
    dropdownCon;

    // A requirement of being a dropdown. The base class constricts the height of this elm so content is not overlapped by nav bar.
    content;

    // Holds the main HTML elm of imageBox.
    imageWrapper;

    // A place for instructions to the user (ex. Select an image for profile picture).
    prompt;

    // Holds image cards.
    imageBox;
    */

    /*
        Gets handles on all necessary components.
        Sets up event listeners for image upload and lazy loading.
        Sudo-inherits from sudo-base class.
    */
    static initialize() {

        // Get handles on dropdown HTML elms.
        this.dropdownCon = document.getElementById('imageDropdown');
        this.content = document.getElementById('imageDropDownContent');
        this.imageWrapper = document.getElementById('selectImages');
        this.prompt = document.getElementById('selectImagePrompt');

        // UPLOAD IMAGE
        // Sets up onchange event on file input.
        // This is triggered once the user has selected a file from their computers file system.
        // (Refer to this elm in /Views/Home/Index.cshtml for further explaination.)
        // This has the additional function of updating any and all active displays of the current user's images when one is added.
        document.getElementById('imageModalUploadImage').onchange = e =>

            // Send file and callback to image upload modal.
            UploadImageModal.load(e,

                // When the image is uploaded (if it was uploaded) and it comes back,
                imageCard =>

                    // loop through all the profileImageBoxs,
                    ProfileImagesBox.profileImageBoxes.forEach(p => {

                        // and if the image box is displaying the current user's images, add the newly uploaded image to it.
                        if (p.profileId == User.id) p.addImageCard(imageCard);
                    })
            );

        // LAZY LOADING
        // When content is scrolled,
        this.content.onscroll = () => {

            // take a scroll measurement,
            let offset = this.content.scrollTop + window.innerHeight;

            // and if it surpasses the threshold, request more content.
            if (offset >= this.imageBox.contentBox.height) this.imageBox.contentBox.request(15);
        }

        // Inherit from base class.
        Dropdown.add(this);
    }

    /*
        A new image box is constructed every time because this allows the click callback for the images to be changed.

        callback is invoked with the clicked on image.
    */
    static load(callback) {

        // XXX convert() should be used instead of creating a new image box.
        this.imageBox = new ProfileImagesBox(null, callback ?
            // if the dropdown is opened for the purpose of selecting an image for something
            clickedImageCard => () => callback(clickedImageCard)
            :
            clickedImageCard => () => FullSizeImageModal.load(this.imageBox.contentBox.content.indexOf(clickedImageCard)));

        // LAZY LOADING xxx XXX why are there two of these??
        this.imageBox.onscroll = () => {
            let divHeight = Util.getDivHeight(this.imageBox);
            let offset = this.imageBox.scrollTop + divHeight - 50;

            if (offset >= divHeight) this.imagesBox.contentBox.request(5);
        }

        // Change the prompt.
        // If the user is selecting something, indicate that clicking on an image selects it for something, 
        // else, indicate that clicking an image will make it go fullscreen.
        this.prompt.innerText = callback ? 'Select an Image' : 'My Images';

        // Put the dropdown in the foreground in case a modal is open.
        // Otherwise it is covered by the modal backdrop and that backdrop will dim the dropdown and intercept any click intended for the dropdown.
        this.dropdownCon.style.zIndex = Modal.modalCons.length + 1;

        // Clear the old image box out of imageWrapper.
        ViewUtil.empty(this.imageWrapper);

        // Append the new image box to imageWrapper.
        this.imageWrapper.append(this.imageBox.contentBox.tag);

        // Open this dropdown.
        this.open();
    }

    /*
        Manually changes the click callback of each image card in the imageBox,
        moves the dropdown to the foreground,
        and prompts the user to select an image.

        This is used if the image dropdown is already open and the user needs to select an image.
    */
    static convert(callback) {

        // Loop through each image card in the image box and change it's callback to the one provided.
        this.imageBox.contentBox.content.forEach(i => i.click = imageCard => callback(imageCard));

        // Bring the dropdown to the foreground.
        this.dropdownCon.style.zIndex = Modal.modalCons.length + 2;

        // Prompt the user to select an image.
        this.prompt.innerText = 'Select an Image';
    }
}
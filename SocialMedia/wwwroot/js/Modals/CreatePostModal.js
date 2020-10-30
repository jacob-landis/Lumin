/*
    This class contains the functionality of the create post form.
*/
class CreatePostModal {

    /*
    
    // A requirement of being a modal. The base class shows and hides this.
    modalCon;
    
    // A text input elm for the user to enter a caption.
    txtCaption;
    
    // An elm that wraps the caption input and error messages.
    captionWrapper;
    
    // A content box for error messages.
    errorBox;
    
    // A button that opens the image dropdown for the user to select an image from.
    btnSelectImage;
    
    // A button that removes the image that is attached to the post.
    btnClearImage;
    
    // A button that sends the post in a post request to the host.
    btnSubmit;
    
    // A button that closes this modal.
    btnCancel;
    
    // An ImageBox that isplays the image the user attaches to the post.
    selectedImageCon;
        
    */

    /*
        Sudo-inherits from the sudo-base class.
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    static initialize() {

        // Inherit from base class.
        Modal.add(this);

        // Get handles on modal HTML elms.
        this.modalCon = document.getElementById('createPostModal'); 
        this.txtCaption = document.getElementById('caption');
        this.captionWrapper = document.getElementById('captionWrapper');
        this.btnSelectImage = document.getElementById('btnSelectPostImage');
        this.btnClearImage = document.getElementById('btnClearPostImage');
        this.btnSubmit = document.getElementById('btnSubmit');
        this.btnCancel = document.getElementById('btnCancel');

        // Construct a content box for errors and get a handle on it.
        this.errorBox = new ContentBox('createPostErrorBox');

        // Append the error box's main tag to the caption wrapper.
        this.captionWrapper.append(this.errorBox.tag);

        // Construct an image box with an existing elm and get a handle on it.
        // (Any image that is selected for this post can be clicked on to pick a different image, because of the click parameter value)
        this.selectedImageCon = new ImageBox(document.getElementById('selectedImageCon'), '', 'selectedPostImage',

            // Returns the following callback.
            () =>

                // When the image is clicked, invoke selectImage().
                () => this.selectImage()
        );

        // Set btnSelectImage to invoke selectImage().
        this.btnSelectImage.onclick = () => this.selectImage();

        // Set btnClearImage to invoke loadPaperClip().
        this.btnClearImage.onclick = () => this.loadPaperClip();

        // Set btnSubmit to invoke submit().
        this.btnSubmit.onclick = () => this.submit();

        // Set btnCancel to invoke close().
        this.btnCancel.onclick = () => this.close();
    }

    /*
        Loads an image card into the selectedImageCon.

        imageCard must be an ImageCard.
    */
    static load(imageCard) {

        // Clear selected image container.
        this.loadPaperClip();

        // If the image dropdown is open and no image card was provided, convert to image dropdown to image selection functionality.
        // XXX This assumes that if the image dropdown was open that the user wants to attach an image to their post.
        // XXX Consider making it so the image dropdown is only converted when selectImage() is invoked.
        if (ImageDropdown.isOpen && !imageCard) this.convertImageDropdown();

        // If an image card was provided, load it into the selected image container.
        if (imageCard) this.selectedImageCon.load(imageCard.rawImage.id);

        // Open this modal.
        this.open();
    }

    /*
        Clears selected image and loads the paper clip icon.
        The paper clip icon indicates that no image is attached and it can be clicked on to attach an image.

        XXX The image box may be manually unloaded and loaded because paperClip does not have a tag property
        XXX I could instead wrap it in an object like: {tag: paperClip}
    */
    static loadPaperClip() {

        // Clear selected image container.
        ViewUtil.empty(this.selectedImageCon.tag); // XXX this should be this.selectedImageCon.unload();

        // Lower is loaded flag of selected image container.
        this.selectedImageCon.isLoaded = false; // XXX this should be this.selectedImageCon.unload();

        // Get handle on new paper clip icon.
        let paperClip = Icons.paperClip();

        // Set click callback to invoke selectImage();
        paperClip.onclick = () => this.selectImage();

        // Append paper clip icon to selected image container.
        this.selectedImageCon.tag.append(paperClip);
    }

    /*
        Loads the image dropdown with a callback to return the selected image.
    */
    static selectImage() {

        // Load the image dropdown.
        ImageDropdown.load(

            // When the selected image card returns,
            imageCard => {

                // close the image dropdown,
                ImageDropdown.close();

                // XXX if the image container were forced into certain dimensions, a stretched out thumbnail could be a
                // XXX placeholder until the fullsize version arrived.

                // and load image into selected image container by id so the fullsize verision is requested and displayed.
                this.selectedImageCon.load(imageCard.rawImage.id);
            }
        );
    }

    /*
        Changes the callback in the already open image dropdown to return the selected image.

        XXX The order of the arguments in the callback is different above, even though the arguments are the same. Explain why
        XXX they are different or make them the same.
    */
    static convertImageDropdown() {

        // Send new callback to image dropdown.
        ImageDropdown.convert(

            // XXX this is another clue in the mystery of the double callback. XXX
            // When the selected image card returns,
            imageCard => () => {

                // load image into selected image container by id so the fullsize verision is requested and displayed,
                this.selectedImageCon.load(imageCard.rawImage.id);

                // and close the image dropdown.
                ImageDropdown.close();
            }
        );
    }

    /*
        Checks for errors and either displays the errors or send the post to the host in a post request.
    */
    static submit() {

        // Define max length of caption. 
        let charLimit = 1000; //XXX max length for posts, comments, and bio should be stored somewhere central.XXX

        // Check if there is a caption and hold result.
        let tooShort = this.txtCaption.value.length <= 0; // XXX Since this is not an error itself, noCaption would be a better name. XXX

        // Check if the caption is too long and hold result.
        let tooLong = this.txtCaption.value.length > charLimit;

        // Check if there is some kind of content in the post.
        let noContent = tooShort && !this.selectedImageCon.isLoaded; // XXX btnPost should be grayed out until there is content. XXX

        // Create 'too long' error tag.
        let tooLongError = { tag: ViewUtil.tag('div', { classList: 'errorMsg', innerText: `- Must be less than ${charLimit} characters` }) };

        // Create 'no content' error tag
        let noContentError = { tag: ViewUtil.tag('div', { classList: 'errorMsg', innerText: '- Select an image or enter a caption' }) };

        // If any errors were found,
        if (tooLong || noContent) {

            // clear the error box,
            this.errorBox.clear();

            // XXX this should be an if-else-if statement. 'No content' cannot occure while there is too much content. XXX
            if (tooLong) this.errorBox.add(tooLongError);
            if (noContent) this.errorBox.add(noContentError);
        }

        // else no errors were found.
        else {

            // Set imageId of post to the attached image's id or to 0 if no image was attached.
            let imageId = this.selectedImageCon.isLoaded ? this.selectedImageCon.imageCard.rawImage.id : 0;

            // Prep the caption and ImageID to be sent off.
            let post = JSON.stringify({ Caption: this.txtCaption.value, ImageId: imageId }); // XXX there is a method in Repo for this. XXX

            // Send post to host in a post request.
            Repo.postPost(post,

                // If and when the post was added and comes back, loop through all the active post boxes,
                postCard => PostsBox.postBoxes.forEach(p => {

                    // and add the returned post to the post boxes it belongs in.
                    if (p.profileId == User.id) p.addPost(new PostCard(postCard.post));
                })
            );

            // Clear caption in form.
            this.txtCaption.value = ''; // XXX this should be done every time this is opened. Maybe there should be a clear form method. XXX

            // Close this modal.
            this.close();
        }
    }

    /*
        Optional method of a Modal.
        Modal base class runs this before finally closing this modal.

        Checks if the user typed something and prompts them to confirm the cancelation if they did.

        callback takes a bool. Passing it true results in this modal closing, passing it false does not.
    */
    static onClose(callback) {

        // If there is nothing in the caption,
        if (this.txtCaption.value.length < 1) {

            // Clear error box.
            this.errorBox.clear();

            // Clear caption.
            this.txtCaption.value = '';

            // Close the image dropdown.
            ImageDropdown.close();

            // Return image dropdown to it's 
            ImageDropdown.dropdownCon.style.zIndex = 0;

            // Return true to the callback to invoke close() on this modal.
            callback(true);
        }

        // else there is a caption so,
        else {

            // Prompt the user to confirm cancelation.
            ConfirmModal.load('Are you sure you want to cancel?',

                // When their descision returns,
                confirmation => {

                    // if they decided not to cancel, do nothing,
                    if (!confirmation) return;

                    // else carry on and clear the caption,
                    this.txtCaption.value = '';

                    // then call close again.
                    // Doing so will cause this method to be called again,
                    // but now that the caption has been cleared, the IF of this if-else will run instead.
                    this.close(); // XXX this could be less confusing. XXX
                }
            );
        }
    }
}
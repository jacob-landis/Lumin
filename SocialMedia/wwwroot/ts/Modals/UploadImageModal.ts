/*
    This class contains the functionality for the upload image modal.
*/
class UploadImageModal extends Modal {
    
    // An elm for the image preview.
    private stagedUploadCon: HTMLElement; // XXX rename to imagePreviewCon XXX

    private stagedUploadClassList: string;

    // Used to trigger post request.
    // Hidden and shown when usable.
    private btnConfirm: HTMLElement;
        
    // Button used to start file upload process over.
    private btnSelectDifferentImage: HTMLElement;
        
    // A FileReader. Used to convert file data to string data.
    private reader: FileReader;
        
    // A JSON obj that holds the file name and the file data stored as string data.
    private stagedUpload: string;
        
    // Used to get the image that comes back after it is uploaded. XXX why not use the image already on the client? XXX
    private callback: (imageCard: ImageCard) => void;
        
    // Used to persist name from load() to stageUpload().
    private stagedFileName: string;

    private errMsgClassList: string;

    /*
        Gets handles on all necessary components.
        Sets up event listeners.
    */
    public constructor(
        rootElm: HTMLElement,
        stagedUploadCon: HTMLElement,
        btnConfirm: HTMLElement,
        btnSelectDifferentImage: HTMLElement,
        stagedUploadClassList: string,
        errMsgClassList: string
    ) {
        super(rootElm);

        // Get handles on modal HTML elms.
        this.stagedUploadCon = stagedUploadCon;
        this.btnConfirm = btnConfirm;
        this.btnSelectDifferentImage = btnSelectDifferentImage;
        this.stagedUploadClassList = stagedUploadClassList;
        this.errMsgClassList = errMsgClassList;
        
        // Set btnConfirm to send image to host in a post request.
        this.btnConfirm.onclick = () => {
            Repo.postImage(this.stagedUpload, imageCard => {

                // When uploaded image returns as an image card, if another class has set up a callback, send the image card to it.
                if (this.callback) this.callback(imageCard);
            });

            // Close this modal.
            this.close();
        }

        // Set onchange callback of selectDifferentImage (XXX basically a button XXX) to invoke load() with the file that was selected and this callback.
        this.btnSelectDifferentImage.onchange =e=> this.load(e, this.callback) // XXX this.callback has not been initialized. Review this logic. XXX
    }

    /*
     
        PARAMETERS:
        e must be the onchange event of a file input.
        callback must be at least an empty callback. It receives the image that is sent back from the host after it is uploaded.
    */
    public load(e, callback): void {

        // Construct new file reader to prep image from transmission to the host.
        this.reader = new FileReader();

        // Set onloadend callback of file reader to invoke stageFile().
        // The results of the file read are read from stageFile().
        this.reader.onloadend =()=> this.stageFile()

        // Prepare for both the validation success and failure scenario.

        // Empty image container elm so it can be refilled if the file is valid.
        // This step needs to take place in both scenarios.
        ViewUtil.empty(this.stagedUploadCon);

        // Hide btnConfirm so it can be shown if the file is valid. XXX this only needs to happen for one scenario. Move this step. XXX
        ViewUtil.hide(this.btnConfirm);

        // Get a handle on the provided callback.
        this.callback = callback;

        // Get a handle on the file name.
        this.stagedFileName = e.srcElement.files[0].name;

        // Validate file size.
        // 15728640 == 15MB
        let isValidSize: boolean = e.srcElement.files[0].size <= 15728640;

        // Validate file type.
        let isValidType: boolean = this.validateType(this.stagedFileName);

        // If the file is valid, read it,
        if (isValidSize && isValidType) {
            this.reader.readAsDataURL(e.srcElement.files[0]);
        }

        // else, display validation errors.
        else {
            if (!isValidSize) this.displayError('- The file you selected excedes accepted file size (15MB)');
            if (!isValidType) this.displayError('- The file you selected is not a valid image type (png, jpg or tif)');
        }

        this.open();
    }

    /*
        Bring the image upload process to the point of user confirmation.
    */
    private stageFile(): void {

        // Show btnConfirm to allow user to finalize the upload. XXX move this line to end of method for readability and so user can't click. XXX
        ViewUtil.show(this.btnConfirm);

        // Cut off "data:image/jpeg;base64," from the result and get a handle on the rest.
        let raw: string = (<string> this.reader.result).substring((<string>this.reader.result).indexOf(',') + 1);
        
        // Create an image tag with raw image data and give it a class for CSS.
        let imgTag: HTMLElement = ViewUtil.tag('img', { classList: this.stagedUploadClassList, src: raw });

        // Show user the image preview.
        this.stagedUploadCon.append(imgTag);

        // Put prepped image name and raw image data in JSON obj for transmission and get a handle on it.
        this.stagedUpload = JSON.stringify({
            Name: this.stagedFileName,
            Raw: raw
        });
    }

    /*
        Validates file type by checking if the file type is one of the allowed types.
    */
    private validateType(name: string): boolean {

        // Get a handle on the file type.
        let extension: string = name.slice(name.indexOf('.')).toLowerCase();

        // If the file type matches any of the ones listed, return true.
        return (
            extension == '.png' ||
            extension == '.jpg' ||
            extension == '.tif'
        );
    }

    /*
        Shortcut for displaying errors.
        Simply provide a string.
    */
    private displayError(errorMsg): void {

        // Create tag with provided string and give it classes for CSS.
        this.stagedUploadCon.append(ViewUtil.tag('div', {
            classList: this.errMsgClassList,
            innerText: errorMsg
        }));
    }
}
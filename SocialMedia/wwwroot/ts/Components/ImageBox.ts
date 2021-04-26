/*
    This class contains the logic for an image slot component.
    The slot itself maintains it's position in the DOM but the image within can be swapped out for other images.

    Not only can different images be swapped out, but the same image can be unloaded and reloaded.
    This is a component of lazy loading.
    Images are dumped from posts as the user scrolls away from them and reloaded when scrolled back to.
*/
class ImageBox implements IAppendable { // XXX rename to image slot XXX rename comments in here too XXX look for and rename thumbNail to thumbnail XXX

    public rootElm: HTMLElement;

    // A global collection of imageBox instances.
    public static imageBoxes: ImageBox[] = [];

    // Setting. ClassList to apply to images upon loading them.
    private heldImageClassList: string;
    
    public heldTooltipMsg: string = null;

    // Setting. Click callback to apply to images upon loading them.
    public heldImageClick: (targetImageCard: ImageCard) => void;
    
    // Request setting.
    // A reference to the last image that was loaded or the image to be loaded.
    // reload() requests an image with this ImageID.
    private heldImageId: number;

    // Request setting.
    // True = request thumbnail.
    private getThumbNail: boolean;

    // The image card living in memory.
    public imageCard: ImageCard;

    // A shortcut to check if an image is currently loaded.
    public isLoaded: boolean = false;

    // Called at the end of reload().
    private _onLoadEnd: () => void;
    
    // Shortcuts to get the height and width properties of this image box's HTML tag.
    get height(): number { return Util.getElmHeight(this.rootElm); }
    get width(): number { return Util.getElmWidth(this.rootElm); }

    // A shortcut to set the height properties of this image box's HTML tag.
    // Used to make comment container tag become scrollable at a specified height.
    set height(height: number) { this.rootElm.style.height = `${height}`; }

    // Set callback that is invoked at the end of reload().
    // Used by PostCard to make adjustments.
    set onLoadEnd(onLoadEnd: () => void) { this._onLoadEnd = onLoadEnd; }

    /*
         PARAMETERS:
         existingTag can be an HTML elm or null.
         boxClassList must be at least an empty string. Applies to this image box's main HTML tag. Only useful if no existing tag is provided.
         imageClassList must be at least an empty string. Applies to whatever image is loaded in.
         click can be a function or null.
         getThumbnail can be true or false/null (null and false have the same outcome). Size setting: true = small, false = big.
    */
    constructor(
        rootElm: HTMLElement,
        imageClassList: string,
        tooltipMsg: string,
        click?: (targetImageCard: ImageCard) => void,
        getThumbNail?: boolean
    ) {

        // Get a handle on the provided size setting.
        this.getThumbNail = getThumbNail;

        this.heldTooltipMsg = tooltipMsg;

        // Get a handle on image classList.
        this.heldImageClassList = imageClassList;

        // If a click callback was provided, get a handle on it, else get a handle on an empty function.
        this.heldImageClick = click ? click : (target: ImageCard) => { };
        
        // Get a handle on rootElm.
        this.rootElm = rootElm;

        // Add an 'image-box' class attribute to rootElm.
        this.rootElm.classList.add('image-box');

        // Add this instance ImageBox to imageBoxes.
        ImageBox.imageBoxes.push(this);
    }
    
    /*
        Updates the image by ImageID and optionally changes it's classList and/or onclick function.
        This will make the request to the host for the image with the provided ImageID.

        PARAMETERS:
        imageId must be an int. The id is used to fetch the appropriate image from the server.
        classlist can be a string or null. If it is null the current images classlist attribute will not be changed.
        click can be a function or null. If it is null the current images onclick event will not be changed.
    */
    public load(imageId: number, classList?: string, toolTipMsg?: string, click?: (targetImageCard: ImageCard) => void): void {
        
        // Replace handle on imageId.
        this.heldImageId = imageId;

        // Optionally replace handle on classList.
        this.heldImageClassList = classList ? classList : this.heldImageClassList;

        this.heldTooltipMsg = toolTipMsg ? toolTipMsg : this.heldTooltipMsg;

        // Optionally replace handle on onclick function.
        this.heldImageClick = click ? click : this.heldImageClick;

        // Unload current image.
        this.unload();

        // Reload current image (Makes request).
        this.reload();
    }

    /*
        Directly load an image card into this image box.
        This will not make a request.

        imageCard must be an imageCard.
    */
    public loadImage(imageCard: ImageCard): void {

        this.imageCard = imageCard;

        // Clear this image box's main HTML elm.
        ViewUtil.empty(this.rootElm);

        // If a classList or click callback was ever provided, apply them to the imageCard.
        if (this.heldImageClassList) ViewUtil.addClassList(this.heldImageClassList, imageCard.rootElm);
        if (this.heldTooltipMsg) imageCard.tooltipMsg = this.heldTooltipMsg;
        if (this.heldImageClick) imageCard.onImageClick = this.heldImageClick;

        // Append tag of new image card to this image box's main HTML elm.
        this.rootElm.append(imageCard.rootElm);

        // Raise is loaded flag.
        this.isLoaded = true;

        if (this._onLoadEnd) this._onLoadEnd();
    }

    /*
        Unload the current image card and clear it from memory.
    */
    public unload(): void {

        // If an image card is loaded,
        if (this.isLoaded) {

            // clear it's HTML rendering,
            ViewUtil.empty(this.rootElm);

            // delete it from memory,
            delete this.imageCard;

            // and lower the isLoaded flag.
            this.isLoaded = false;
        }
    }

    /*
        Request the image from the host with the ImageID that is held here.
    */
    public reload(): void {

        // If an image is not loaded,
        if (!this.isLoaded) {

            this.rootElm.classList.add('loadingImage');

            // Request an image with the request settings and apply the attribute settings when it returns.
            Ajax.getImage(this.heldImageId, this.getThumbNail, this.heldImageClassList, this.heldTooltipMsg, this.heldImageClick,

                // When the prepped image card arrives,
                (imageCard: ImageCard) => {

                    // get a handle on it,
                    this.imageCard = imageCard;

                    // empty this image boxes main HTML elm, XXX Does this really have to be done here????
                    ViewUtil.empty(this.rootElm);

                    // append the image card tag to this image box's elm,
                    this.rootElm.append(this.imageCard.rootElm);

                    // raise the isLoaded flag,
                    this.isLoaded = true;

                    // and if there is an onLoadEnd callback, invoke it.
                    if (this._onLoadEnd) this._onLoadEnd();

                    this.rootElm.classList.remove('loadingImage');
                }
            );
        }
    }
}
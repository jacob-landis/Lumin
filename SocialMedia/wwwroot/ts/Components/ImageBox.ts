/*
    This class contains the logic for an image slot component.
    The slot itself maintains it's position in the DOM but the image within can be swapped out for other images.

    Not only can different images be swapped out, but the same image can be unloaded and reloaded.
    This is a component of lazy loading.
    Images are dumped from posts as the user scrolls away from them and reloaded when scrolled back to.
*/
class ImageBox implements IAppendable, IUnloadable {
    
    public static list(imageCards: ImageCard[]): ImageBox[] {

        if (imageCards == null) return null;

        let imageBoxes: ImageBox[] = [];

        imageCards.forEach((imageCard: ImageCard) => {

            let imageBox: ImageBox = new ImageBox(
                ViewUtil.tag("div"),
                imageCard.rootElm.classList.value,
                imageCard.rootElm.title,
                imageCard.onImageClick,
                1
            );

            imageBox.loadImage(imageCard);

            imageBoxes.push(imageBox);
        });

        return imageBoxes;
    }

    public imageBoxes: ImageBox[] = [];

    public rootElm: HTMLElement;

    // Setting. ClassList to apply to images upon loading them.
    private heldImageClassList: string;
    
    public heldTooltipMsg: string = null;

    // Setting. Click callback to apply to images upon loading them.
    public heldImageClick: (targetImage: ImageBox) => void;
    
    // Request setting.
    // A reference to the last image that was loaded or the image to be loaded.
    // reload() requests an image with this ImageID.
    public heldImageId: number;

    // Request setting.
    // True = request thumbnail.
    private size: 0|1|2|3;

    // The image card living in memory.
    public imageCard: ImageCard = null;

    // A shortcut to check if an image is currently loaded.
    public isLoaded: boolean = false;
    private isLoading: boolean = false;
    private loadingGif: HTMLImageElement = null;

    // Called at the end of reload().
    private _onLoadEnd: () => void;
    
    // Shortcuts to get the height property of this image box's HTML tag.
    public get height(): number { return this.imageCard != null ? this.imageCard.image.height : 0; }

    // A shortcut to set the height properties of this image box's HTML tag.
    // Used to make comment container tag become scrollable at a specified height.
    public set height(height: number) { this.rootElm.style.height = `${height}`; }

    // Set callback that is invoked at the end of reload().
    // Used by PostCard to make adjustments.
    public set onLoadEnd(onLoadEnd: () => void) { this._onLoadEnd = onLoadEnd; }

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
        click?: (targetImage: ImageBox) => void,
        size?: 0|1|2|3
    ) {

        // Get a handle on the provided size setting.
        this.size = size;

        this.heldTooltipMsg = tooltipMsg;

        // Get a handle on image classList.
        this.heldImageClassList = imageClassList;

        // If a click callback was provided, get a handle on it, else get a handle on an empty function.
        this.heldImageClick = click ? click : (target: ImageBox) => { };
        
        // Get a handle on rootElm.
        this.rootElm = rootElm;

        // Add an 'image-box' class attribute to rootElm.
        this.rootElm.classList.add('image-box');
        
        this.imageBoxes.push(this);
    }
    
    /*
        Updates the image by ImageID and optionally changes it's classList and/or onclick function.
        This will make the request to the host for the image with the provided ImageID.

        PARAMETERS:
        imageId must be an int. The id is used to fetch the appropriate image from the server.
        classlist can be a string or null. If it is null the current images classlist attribute will not be changed.
        click can be a function or null. If it is null the current images onclick event will not be changed.
    */
    public load(imageId: number, classList?: string, toolTipMsg?: string, click?: (targetImage: ImageBox) => void): void {
        
        // Replace handle on imageId.
        this.heldImageId = imageId;

        // Optionally replace handle on classList.
        this.heldImageClassList = classList ? classList : this.heldImageClassList;

        this.heldTooltipMsg = toolTipMsg ? toolTipMsg : this.heldTooltipMsg;

        // Optionally replace handle on onclick function.
        this.heldImageClick = click ? click : this.heldImageClick;
        
        this.isLoaded = false;

        ViewUtil.empty(this.rootElm);

        // Reload current image (Makes request).
        this.reload();
    }

    /*
        Directly load an image card into this image box.
        This will not make a request.

        imageCard must be an imageCard.
    */
    public loadImage(imageCard: ImageCard): void {

        this.setImageCard(imageCard);

        // If a classList or click callback was ever provided, apply them to the imageCard.
        if (this.heldImageClassList) ViewUtil.addClassList(this.heldImageClassList, imageCard.rootElm);
        if (this.heldTooltipMsg) imageCard.tooltipMsg = this.heldTooltipMsg;
        if (this.heldImageClick) imageCard.onImageClick = this.heldImageClick;
    }

    /*
        Unload the current image card and clear it from memory.
    */
    public unload(): void {

        // delete it from memory,
        if (this.imageCard != null) {
            
            this.rootElm.style.minHeight = `${this.rootElm.clientHeight}`;
            this.rootElm.style.minWidth = `${this.rootElm.clientWidth}`;

            delete this.imageCard;
        }

        // clear it's HTML rendering,
        ViewUtil.empty(this.rootElm);

        // and lower the isLoaded flag.
        this.isLoaded = false;
    }

    /*
        Request the image from the host with the ImageID that is held here.
    */
    public reload(): void {

        // If an image is not loaded,
        if (!this.isLoaded && !this.isLoading) {

            this.rootElm.classList.add('loadingImage');

            if (this.loadingGif == null) this.loadingGif = <HTMLImageElement>ViewUtil.tag("img", { classList: "loadingGif" });

            if (!this.rootElm.contains(this.loadingGif)) {

                this.loadingGif.src = "/ImgStatic/Loading.gif";
                this.rootElm.append(this.loadingGif);
            }

            this.isLoading = true;

            // Request an image with the request settings and apply the attribute settings when it returns.
            Ajax.getImage(this.heldImageId, this.size, this.heldImageClassList, this.heldTooltipMsg, this.heldImageClick,

                // When the prepped image card arrives,
                (imageCard: ImageCard) => {
                    this.unload();
                    this.setImageCard(imageCard);
                    this.rootElm.classList.remove('loadingImage');
                    this.isLoading = false;
                }
            );
        }
    }

    private setImageCard(imageCard: ImageCard): void {

        // Get a handle on the image card.
        this.imageCard = imageCard;

        this.heldImageId = this.imageCard.image.imageId;

        // Give image card access to this image box that holds it.
        this.imageCard.parentImageBox = this;

        // Empty this image boxes main HTML elm.
        ViewUtil.empty(this.rootElm);

        // Append the image card tag to this image box's elm.
        this.rootElm.append(this.imageCard.rootElm);
        
        // Raise the isLoaded flag.
        this.isLoaded = true;

        // If there is an onLoadEnd callback, invoke it.
        if (this._onLoadEnd) this._onLoadEnd();
    }
}
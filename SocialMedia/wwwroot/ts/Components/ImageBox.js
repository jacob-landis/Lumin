/*
    This class contains the logic for an image slot component.
    The slot itself maintains it's position in the DOM but the image within can be swapped out for other images.

    Not only can different images be swapped out, but the same image can be unloaded and reloaded.
    This is a component of lazy loading.
    Images are dumped from posts as the user scrolls away from them and reloaded when scrolled back to.
*/
var ImageBox = /** @class */ (function () {
    /*
         PARAMETERS:
         existingTag can be an HTML elm or null.
         boxClassList must be at least an empty string. Applies to this image box's main HTML tag. Only useful if no existing tag is provided.
         imageClassList must be at least an empty string. Applies to whatever image is loaded in.
         click can be a function or null.
         getThumbnail can be true or false/null (null and false have the same outcome). Size setting: true = small, false = big.
    */
    function ImageBox(existingTag, boxClassList, imageClassList, click, getThumbNail) {
        // Get a handle on the provided size setting.
        this.getThumbNail = getThumbNail;
        // Get a handle on image classList.
        this.heldClassList = imageClassList;
        // If a click callback was provided, get a handle on it, else get a handle on an empty function.
        this.heldClick = click ? click : function () { };
        // If an existing tag was provided,
        if (existingTag) {
            // get a handle on it,
            this.tag = existingTag;
            // and give it an 'image-box' class.
            this.tag.classList.add('image-box');
        }
        // else, create a new tag, give it a classList of 'image-box' plus whatever was provided in boxClassList and get a handle on it.
        else
            this.tag = ViewUtil.tag('div', { classList: boxClassList + " image-box" });
        // Set is loaded to false. XXX this.isLoaded could be initilized as false in the properties above.
        this.isLoaded = false;
        // Add this instance ImageBox to imageBoxes.
        ImageBox.imageBoxes.push(this);
    }
    Object.defineProperty(ImageBox.prototype, "height", {
        // Shortcuts to get the height and width properties of this image box's HTML tag.
        get: function () { return Util.getDivHeight(this.tag); },
        // A shortcut to set the height properties of this image box's HTML tag.
        // Used to make comment container tag become scrollable at a specified height.
        set: function (height) { this.tag.style.height = height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "width", {
        get: function () { return Util.getDivWidth(this.tag); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ImageBox.prototype, "onLoadEnd", {
        // Set callback that is invoked at the end of reload().
        set: function (onLoadEnd) { this._onLoadEnd = function () { return onLoadEnd(); }; },
        enumerable: true,
        configurable: true
    });
    /*
        Updates the image by ImageID and optionally changes it's classList and/or onclick function.
        This will make the request to the host for the image with the provided ImageID.

        PARAMETERS:
        imageId must be an int. The id is used to fetch the appropriate image from the server.
        classlist can be a string or null. If it is null the current images classlist attribute will not be changed.
        click can be a function or null. If it is null the current images onclick event will not be changed.
    */
    ImageBox.prototype.load = function (imageId, classList, click) {
        // Replace handle on imageId.
        this.heldImageId = imageId;
        // Optionally replace handle on classList.
        this.heldClassList = classList ? classList : this.heldClassList;
        // Optionally replace handle on onclick function.
        this.heldClick = click ? click : this.heldClick;
        // Unload current image.
        this.unload();
        // Reload current image (Makes request).
        this.reload();
    };
    /*
        Directly load an image card into this image box.
        This will not make a request.

        imageCard must be an imageCard.
    */
    ImageBox.prototype.loadImage = function (imageCard) {
        // Clear this image box's main HTML elm.
        ViewUtil.empty(this.tag);
        // If a classList or click callback was ever provided, apply them to the imageCard.
        if (this.heldClassList)
            imageCard.tag.classList = this.heldClassList;
        if (this.heldClick)
            imageCard.click = this.heldClick;
        // Append tag of new image card to this image box's main HTML elm.
        this.tag.append(imageCard.tag);
        // Raise is loaded flag.
        this.isLoaded = true;
    };
    /*
        Unload the current image card and clear it from memory.
    */
    ImageBox.prototype.unload = function () {
        // If an image card is loaded,
        if (this.isLoaded) {
            // clear it's HTML rendering,
            ViewUtil.empty(this.tag);
            // delete it from memory,
            delete this.imageCard;
            // and lower the isLoaded flag.
            this.isLoaded = false;
        }
    };
    /*
        Request the image from the host with the ImageID that is held here.
    */
    ImageBox.prototype.reload = function () {
        var _this = this;
        // If an image is not loaded,
        if (!this.isLoaded)
            // Request an image with the request settings and apply the attribute settings when it returns.
            Repo.image(this.heldImageId, this.heldClassList, this.heldClick, this.getThumbNail, 
            // When the prepped image card arrives,
            function (imageCard) {
                // get a handle on it,
                _this.imageCard = imageCard;
                // empty this image boxes main HTML elm, XXX Does this really have to be done here????
                ViewUtil.empty(_this.tag);
                // append the image card tag to this image box's elm,
                _this.tag.append(_this.imageCard.tag);
                // raise the isLoaded flag,
                _this.isLoaded = true;
                // and if there is an onLoadEnd callback, invoke it.
                if (_this._onLoadEnd)
                    _this._onLoadEnd();
            });
    };
    // A global collection of imageBox instances.
    ImageBox.imageBoxes = [];
    return ImageBox;
}());
//# sourceMappingURL=ImageBox.js.map
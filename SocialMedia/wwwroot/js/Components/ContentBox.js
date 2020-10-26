/*
    This class holds functionality for storing JS objs with HTML tag properties and rendering those tags.
    It contains everything for lazy loading except the logic of testing whether the user has scrolled past the request threshold.
        (attempts have been made to test the surpassing of the threshold in this class but to no avail)
*/
class ContentBox {

    // A global collection of ContentBox instances.
    static contentBoxes = [];

    // Whether or not a request is pending. XXX rename awaiting?
    // It is assumed that a new content box has not yet sent a request.
    loading = false;

    // Whether or not the request feed has run out.
    // Even though there may be an empty feed, it must be checked at least once before it's ruled out.
    moreContent = true;

    // The "box" in "content box".
    content = [];

    // The HTML tag where the content is actually rendered.
    tag;

    // The callback for a request.
    // This is called here so that pre-request logic can be consolidated and performed here. See request().
    requestFunc;

    // The length of the segment to request from host.
    take;

    // A shortcut for the content count.
    // Acts as the skip paramter in a request.
    get length() { return this.content.length; }

    // Shortcuts to get the height and width properties of this content box's HTML tag.
    get height() { return Util.getDivHeight(this.tag); }
    get width() { return Util.getDivWidth(this.tag); }

    // A shortcut to set the height properties of this content box's HTML tag.
    // Used to make tag become scrollable at a specified height.
    set height(height) { this.tag.style.height = height; }

    /*
        PARAMETERS:
        tagOrId can be a string, an HTML tag, or null.
        classList can be a string or null. If tagOrId is an HTML tag, classList might as well be null. Add class attributes before sending tag here.
        take can be an int or null.
        requestFunc can be a function or null.
    */
    constructor(tagOrId, classList, take, requestFunc) {

        // Get a handle on the provided request callback.
        this.requestFunc = requestFunc;

        // If tagOrId is a string or null,
        if (typeof tagOrId == 'string' || !tagOrId)
            
            // create a new tag and get a handle on it.
            // The id attribute can be the provided string value or no id if a null value was provided.
            // The classList attribute can be the provided string value or no classList if a null value was provided.
            this.tag = ViewUtil.tag('div', { classList: `${classList} content-box`, id: tagOrId });

        // or else, modify existing tag.
        else {

            // Get a handle on the provided tag.
            this.tag = tagOrId;

            // Add 'content-box' to the classList attribute.
            this.tag.classList.add('content-box');
        }

        // If a non-null take parameter value was provided, get a handle on it.
        if (take) this.take = take;

        // Add this instance of ContentBox to contentBoxes.
        ContentBox.contentBoxes.push(this);
    }

    /*
        Trigger the callback that was provided in the construction of this content box.

        take can be an int or null. It is only used for the initial request, which is typically larger than the proceeding requests.
    */
    request(take) {

        // If this content box is not awaiting a response and there is more content in the feed,
        // (if a previous request has not been fulfilled, the same one will be made again and there will be duplicate content)
        if (!this.loading && this.moreContent) {

            // check if a take value was provided, if not, use the previously provided value,
            this.take = take ? take : this.take;

            // then raise the loading flag, XXX rename to awaiting in comment if this.loading is renamed
            this.loading = true;

            // then, finally, trigger the request callback.
            this.requestFunc(this.length, this.take);
        }
    }
    
    /*
        PARAMETERS:
        content can be a JS obj with a tag property or a list of those.
        prepend can be true or false/null. (false and null create the same outcome). Determines whether tags are appended or prepended by siblings.
    */
    add(content, prepend) {

        // If content is singulare, convert it to an array of one.
        if (!Array.isArray(content)) content = [content];

        // If the content being added comes from a request and the amount of content is less than asked for,
        // lower the more content flag.
        if (this.loading && content.length < this.take) this.moreContent = false;

        // Loop through the provided content,
        content.forEach(c => {

            // Add content to this content box's collection.
            this.content.push(c);

            // If content is not null,
            if (c) {

                // prepend or append it's HTML tag to this content box's HTML tag.
                if (prepend) this.tag.prepend(c.tag);
                else this.tag.append(c.tag);
            }
        });

        // If this content box has an established request feed,
        // (nothing should be added to a content box when a request is pending)
        if (this.requestFunc) {

            // check if the end of the feed has been reached and update the flag, XXX we seem to already do this...
            this.moreContent = this.take == content.length;

            // and lower the loading flag now that we don't need it for any more checks.
            this.loading = false;
        }
    }

    /*
        Clears the content list and the HTML tag.
    */
    clear() {
        this.items = []; // XXX is this supposed to be this.content?

        // Empty this content box's HTML tag.
        ViewUtil.empty(this.tag);
    }
}
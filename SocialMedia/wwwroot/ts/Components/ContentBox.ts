/*
    This class holds functionality for storing JS objs with HTML tag properties and rendering those tags.
    It contains everything for lazy loading except the logic of testing whether the user has scrolled past the request threshold.
        (attempts have been made to test the surpassing of the threshold in this class but to no avail)
*/
class ContentBox implements IAppendable {

    // The HTML tag where the content is actually rendered.
    public rootElm: HTMLElement;

    public messageElm: HTMLElement;
    public contentElm: HTMLElement;

    // A global collection of ContentBox instances.
    public static contentBoxes: ContentBox[] = [];

    // Defaults to this.rootElm if not specified in the constructor.
    public scrollElm: HTMLElement;

    public loadThreshold: number;

    // Whether or not a request is pending. XXX rename awaiting?
    // It is assumed that a new content box has not yet sent a request.
    public loading: boolean = false;

    // Whether or not the request feed has run out.
    // Even though there may be an empty feed, it must be checked at least once before it's ruled out.
    private moreContent: boolean = true;

    // The "box" in "content box".
    public content: IAppendable[] = [];
    
    // The callback for a request.
    // This is called here so that pre-request logic can be consolidated and performed here. See request().
    public requestCallback: (skip: number, take: number) => void = null;

    // The length of the segment to request from host.
    public take: number;

    // A shortcut for the content count.
    // Acts as the skip paramter in a request.
    public get length(): number { return this.content.length; }

    // Shortcuts to get the height and width properties of this content box's rootElm.
    public get height(): number { return Util.getElmHeight(this.rootElm); }
    public get width(): number { return Util.getElmWidth(this.rootElm); }
    
    // A shortcut to set the height properties of this content box's rootElm.
    // Used to make rootElm become scrollable at a specified height.
    public set height(height: number) {
        this.rootElm.style.height = `${height}`;
    }

    public onLoadEnd: () => void = null;

    public staged: StageFlag = new StageFlag();

    /*
        <div>
        
        </div>
    */
    public constructor(
        rootElm: HTMLElement,
        scrollElm?: HTMLElement,
        loadThreshold?: number,
        take?: number,
        requestCallback?: (skip: number, take: number) => void
    ) {

        // Get a handle on the provided tag.
        this.rootElm = rootElm;

        this.messageElm = ViewUtil.tag('div', { classList: 'contentMessage' });
        this.contentElm = ViewUtil.tag('div', { classList: 'contentContainer' });

        this.rootElm.append(this.messageElm, this.contentElm);
        
        // Add 'content-box' to the classList attribute.
        this.rootElm.classList.add('content-box');

        this.scrollElm = scrollElm ? scrollElm : this.rootElm;

        this.loadThreshold = loadThreshold ? loadThreshold : 350;

        // If a non-null take parameter value was provided, get a handle on it.
        if (take) this.take = take;
        
        if (requestCallback) this.requestCallback = requestCallback;
        
        this.scrollElm.addEventListener("wheel", (event: MouseWheelEvent) => {
            if (this.requestCallback != null && this.content.length != 0) {
                this.lazyLoad();    
                this.getVisibleContent().forEach((card: Card) => card.alertVisible());
            }
        });

        // Add this instance of ContentBox to contentBoxes.
        ContentBox.contentBoxes.push(this);
    }

    public lazyLoad() {
        let divHeight: number = this.scrollElm.scrollHeight;
        let offset: number = this.scrollElm.scrollTop + this.scrollElm.clientHeight;
        
        if ((offset + this.loadThreshold) > divHeight) this.request();
    }

    public getVisibleContent(): IAppendable[] {

        let visibleContent: IAppendable[] = [];

        let scrollPort: (ClientRect | DOMRect) = this.scrollElm.getBoundingClientRect();

        // For each content item, check if it's root element is in the viewport.
        this.content.forEach((contentItem: IAppendable) => {

            let item: (ClientRect | DOMRect) = contentItem.rootElm.getBoundingClientRect();

            let topIsInLocalViewport: boolean = item.top < scrollPort.bottom && item.top > scrollPort.top;
            let bottomIsInLocalViewport: boolean = item.bottom < scrollPort.bottom && item.bottom > scrollPort.top;

            let topIsInGlobalViewport: boolean = item.top < window.innerHeight && item.top > 0;
            let bottomIsInGlobalViewport: boolean = item.bottom < window.innerHeight && item.bottom > 0;

            let partiallyInLocalViewport: boolean = topIsInLocalViewport || bottomIsInLocalViewport;
            let partiallyInGlobalViewport: boolean = topIsInGlobalViewport || bottomIsInGlobalViewport;

            // If item is visible.
            if (partiallyInLocalViewport && partiallyInGlobalViewport) visibleContent.push(contentItem);
        });
        return visibleContent;
    }

    /*
        Trigger the callback that was provided in the construction of this content box.

        take can be an int or null. It is only used for the initial request, which is typically larger than the proceeding requests.
    */
    public request(take?: number): void {

        // If this content box is not awaiting a response and there is more content in the feed,
        // (if a previous request has not been fulfilled, the same one will be made again and there will be duplicate content)
        if (!this.loading && this.moreContent) {

            // if a take value was provided, overwrite the previous take value,
            if (take) this.take = take;

            // then raise the loading flag, XXX rename to awaiting in comment if this.loading is renamed
            this.loading = true;

            // then, finally, trigger the request callback.
            this.requestCallback(this.length, this.take);
        }
    }
    
    /*
        PARAMETERS:
        content can be a JS obj with a tag property or a list of those.
        prepend can be true or false/null. (false and null create the same outcome). Determines whether tags are appended or prepended by siblings.
    */
    public add(content: (IAppendable | IAppendable[]), prepend?: boolean): void {

        let isFirstBatch: boolean = this.content.length == 0;

        // If content is singulare, convert it to an array of one.
        if (!Array.isArray(content)) content = [content];

        // If the content being added comes from a request and the amount of content is less than asked for,
        // lower the more content flag.
        if (this.loading && content.length < this.take) this.moreContent = false;

        // Loop through the provided content,
        content.forEach((content: IAppendable) => {

            // If content is not null.
            if (content != null) {
                
                // Unshift or push content to this.content and prepend or append its root element to this content box's root element.
                if (prepend == true) {
                    this.content.unshift(content);
                    this.contentElm.prepend(content.rootElm);
                }
                else {
                    this.content.push(content);
                    this.contentElm.append(content.rootElm);
                }
            }
        });

        // If this content box has an established request feed,
        // (nothing should be added to a content box when a request is pending)
        if (this.requestCallback) {

            // check if the end of the feed has been reached and update the flag, XXX we seem to already do this...
            this.moreContent = this.take == content.length;

            // and lower the loading flag now that we don't need it for any more checks.
            this.loading = false;

            // If the first content has arrived and an event callback was given, invoke callback.
            // Used for staging content.
            if (isFirstBatch && this.onLoadEnd != null) this.onLoadEnd();
        }
    }

    /*
        Clears this content array and rootElm.
    */
    public clear(): void {

        // Clear this content array.
        this.content = [];

        // Clear this rootElm.
        ViewUtil.empty(this.contentElm);

        // Reset flags
        this.loading = false;
        this.moreContent = true;
    }

    public refresh(onRefreshEnd: () => void) { }
}
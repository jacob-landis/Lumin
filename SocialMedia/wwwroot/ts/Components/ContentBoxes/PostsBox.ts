/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores posts.
    
    Constructor establishes a request feed for lazy loading but does not initiate it.
    Start() must be called to initiate it.
*/
class PostsBox extends ContentBox {

    // A global collection of PostBox instances.
    public static postBoxes: PostsBox[] = [];

    // The profile who's post feed will be loaded.
    // If profileId is false this will ask the host for the public feed.
    public profileId: number;
    private stage: Stage;

    /*
        PARAMETERS:
        profileId can be null.
        rootElm must be an HTML element.
    */
    public constructor(
        profileId?: number,
        rootElm?: HTMLElement,
        scrollElm?: HTMLElement,
        public feedType?: ('commentedPosts' | 'likedPosts' | 'mainPosts'),
        public getFeedFilter?: () => ('recent' | 'likes' | 'comments'),
        private onPostsLoadEnd?: () => void
    ) {
        // Call base class constructor.
        super(rootElm, scrollElm, 1500, 3,
            // When content box is ready for more content,
            (skip: number, take: number): void => {
                
                // if a ProfileID was included,
                if (profileId != null)

                    // send a profilePosts request to the server,
                    Ajax.getProfilePosts(this.profileId, skip, take, this.getFeedFilter(), this.feedType, 

                        // and when the posts return as post cards,
                        (postCards: PostCard[]) => {

                            // add them to the content box of this post box.
                            this.addPost(postCards)
                            if (onPostsLoadEnd != null) onPostsLoadEnd();  
                        }
                    )
                else
                    // or else send a publicPosts request to the server with the set skip and take values of this post box,
                    Ajax.getPublicPosts(skip, take,

                        // and when the posts return as post cards,
                        (postCards: PostCard[]) => {

                            // add them to the content box of this post box.
                            this.addPost(postCards)
                            if (onPostsLoadEnd != null) onPostsLoadEnd();        
                        }
                    );
            }
        );
        
        // Add class attribute to rootElm before sending to base class.
        rootElm.classList.add('post-box');

        // Get handle on the provided ProfileID or the current user's ProfileID.
        // Used to make request a feed of one profile's posts.
        // If no value is provided, the current user's public feed will be loaded.
        this.profileId = profileId ? profileId : User.profileId;

        this.messageElm.onclick = (event: MouseEvent) => this.collapseBox();
        this.messageElm.title = 'Contract section';

        PostsBox.postBoxes.push(this);
    }

    /*
        Shortcut for adding posts to this post box's content box.
    */
    public addPost(postCard: (PostCard | PostCard[])): void {

        this.onLoadEnd = () => {

            let stageFlags: StageFlag[] = [];

            this.content.forEach((c: IAppendable) => {
                let post = <PostCard>c;

                stageFlags.push(post.allStaged);
                post.stage.onStagingEnd = () => this.stage.updateStaging(post.allStaged);
            });

            this.stage = new Stage(stageFlags, () => {
                this.rootElm.style.opacity = '1';
                this.onPostsLoadEnd();
            });

            if (this.content.length == 0) this.stage.onStagingEnd();
        }

        this.add(postCard, !Array.isArray(postCard));
    }

    /*
        Send first request to host. 
    */
    public start(): void {
        this.request(5);
    }

    public refreshPosts(onRefreshLoadEnd?: () => void): void {
        this.clear();
        Ajax.getProfilePosts(this.profileId, 0, 5, this.getFeedFilter(), this.feedType, (postCards: PostCard[]) => {
            this.addPost(postCards);
            if (onRefreshLoadEnd) onRefreshLoadEnd();
        });
    }

    private collapseBox(): void {
        ViewUtil.hide(this.contentElm);
        this.messageElm.onclick = (event: MouseEvent) => this.expandBox();
        this.messageElm.title = 'Expand section';
    }

    private expandBox(): void {
        ViewUtil.show(this.contentElm, 'block');
        this.messageElm.onclick = (event: MouseEvent) => this.collapseBox();
        this.messageElm.title = 'Collapse section';
    }
}
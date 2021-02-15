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
    
    /*
        PARAMETERS:
        profileId can be null.
        rootElm must be an HTML element.
    */
    public constructor(profileId?: number, rootElm?: HTMLElement, scrollElm?: HTMLElement) {
        
        // Add class attribute to rootElm before sending to base class.
        rootElm.classList.add('post-box');

        // Call base class constructor.
        super(rootElm, scrollElm, 1500, 5,
            // When content box is ready for more content,
            (skip: number, take: number): void => {
                
                // if a ProfileID was included,
                if (profileId != null)

                    // send a profilePosts request to the server,
                    Ajax.getProfilePosts(this.profileId, skip, take,

                        // and when the posts return as post cards,
                        (postCards: PostCard[]) => 
                            // add them to the content box of this post box.
                            this.add(postCards)
                    )
                else
                    // or else send a publicPosts request to the server with the set skip and take values of this post box,
                    Ajax.getPublicPosts(skip, take,

                        // and when the posts return as post cards,
                        (postCards: PostCard[]) =>

                            // add them to the content box of this post box.
                            this.add(postCards));
            }
        );
        
        // Get handle on the provided ProfileID or the current user's ProfileID.
        // Used to make request a feed of one profile's posts.
        // If no value is provided, the current user's public feed will be loaded.
        this.profileId = profileId ? profileId : User.profileId;

        PostsBox.postBoxes.push(this);
    }

    /*
        Shortcut for adding posts to this post box's content box.
    */
    public addPost(postCard: (PostCard | PostCard[])): void { this.add(postCard, true); }

    /*
        Send first request to host. 
    */
    public start(): void {
        this.request(15);
    }
}
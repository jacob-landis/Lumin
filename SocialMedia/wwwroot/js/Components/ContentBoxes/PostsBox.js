/*
    This class is a sudo-extension of ContentBox.
    It manages the logic of a content box that specifically stores posts.
    
    Constructor establishes a request feed for lazy loading but does not initiate it.
    Start() must be called to initiate it.
*/
class PostsBox {

    // A global collection of PostBox instances.
    static postBoxes = [];

    // The profile who's post feed will be loaded.
    // If profileId is false this will ask the host for the public feed.
    profileId;

    // The base class used to store the post cards.
    contentBox;

    /*
        PARAMETERS:
        profileId can be null.
        existingTag must be an HTML element.
    */
    constructor(profileId, existingTag) {

        // XXX if no ProfileID can be used and just defualt public posts can be requested, why is it made mandatory that this be a valid ProfileID?
        // is this for when postBoxes are scanned to add or remove a post card?
        this.profileId = profileId ? profileId : User.id;

        // Prep callback for ContentBox construction.
        let contentBoxRequestFunc =

            // When content box is ready for more content,
            (skip, take) =>

                // if a ProfileID was included,
                profileId ?

                    // send a profilePosts request to the server with the set skip and take values along with the ProfileID of this post box,
                    Repo.profilePosts(this.profileId, skip, take,

                        // and when the posts return as post cards,
                        (posts) =>

                            // add them to the content box of this post box.
                            this.contentBox.add(posts))
                    
                    :
                    // or else send a publicPosts request to the server with the set skip and take values of this post box,
                    Repo.publicPosts(skip, take,

                        // and when the posts return as post cards,
                        (posts) =>

                            // add them to the content box of this post box.
                            this.contentBox.add(posts));

        // Construct a new ContentBox.
        this.contentBox = new ContentBox(existingTag, 'posts-box', 5, contentBoxRequestFunc);

        // Add to collection of live post boxes.
        PostsBox.postBoxes.push(this);
    }

    /*
        Shortcut for adding posts to this post box's content box.
    */
    addPost(postCard) { this.contentBox.add(postCard, true); }

    /*
        Send first request to host. 
    */
    start() { this.contentBox.request(15); }
}
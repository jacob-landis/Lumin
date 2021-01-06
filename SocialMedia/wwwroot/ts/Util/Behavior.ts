class Behavior {

    //static userImageContextOpts =imageCard=> e=> {

    //    ContextModal.load(e, true, [

    //        new ContextOption(Icons.createPost(), () => {
    //            ImageDropdown.close();
    //            CreatePostModal.load(imageCard);
    //        }),
    //        new ContextOption(Icons.deleteImage(), () => {
    //            console.log(imageCard);
    //        })
    //    ]);
    //}

    public static singleFullSizeImage = (imageCard: ImageCard) => ()=> {
        fullSizeImageModal.loadSingle(imageCard.image.imageId);
    }

    //static fullSizeImage =clickedImageCard=> () => {
    //    FullSizeImageModal.load(
    //        ImageDropdown.imageBox.content.indexOf(clickedImageCard),
    //        ImageDropdown.profileId
    //    );
    //}
    
}
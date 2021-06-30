using System;
using System.Collections.Generic;
using System.IO;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SocialMedia.Models;
using SocialMedia.Models.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.Diagnostics;
using System.Text;
using SocialMedia.Infrastructure;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Threading;

namespace SocialMedia.Controllers
{
    /*
        Handles create, read, and delete operations in Image table, and handles image processing and file system storage and retrieval. 
    */
    [Route("api/[controller]")]
    public class ApiImageController : Controller
    {
        private IImageRepository imageRepo;
        private IPostRepository postRepo;
        private ICommentRepository commentRepo;
        private IProfileRepository profileRepo;
        private ILikeRepository likeRepo;
        private IFriendRepository friendRepo;
        private CurrentProfile currentProfile;
        private readonly IHostingEnvironment env; // Used to deal with server files.

        public ApiImageController(
           IImageRepository imageRepo,
           IPostRepository postRepo,
           ICommentRepository commentRepo,
           IProfileRepository profileRepo,
           ILikeRepository likeRepo,
           IFriendRepository friendRepo,
           CurrentProfile currentProfile,
           IHostingEnvironment env)
        {
            this.imageRepo = imageRepo;
            this.postRepo = postRepo;
            this.commentRepo = commentRepo;
            this.profileRepo = profileRepo;
            this.likeRepo = likeRepo;
            this.friendRepo = friendRepo;
            this.currentProfile = currentProfile;
            this.env = env;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        /*
             Returns the number of images that a user has by their ProfileID.
        */
        [HttpGet("profileimagescount/{id}")]
        public int ProfileImagesCount(int id) => imageRepo.ByProfileId(id).Count();

        [HttpPost("updateimageprivacy/{imageId}/{privacyLevel}")]
        public void UpdateImagePrivacy(int imageId, int privacyLevel)
        {
            Models.Image image = imageRepo.ById(imageId);
            image.PrivacyLevel = privacyLevel;
            imageRepo.SaveImage(image);
        }

        /*
             Deletes an image by ImageID from database and file system, and deletes all dependencies of image (posts, postLikes, comments, commentLikes)
        */
        [HttpPost("deleteimage/{id}")]
        public void DeleteImage(int id)
        {
            // Get a handle on the image record by ImageID provided.
            Models.Image image = imageRepo.ById(id);

            // Validate image ownership.
            if(image.ProfileId == currentProfile.id)
            {
                // Burrow into the nested dependencies and delete them on the way out.
                // Pattern: (1)prep list, (2)fill list, (3)loop list, (4)repeat pattern on dependencies, (5)delete record.

                List<Post> posts = new List<Post>(); // (1)Prep list.
                foreach(Post p in postRepo.Posts.Where(p => p.ImageId == id)) { posts.Add(p); } // (2)Fill list.
                foreach(Post p in posts) // (3)Loop list.
                {
                    // (4)Repeat pattern on dependencies.
                    List<Comment> comments = new List<Comment>();
                    foreach (Comment c in commentRepo.ByPostId(id)) { comments.Add(c); }
                    foreach (Comment c in comments)
                    {
                        List<Like> commentLikes = new List<Like>();
                        foreach (Like l in likeRepo.ByTypeAndId(2, c.CommentId)) { commentLikes.Add(l); }
                        foreach (Like l in commentLikes)
                        {
                            likeRepo.DeleteLike(l);
                        }

                        commentRepo.DeleteComment(c);
                    }

                    List<Like> postLikes = new List<Like>();
                    foreach (Like l in likeRepo.ByTypeAndId(1, p.PostId)) { postLikes.Add(l); }
                    foreach (Like l in postLikes)
                    {
                        likeRepo.DeleteLike(l);
                    }

                    // (5)Delete record.
                    postRepo.DeletePost(p);
                }

                // If the user is using the image to be deleted as a profile picture, give them their default profile picture.
                if (currentProfile.profile.ProfilePicture == id)
                {
                    // Get profile by current user's ProfileID.
                    // (By doing this, instead of using currentUser.profile, it gaurentees that this is the latest version of the profile.)
                    Profile profile = profileRepo.ById(currentProfile.id);
                    profile.ProfilePicture = 0; // Give default profile picture ImageID.
                    profileRepo.SaveProfile(profile); // Commit profile changes.
                    currentProfile.SetProfile(profile); // Update CurrentProfile in session.
                }

                // Prep paths for fullsize and thumbnail images.
                string path = env.WebRootPath + "\\ImgFull\\" + image.Name;
                string thumbnailPath = env.WebRootPath + "\\ImgThumb\\" + image.Name;

                // Remove fullsize and thumbnail images from file system.
                DeleteFromFileSystem(path);
                DeleteFromFileSystem(thumbnailPath);

                // Delete image record from database.
                imageRepo.DeleteImage(image);
            }
        }

        /*
             Returns a portion of a profile's images. Used for lazy loading.
        */
        [HttpGet("profileimages/{id}/{imageCount}/{amount}")]
        public List<RawImage> ProfilesImages(int id, int imageCount, int amount) // (id, skip, take) XXX rename
        {
            int relationshipTier = friendRepo.RelationshipTier(currentProfile.profile.ProfileId, id);

            // Prep list.
            List<RawImage> images = new List<RawImage>();

            // If the requested segment does not start past the end of the list.
            if (imageCount < imageRepo.CountByProfileId(id))
            {
                // Loop though requested segment of profile's images.
                foreach (Models.Image i in imageRepo.RangeByProfileId(id, imageCount, amount))
                {
                    if (i.PrivacyLevel <= relationshipTier)
                    {
                        // Add prepped image to list of results.
                        images.Add(Util.GetRawImage(i, true));
                    }
                }

                // Return the results.
                if (images.Count != 0) return images;
            }

            // If no images fall in the requested range, return null.
            return null;
        }

        /*
             Returns an image to the user.
        */
        [HttpGet("{id}/{thumb}")] // thumb will be 1 or 0. 0 meaning fullsize, 1 meaning thumbnail.
        public RawImage Get(int id, int thumb)
        {
            if (id == 0) return Util.GetRawImage(new Models.Image(), thumb == 1);

            Models.Image image = imageRepo.ById(id);
            Profile profile = profileRepo.ById(image.ProfileId);
            int relationshipTier = friendRepo.RelationshipTier(currentProfile.profile.ProfileId, profile.ProfileId);

            bool imageIsInPost = postRepo.ByProfileId(image.ProfileId).Any((Post p) => p.ImageId == image.ImageId);

            // If profile has direct or indirect access.
            // If (hasAccess OR (imageIsProfilePicture AND hasProfilePictureAccess) OR (imageIsInPost AND hasPostAccess))
            if (image.PrivacyLevel <= relationshipTier
                || (profile.ProfilePicture == id && profile.ProfilePicturePrivacyLevel <= relationshipTier)
                || (imageIsInPost && profile.ProfilePostsPrivacyLevel <= relationshipTier))
                return Util.GetRawImage(image, thumb == 1);

            return Util.GetRawImage(new Models.Image(), thumb == 1);
        }

        /*
             Adds image and its thumbnail version to the file system. Adds image record to database.
        */
        [HttpPost]
        public RawImage Upload([FromBody] RawImageUpload rawImage)
        {
            // If data was not revieved, abort.
            if (rawImage == null) return null;

            // Get handle on name for shortcut (this is used frequently).
            string name = rawImage.Name;

            // Initialize counter to 1.
            int x = 1;

            // Create unique image name.
            // Loop while the current name exists.
            while (System.IO.File.Exists(env.WebRootPath + "\\ImgFull\\" + name))
            {
                // File name example: "(12)foo"

                // If this is not the first loop, remove name duplication counter -> "(#)"
                if (x != 1) name = name.Remove(0, name.IndexOf(')') + 1);

                // Try new duplication counter with name.
                name = "(" + x + ")" + name;

                // Increment duplication counter.
                x++;
            }

            // Convert raw image data from base 64 to byte array (MemoryStream requires this format).
            byte[] byteImg = Convert.FromBase64String(rawImage.Raw);

            // Prep file system paths using the unique name from above.
            string path = env.WebRootPath + "\\ImgFull\\" + name;
            string thumbnailPath = env.WebRootPath + "\\ImgThumb\\" + name;

            // Open memory stream for image.
            using (var streamBitmap = new MemoryStream(byteImg))
            {
                // Pull image through memory stream.
                using (var img = System.Drawing.Image.FromStream(streamBitmap))
                {
                    // Write fullsize image to file system.
                    img.Save(path);

                    // Initialize max size. XXX make const
                    decimal maxSize = 200;

                    // Initialize thumbnail height and width to maxSize.
                    // This does two things: (1) These variables are declared in the correct scope (2) These proportions handle a square image.
                    // These will be used to resize image.
                    int thumbWidth = (int)maxSize;
                    int thumbHeight = (int)maxSize;

                    // Create shortcut variables.
                    decimal height = img.Height;
                    decimal width = img.Width;

                    // Declare ratio.
                    decimal ratio;

                    // If image as fullsize does not exceed size limits in either direction, do not shrink.
                    if(img.Width < maxSize && img.Height < maxSize)
                    {
                        thumbHeight = img.Height;
                        thumbWidth = img.Width;
                    }

                    // Else if image is landscape orientation, make width max size and height proportionately sized.
                    else if (img.Width > img.Height)
                    {
                        ratio = height / width;
                        thumbWidth = (int)maxSize;
                        thumbHeight = (int)(maxSize * ratio);
                    }

                    // Else if image is portrait orientation, make height max size and width proportionately sized.
                    else if (img.Height > img.Width)
                    {
                        ratio = width / height;
                        thumbHeight = (int)maxSize;
                        thumbWidth = (int)(maxSize * ratio);
                    } 
                    // OMITTED: Else if image is square, do nothing (the dimensions are already correct).

                    // Send image and it's new dimensions to be converted and get a handle on the result.
                    System.Drawing.Image thumbnail = ResizeImage(img, thumbWidth, thumbHeight);

                    // Save the thumbnail result to the file system.
                    thumbnail.Save(thumbnailPath);
                }

                // Close the memory stream.
                streamBitmap.Close();
            }
            
            // Fill in image model.
            Models.Image image = new Models.Image
            {
                Name = name,
                ProfileId = currentProfile.profile.ProfileId,
                DateTime = DateTime.UtcNow,
                PrivacyLevel = rawImage.PrivacyLevel
            };

            // Save image record, use the returned id to pull that same record, prep it, and return it to the user.
            return Util.GetRawImage( imageRepo.ById(imageRepo.SaveImage(image)), false);
        }

        //-----------------------------------------UTIL---------------------------------------------//

        /*
            Delete image file from file system.
        */
        public static void DeleteFromFileSystem(string path)
        {
            // Make multiple attempts to delete incase it fails.
            for (int i = 1; i <= 1000; ++i)
            {
                try
                {
                    // Try to delte the file
                    System.IO.File.Delete(path);

                    // If successful, break out of the loop.
                    break;
                }
                catch (IOException e) when (i <= 10000) // XXX try removing "(IOException e)" and try changing 10000 to 1000
                {
                    // If an error occured while trying to delete, wait before looping again.
                    Thread.Sleep(3);
                }
            }
        }

        /*
             Resizes an image to the provided dimensions.
        */
        public static Bitmap ResizeImage(System.Drawing.Image image, int width, int height)
        {
            // Initialize destination image and rectangle.
            Rectangle destRect = new Rectangle(0, 0, width, height);
            Bitmap destImage = new Bitmap(width, height);

            // Set resolution of destImage Bitmap using fullsize image.
            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            // Start using graphics class.
            using (var graphics = Graphics.FromImage(destImage))
            {
                // Adjust graphics settings.
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                // Start using an ImageAttributes.
                using (var wrapMode = new ImageAttributes())
                {
                    // Set wrap mode.
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);

                    // Draw thumbnail.
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            // Return thumbnail result.
            return destImage;
        }
    }
}
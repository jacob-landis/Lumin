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
    [Route("api/[controller]")]
    public class ApiImageController : Controller
    {
        private IImageRepository imageRepo;
        private IPostRepository postRepo;
        private ICommentRepository commentRepo;
        private IProfileRepository profileRepo;
        private ILikeRepository likeRepo;
        private CurrentProfile currentProfile;
        private readonly IHostingEnvironment env;

        public ApiImageController(
           IImageRepository imageRepo,
           IPostRepository postRepo,
           ICommentRepository commentRepo,
           IProfileRepository profileRepo,
           ILikeRepository likeRepo,
           CurrentProfile currentProfile,
           IHostingEnvironment env)
        {
            this.imageRepo = imageRepo;
            this.postRepo = postRepo;
            this.commentRepo = commentRepo;
            this.profileRepo = profileRepo;
            this.likeRepo = likeRepo;
            this.currentProfile = currentProfile;
            this.env = env;
        }

        //-----------------------------------------ROUTING---------------------------------------------//

        [HttpGet("profileimagescount/{id}")]
        public int ProfileImagesCount(int id) => imageRepo.ByProfileId(id).Count();

        [HttpPost("deleteimage/{id}")]
        public void DeleteImage(int id)
        {
            Models.Image image = imageRepo.ById(id);

            // image ownership is validated
            if(image.ProfileId == currentProfile.id)
            {
                // check for mathches in posts, delete comment likes, comments, post likes, and posts
                List<Post> posts = new List<Post>();
                foreach(Post p in postRepo.Posts.Where(p => p.ImageId == id)) { posts.Add(p); }
                foreach(Post p in posts)
                {
                    List<Comment> comments = new List<Comment>();
                    foreach (Comment c in commentRepo.ByPostId(id)) { comments.Add(c); }
                    foreach (Comment c in comments)
                    {
                        List<Like> commentLikes = new List<Like>();
                        foreach (Like l in likeRepo.ByTypeAndId(2, c.CommentId)) { commentLikes.Add(l); }
                        foreach (Like l in commentLikes) { likeRepo.DeleteLike(l); }

                        commentRepo.DeleteComment(c);
                    }

                    List<Like> postLikes = new List<Like>();
                    foreach (Like l in likeRepo.ByTypeAndId(1, p.PostId)) { postLikes.Add(l); }
                    foreach (Like l in postLikes) { likeRepo.DeleteLike(l); }

                    postRepo.DeletePost(p);
                }

                // check current user profile pic, change that
                if (currentProfile.profile.ProfilePicture == id)
                {
                    Profile profile = profileRepo.ById(currentProfile.id);
                    profile.ProfilePicture = 0;
                    profileRepo.SaveProfile(profile);
                    currentProfile.SetProfile(profile);
                }

                // remove image from file system
                string path = env.WebRootPath + "\\ImgFull\\" + image.Name;
                string thumbnailPath = env.WebRootPath + "\\ImgThumb\\" + image.Name;

                DeleteFromFileSystem(path);
                DeleteFromFileSystem(thumbnailPath);

                // delete from db
                imageRepo.DeleteImage(image);
            }
        }

        [HttpGet("profileimages/{id}/{imageCount}/{amount}")]
        public List<RawImage> ProfilesImages(int id, int imageCount, int amount)
        {
            List<RawImage> images = new List<RawImage>();
            if (imageCount < imageRepo.CountByProfileId(id))
            {
                foreach (Models.Image i in imageRepo.RangeByProfileId(id, imageCount, amount))
                {
                    images.Add(Util.GetRawImage(i, true));
                }
            }
            else return null;
            return images;
        }

        [HttpGet("{id}/{thumb}")] // thumb will be 1 or 0
        public RawImage Get(int id, int thumb) => Util.GetRawImage(imageRepo.ById(id), thumb == 1);

        [HttpPost]
        public RawImage Upload([FromBody] RawImageUpload rawImage)
        {
            if (rawImage == null) return null;

            string name = rawImage.Name;

            int x = 1;
            while (System.IO.File.Exists(env.WebRootPath + "\\ImgFull\\" + name))
            {
                if (x != 1) name = name.Remove(0, name.IndexOf(')') + 1);
                name = "(" + x + ")" + name;
                x++;
            }

            byte[] byteImg = Convert.FromBase64String(rawImage.Raw);
            string path = env.WebRootPath + "\\ImgFull\\" + name;
            string thumbnailPath = env.WebRootPath + "\\ImgThumb\\" + name;
            using (var streamBitmap = new MemoryStream(byteImg))
            {
                using (var img = System.Drawing.Image.FromStream(streamBitmap))
                {
                    img.Save(path);

                    decimal maxSize = 200;
                    int thumbWidth = (int)maxSize;
                    int thumbHeight = (int)maxSize;
                    decimal height = img.Height;
                    decimal width = img.Width;
                    decimal ratio;
                    if(img.Width < maxSize && img.Height < maxSize)
                    {
                        thumbHeight = img.Height;
                        thumbWidth = img.Width;
                    }
                    else if (img.Width > img.Height)
                    {
                        ratio = height / width;
                        thumbWidth = (int)maxSize;
                        thumbHeight = (int)(maxSize * ratio);
                    }
                    else if(img.Height > img.Width)
                    {
                        ratio = width / height;
                        thumbHeight = (int)maxSize;
                        thumbWidth = (int)(maxSize * ratio);
                    } // the last case (w == h), is omitted, but it is handled

                    System.Drawing.Image thumbnail = ResizeImage(img, thumbWidth, thumbHeight);

                    thumbnail.Save(thumbnailPath);
                }
                streamBitmap.Close();
            }
            
            Models.Image image = new Models.Image
            {
                Name = name,
                ProfileId = currentProfile.profile.ProfileId,
                DateTime = DateTime.UtcNow
            };
            return Util.GetRawImage( imageRepo.ById(imageRepo.SaveImage(image)), false);
        }

        //-----------------------------------------UTIL---------------------------------------------//

        public static void DeleteFromFileSystem(string path)
        {
            for (int i = 1; i <= 1000; ++i)
            {
                try
                {
                    System.IO.File.Delete(path);
                    break;
                }
                catch (IOException e) when (i <= 10000)
                {
                    Thread.Sleep(3);
                }
            }
        }

        public static Bitmap ResizeImage(System.Drawing.Image image, int width, int height)
        {
            var destRect = new Rectangle(0, 0, width, height);
            var destImage = new Bitmap(width, height);

            destImage.SetResolution(image.HorizontalResolution, image.VerticalResolution);

            using (var graphics = Graphics.FromImage(destImage))
            {
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.CompositingQuality = CompositingQuality.HighQuality;
                graphics.InterpolationMode = InterpolationMode.HighQualityBicubic;
                graphics.SmoothingMode = SmoothingMode.HighQuality;
                graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;

                using (var wrapMode = new ImageAttributes())
                {
                    wrapMode.SetWrapMode(WrapMode.TileFlipXY);
                    graphics.DrawImage(image, destRect, 0, 0, image.Width, image.Height, GraphicsUnit.Pixel, wrapMode);
                }
            }

            return destImage;
        }
    }
}
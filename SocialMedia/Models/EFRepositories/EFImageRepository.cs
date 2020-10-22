using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFImageRepository : IImageRepository
    {
        private ApplicationDbContext context;

        public EFImageRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        public IEnumerable<Image> Images => context.Images;

        // START SHORTCUTS

        /*
            Get single image by ImageID.
        */
        public Image ById(int? id)
        {
            if (id == 0) return new Image();
            return context.Images.First(i => i.ImageId == id);
        }

        /*
            Get list of image records belonging to the profile of the provided ProfileID
        */
        public IEnumerable<Image> ByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id);

        /*
            Get a range of images belonging to a profile ordered by datetime. 
            Caller can specify how many to skip, and how many to take.
        */
        public IEnumerable<Image> RangeByProfileId(int? id, int? imageCount, int? amount) => 
            //context.Images
            //.Where(i => i.ProfileId == id)
            ByProfileId(id) // replaces the above two XXX test this!
            .OrderByDescending(i => i.DateTime)
            .Skip((int)imageCount)
            .Take((int)amount);

        /*
            Get the count of image that belong to the profile with the provided ProfileID.
        */
        public int CountByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id).Count();
        // END SHORTCUTS
        
        public int SaveImage(Image image)
        {
            if(image.ImageId == 0) context.Images.Add(image);
            else context.Images.Update(image);
            context.SaveChanges();

            // Return the ImageID of the newly created or the updated image record.
            return image.ImageId;
        }

        public void DeleteImage(Image image)
        {
            context.Images.Remove(image);
            context.SaveChanges();
        }
    }
}

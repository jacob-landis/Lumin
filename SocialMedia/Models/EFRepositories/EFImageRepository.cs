using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Implements solution for IRepository to fulfill dependancy for database access service.
    */
    public class EFImageRepository : IImageRepository
    {
        // Context service is provided from Startup.
        private ApplicationDbContext context;

        public EFImageRepository(ApplicationDbContext context)
        {
            this.context = context;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Image> Images => context.Images;

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID.
        */
        public Image ById(int? imageId)
        {
            if (imageId == 0) return new Image();
            return context.Images.First(i => i.ImageId == imageId);
        }

        /*
            Get list of image records belonging to the profile of the provided ProfileID.
        */
        public IEnumerable<Image> ByProfileId(int? profileId) => context.Images.Where(i => i.ProfileId == profileId);

        /*
            Get the count of images that belong to the profile with the provided ProfileID.
        */
        public int CountByProfileId(int? profileId) => context.Images.Where(i => i.ProfileId == profileId).Count();

        /*
            Get a range of images belonging to a profile ordered by datetime. 
            Caller can specify how many to skip, and how many to take.
        */
        public IEnumerable<Image> RangeByProfileId(int? profileId, int? skip, int? take) => 
            ByProfileId(profileId)
            .OrderByDescending(i => i.DateTime)
            .Skip((int)skip)
            .Take((int)take);
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        */
        public int SaveImage(Image image)
        {
            // If the ID is defualt, create a new record.
            if (image.ImageId == 0) context.Images.Add(image);

            // Else, update the record in the database.
            else context.Images.Update(image);

            // Commit change to the database.
            context.SaveChanges();

            // Return the ID to the caller. 
            // Return value is most useful when using this method to create a new record.
            return image.ImageId;
        }

        /*
             Remove record from the database.
        */
        public void DeleteImage(Image image)
        {
            // Remove comment record from the database.
            context.Images.Remove(image);

            // Commit change to the database.
            context.SaveChanges();
        }
    }
}

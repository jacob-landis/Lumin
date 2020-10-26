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
        public Image ById(int? id)
        {
            if (id == 0) return new Image(); // XXX check if other classes are doing null or "nully" checks.
            return context.Images.First(i => i.ImageId == id);
        }

        /*
            Get list of image records belonging to the profile of the provided ProfileID.
        */
        public IEnumerable<Image> ByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id);

        /*
            Get the count of images that belong to the profile with the provided ProfileID.
        */
        public int CountByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id).Count();

        /*
            Get a range of images belonging to a profile ordered by datetime. 
            Caller can specify how many to skip, and how many to take.
        */
        public IEnumerable<Image> RangeByProfileId(int? id, int? imageCount, int? amount) => 
            //context.Images
            //.Where(i => i.ProfileId == id)
            ByProfileId(id) // replaces the above two XXX test this! XXX check if other repo classes do this
            .OrderByDescending(i => i.DateTime)
            .Skip((int)imageCount)
            .Take((int)amount);
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

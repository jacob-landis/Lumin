using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
    */
    public interface IImageRepository
    {
        // Provides direct access to table.
        IEnumerable<Image> Images { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID.
        Image ById(int? id);

        // Get list of image records belonging to the profile of the provided ProfileID.
        IEnumerable<Image> ByProfileId(int? id);

        // Get the count of images that belong to the profile with the provided ProfileID.
        int CountByProfileId(int? id);

        // Get a range of images belonging to a profile ordered by datetime.
        // Caller can specify how many to skip, and how many to take.
        IEnumerable<Image> RangeByProfileId(int? id, int? imageCount, int? amount);
        // END SHORTCUTS

        // Used to create a new record or update an old record, and return the ID of the newly created or the updated record.
        int SaveImage(Image image);

        // Remove record from the database.
        void DeleteImage(Image image);
    }
}

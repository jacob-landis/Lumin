using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Defines dependancy for database access service.
    */
    public interface IProfileRepository
    {
        // Provides direct access to table.
        IEnumerable<Profile> Profiles { get; }

        // Shortcuts could be achived outside of this class with access to context.{type}, but would repeat in places,
        // so they are consolodated here.
        // START SHORTCUTS

        // Get a single record of the type that this class is dedicated to by it's ID.
        Profile ById(int? id);

        // Get profile by Password.
        Profile ByPassword(string password);

        // Get list of all profiles excluding the one belonging to the current user.
        IEnumerable<Profile> ExceptCurrentProfile { get; }

        void DeleteProfile(Profile profile);
        // END SHORTCUTS

        // Used to create a new record or update an old record.
        void SaveProfile(Profile profile);
    }
}

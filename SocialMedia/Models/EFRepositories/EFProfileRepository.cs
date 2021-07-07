using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
// XXX try removing above /\
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
        Implements solution for IRepository to fulfill dependancy for database access service.
    */
    public class EFProfileRepository : IProfileRepository
    {
        // Context service and current profile are provided from Startup.
        private ApplicationDbContext context;
        private CurrentProfile currentProfile;

        public EFProfileRepository(ApplicationDbContext context, CurrentProfile currentProfile)
        {
            this.context = context;
            this.currentProfile = currentProfile;
        }

        /*
            Provides direct access to table.
        */
        public IEnumerable<Profile> Profiles => context.Profiles;

        // START SHORTCUTS

        /*
            Get a single record of the type that this class is dedicated to by it's ID.
        */
        public Profile ById(int? id) => context.Profiles.First(p => p.ProfileId == id);

        /*
            Get profile by Password. 
        */
        public Profile ByPassword(string password) => context.Profiles.First(p => p.Password == password);

        /*
            Get list of all profiles excluding the one belonging to the current user.
        */
        public IEnumerable<Profile> ExceptCurrentProfile => context.Profiles.Where(p => p.ProfileId != currentProfile.id);

        public void DeleteProfile(Profile profile)
        {
            context.Remove(profile);
            context.SaveChanges();
        }
        // END SHORTCUTS

        /*
            Used to create a new record or update an old record, and update the profile reference in session.
        */
        public void SaveProfile(Profile profile)
        {
            // If the ID is defualt, create a new record.
            if (profile.ProfileId == 0) context.Profiles.Add(profile);

            // Else, update the record in the database.
            else context.Profiles.Update(profile);

            // Commit change to the database.
            context.SaveChanges();

            // Update the profile reference in session.
            currentProfile.SetProfile(Profiles.First(p => p.ProfileId == profile.ProfileId));
        }
    }
}

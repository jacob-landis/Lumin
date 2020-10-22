using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    /*
         Holds basic information on the current user's profile for quick reference.
         Instance of this is stored in session by the SessionProfile class that inherits this.
    */
    public class CurrentProfile
    {
        public Profile profile;

        // Default value used to check if user has signed in.
        public int id = 0;

        /*
            Save provided profile to this instance and extract it's Id for reference shortcut.
        */
        public virtual void SetProfile(Profile profile)
        {
            this.profile = profile;
            id = profile.ProfileId;
        }

        /*
            Clear the profile stored in this instance but not the ProfileID.
        */
        public virtual void ClearProfile()
        {
            this.profile = null;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class CurrentProfile
    {
        public Profile profile;
        public int id = 0;

        public virtual void SetProfile(Profile profile)
        {
            this.profile = profile;
            id = profile.ProfileId;
        }

        public virtual void ClearProfile()
        {
            this.profile = null;
        }
    }
}

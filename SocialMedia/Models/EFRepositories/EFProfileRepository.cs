using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFProfileRepository : IProfileRepository
    {
        private ApplicationDbContext context;
        private CurrentProfile currentProfile;
        public IEnumerable<Profile> Profiles => context.Profiles;

        public Profile ById(int? id) => context.Profiles.First(p => p.ProfileId == id);
        public IEnumerable<Profile> ExceptCurrentProfile => context.Profiles.Where(p => p.ProfileId != currentProfile.id);
        public Profile ByPassword(string password) => context.Profiles.First(p => p.Password == password);

        public EFProfileRepository(ApplicationDbContext context, CurrentProfile currentProfile)
        {
            this.context = context;
            this.currentProfile = currentProfile;
        }

        public void SaveProfile(Profile profile)
        {
            if(profile.ProfileId == 0)
            {
                context.Profiles.Add(profile);
            }
            else
            {
                context.Profiles.Update(profile);
            }
            context.SaveChanges();
            currentProfile.SetProfile(Profiles.First(p => p.ProfileId == profile.ProfileId));
            //currentProfile.SetProfile(Profiles.First(p => p.ProfileId == currentProfile.id));
        }
    }
}

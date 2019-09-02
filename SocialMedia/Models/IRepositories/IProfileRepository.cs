using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface IProfileRepository
    {
        IEnumerable<Profile> Profiles { get; }
        IEnumerable<Profile> ExceptCurrentProfile { get; }
        Profile ById(int? id);
        Profile ByPassword(string password);
        void SaveProfile(Profile profile);
    }
}

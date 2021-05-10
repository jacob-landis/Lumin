using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class Friend
    {
        // PK of this record, not an actual profile.
        public int FriendId { get; set; }

        // Whether or not the profile that this was to accepted it.
        public bool Accepted { get; set; }

        // The datetime that this was sent on.
        public DateTime DateSent { get; set; }

        // The datetime that this was accepted on.
        public DateTime DateAccepted { get; set; } // XXX typo (accepted)

        // ASSOCIATIONS

        // ProfileID of recipiant.
        public int? ToId { get; set; }

        // ProfileID of sender.
        public int? FromId { get; set; }

        // The profile Id of the party that blocked the other.
        public int? BlockerProfileId { get; set; }
    }
}

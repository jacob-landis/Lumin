using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using SocialMedia.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class FriendDropdownResults
    {
        [JsonIgnore]
        public ISession Session { get; set; }

        public int profileId;
        public string searchStr;
        public List<int?> profileIds = new List<int?>();

        public static FriendDropdownResults GetFriendDropdownResults(IServiceProvider services)
        {
            // Get handle on this server session.
            ISession serverSession = services.GetRequiredService<IHttpContextAccessor>()?
                .HttpContext.Session;

            FriendDropdownResults results = serverSession?.GetJson<FriendDropdownResults>("FriendDropdownResults") ??
                new FriendDropdownResults();

            // Sets Session to this server session (default session if new instance).
            results.Session = serverSession;

            return results;
        }

        public List<int?> GetSegment(int skip, int take)
        {
            return profileIds.Skip(skip).Take(take).ToList();
        }

        public void SetResults(int profileId, string searchStr, List<int?> friendIds)
        {
            this.profileId = profileId;
            this.searchStr = searchStr;
            this.profileIds = friendIds;
            Session.SetJson("FriendDropdownResults", this);
        }

        public void ClearResults()
        {
            profileId = 0;
            searchStr = "";
            profileIds = new List<int?>();
            Session.SetJson("FriendDropdownResults", null);
        }
    }
}

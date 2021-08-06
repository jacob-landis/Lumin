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
    public class FriendProfileModalResults
    {
        [JsonIgnore]
        public ISession Session { get; set; }

        public int profileId;
        public List<int?> profileIds = new List<int?>();

        public static FriendProfileModalResults GetFriendProfileModalResults(IServiceProvider services)
        {
            // Get handle on this server session.
            ISession serverSession = services.GetRequiredService<IHttpContextAccessor>()?
                .HttpContext.Session;

            FriendProfileModalResults results = serverSession?.GetJson<FriendProfileModalResults>("FriendProfileModalResults") ??
                new FriendProfileModalResults();

            // Sets Session to this server session (default session if new instance).
            results.Session = serverSession;

            return results;
        }

        public List<int?> GetSegment(int skip, int take)
        {
            return profileIds.Skip(skip).Take(take).ToList();
        }

        public void SetResults(int profileId, List<int?> profileIds)
        {
            this.profileId = profileId;
            this.profileIds = profileIds;
            Session.SetJson("FriendProfileModalResults", this);
        }

        public void ClearResults()
        {
            profileId = 0;
            profileIds = new List<int?>();
            Session.SetJson("FriendProfileModalResults", null);
        }
    }
}

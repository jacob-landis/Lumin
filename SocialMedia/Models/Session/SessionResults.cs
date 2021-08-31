using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using SocialMedia.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models.Session
{
    public class SessionResults
    {
        [JsonIgnore]
        public ISession Session { get; set; }
        
        // 2D list that holds lists of results, accesible by a string key.
        public Dictionary<string, List<int?>> resultSets = new Dictionary<string, List<int?>>();

        public static SessionResults GetSessionResults(IServiceProvider services)
        {
            // Get handle on this server session.
            ISession serverSession = services.GetRequiredService<IHttpContextAccessor>()?
                .HttpContext.Session;

            SessionResults results = serverSession?.GetJson<SessionResults>("SessionResults") ??
                new SessionResults();

            // Sets Session to this server session (default session if new instance).
            results.Session = serverSession;

            return results;
        }

        public List<int?> GetResultsSegment(string resultsKey, int skip, int take)
        {
            try
            {
                return resultSets[resultsKey].Skip(skip).Take(take).ToList();
            }
            catch (Exception e)
            {
                // Return an empty list so that these results can be used in a foreach
                // loop without checking if they are null and it doesn't create a fault.
                return new List<int?>();
            }
        }

        public void AddResults(string resultsKey, List<int?> ids)
        {
            try
            {
                resultSets.Add(resultsKey, ids);
                Session.SetJson("SessionResults", this);
            }
            catch (Exception e)
            {
                RemoveResults(resultsKey);
                AddResults(resultsKey, ids);
            }
        }

        public void RemoveResults(string resultsKey)
        {
            try
            {
                resultSets.Remove(resultsKey);
                Session.SetJson("SessionResults", this);
            }
            catch (Exception e) { /* Do nothing */ }
        }
    }
}

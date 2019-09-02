using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Infrastructure
{
    public static class SessionExtensions
    {
        public static void SetJson(this ISession session,
            string key, object value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value,
                new JsonSerializerSettings()
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                }));
        }

        public static T GetJson<T>(this ISession session, string key)
        {
            string sessionData = session.GetString(key);
            return sessionData == null
                ? default(T)
                : JsonConvert.DeserializeObject<T>(sessionData);
        }
    }
}

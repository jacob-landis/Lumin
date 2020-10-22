using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Infrastructure
{
    /*
        Extension methods for ISession to handle storage and retrieval of JSON data.
    */
    public static class SessionExtensions
    {
        /*
            Converts C# obj to JSON obj and stores it in session.
        */
        public static void SetJson(this ISession session, string key, object value)
        {
            // Create and initialize JSON serializer setting.
            JsonSerializerSettings settings = new JsonSerializerSettings()
            {
                // Prevents reference recursion. That would be problematic for SessionProfile's use of session storage.
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            };

            // Convert C# obj to JSON obj using the setting above.
            string conversion = JsonConvert.SerializeObject(value, settings);

            // Store the converted obj in the session under the provided key.
            session.SetString(key, conversion);
        }

        /*
            Retrieves JSON obj from session and converts it back to the C# obj of the type specified.
        */
        public static T GetJson<T>(this ISession session, string key)
        {
            // Retrieve JSON obj from storage.
            string value = session.GetString(key);

            // If no value was found, return a new obj of the type specified.
            // If there was a value, convert it to a C# obj of the type specified.
            // (Trying to deserialize a null value would result in a fault, so doing so before reaching this fork is not advisable.)
            return value == null ? default(T) : JsonConvert.DeserializeObject<T>(value);
        }
    }
}

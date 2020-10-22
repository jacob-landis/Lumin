using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Infrastructure
{
    /*
        Extension methods for URL related classes. 
    */
    public static class UrlExtensions
    {
        /*
            XXX not sure what this does. Try removing it and testing it.
        */
        public static string PathAndQuery(this HttpRequest request)
        {
            return request.QueryString.HasValue
                ? $"{request.Path}{request.QueryString}"
                : request.Path.ToString();
        }
    }
}

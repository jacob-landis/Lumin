using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public interface IImageRepository
    {
        IEnumerable<Image> Images { get; }
        IEnumerable<Image> ByProfileId(int? id);
        IEnumerable<Image> RangeByProfileId(int? id, int? imageCount, int? amount);
        int CountByProfileId(int? id);
        Image ById(int? id);
        int SaveImage(Image image);
        void DeleteImage(Image image);
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SocialMedia.Models
{
    public class EFImageRepository : IImageRepository
    {
        private ApplicationDbContext context;
        public IEnumerable<Image> Images => context.Images;

        public IEnumerable<Image> ByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id);

        public IEnumerable<Image> RangeByProfileId(int? id, int? imageCount, int? amount) => context.Images
            .Where(i => i.ProfileId == id)
            .OrderByDescending(i => i.DateTime)
            .Skip((int)imageCount)
            .Take((int)amount)
            ;

        public int CountByProfileId(int? id) => context.Images.Where(i => i.ProfileId == id).Count();

        public Image ById(int? id)
        {
            if (id == 0) return new Image();
            return context.Images.First(i => i.ImageId == id);
        }

        public EFImageRepository(ApplicationDbContext context)
        {
            this.context = context;
        }
        
        public int SaveImage(Image image)
        {
            if(image.ImageId == 0) context.Images.Add(image);
            else context.Images.Update(image);
            context.SaveChanges();
            return image.ImageId;
        }

        public void DeleteImage(Image image)
        {
            context.Images.Remove(image);
            context.SaveChanges();
        }
    }
}

namespace Artify.API.Interfaces;

public interface IImageStorageService
{
    Task<string> SaveAsync(IFormFile file, string folder);
    bool IsStoredUpload(string? url, string folder);                                  // is this a real file we saved?
    Task<string> CopyAsync(string sourceUrl, string sourceFolder, string targetFolder);
    void Delete(string url);
}
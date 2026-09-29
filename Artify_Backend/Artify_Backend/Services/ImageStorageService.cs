using Artify.API.Interfaces;
using System.Text.RegularExpressions;

namespace Artify.API.Services;

public class ImageStorageService(IWebHostEnvironment env, IConfiguration config) : IImageStorageService
{
    private static readonly HashSet<string> Folders = new() { "artworks", "custom-art", "submissions", "users" };
    private static readonly HashSet<string> Extensions = new() { ".jpg", ".jpeg", ".png", ".webp" };
    private static readonly HashSet<string> MimeTypes = new() { "image/jpeg", "image/png", "image/webp" };
    private static readonly Regex StoredPath =
    new(@"^/uploads/(?<folder>[a-z-]+)/[a-f0-9]{32}\.(jpg|png|webp)$", RegexOptions.Compiled);

    private string Root => env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");

    // Only paths that exactly match our generated pattern resolve, so ../ tricks never reach the disk
    private string? Resolve(string? url, string? folder = null)
    {
        if (string.IsNullOrEmpty(url)) return null;
        var m = StoredPath.Match(url);
        if (!m.Success) return null;
        var f = m.Groups["folder"].Value;
        if (!Folders.Contains(f) || (folder is not null && f != folder)) return null;
        return Path.Combine(Root, "uploads", f, Path.GetFileName(url));
    }

    public bool IsStoredUpload(string? url, string folder)
    {
        var path = Resolve(url, folder);
        return path is not null && File.Exists(path);
    }

    public async Task<string> SaveAsync(IFormFile file, string folder)
    {
        if (!Folders.Contains(folder)) throw new InvalidOperationException("Invalid upload folder");
        if (file is null || file.Length == 0) throw new InvalidOperationException("No file uploaded");

        var maxBytes = config.GetValue("Uploads:MaxBytes", 10 * 1024 * 1024);
        if (file.Length > maxBytes)
            throw new InvalidOperationException($"File is too large (max {maxBytes / 1024 / 1024} MB)");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Extensions.Contains(ext)) throw new InvalidOperationException("Only JPG, JPEG, PNG and WEBP files are allowed");
        if (!MimeTypes.Contains(file.ContentType.ToLowerInvariant())) throw new InvalidOperationException("Invalid file type");

        // Verify the real content (magic bytes), not just the name/MIME the client claims
        var header = new byte[12];
        await using (var s = file.OpenReadStream())
            if (await s.ReadAsync(header) < 12) throw new InvalidOperationException("Invalid image file");
        if (!IsRealImage(header)) throw new InvalidOperationException("File is not a valid image");

        var dir = Path.Combine(env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot"), "uploads", folder);
        Directory.CreateDirectory(dir);

        var name = $"{Guid.NewGuid():N}{(ext == ".jpeg" ? ".jpg" : ext)}"; // never the original name
        await using var fs = new FileStream(Path.Combine(dir, name), FileMode.CreateNew);
        await file.CopyToAsync(fs);
        return $"/uploads/{folder}/{name}";
    }

    public Task<string> CopyAsync(string sourceUrl, string sourceFolder, string targetFolder)
    {
        if (!Folders.Contains(targetFolder)) throw new InvalidOperationException("Invalid upload folder");
        var src = Resolve(sourceUrl, sourceFolder);
        if (src is null || !File.Exists(src)) throw new InvalidOperationException("Source image not found");

        var name = $"{Guid.NewGuid():N}{Path.GetExtension(src)}";
        var dir = Path.Combine(Root, "uploads", targetFolder);
        Directory.CreateDirectory(dir);
        File.Copy(src, Path.Combine(dir, name));
        return Task.FromResult($"/uploads/{targetFolder}/{name}");
    }

    public void Delete(string url)
    {
        var path = Resolve(url);
        if (path is not null && File.Exists(path)) File.Delete(path);
    }

    private static bool IsRealImage(byte[] h) =>
        (h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF) ||                                    // JPEG
        (h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47) ||                    // PNG
        (h[0] == 0x52 && h[1] == 0x49 && h[2] == 0x46 && h[3] == 0x46 &&
         h[8] == 0x57 && h[9] == 0x45 && h[10] == 0x42 && h[11] == 0x50);                    // WEBP
}
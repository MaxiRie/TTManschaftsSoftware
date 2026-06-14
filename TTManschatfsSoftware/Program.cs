using Microsoft.EntityFrameworkCore;
using TTManschatfsSoftware.API;
using TTManschatfsSoftware.Data;
using TTManschatfsSoftware.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddScoped<PasswordHasher>();
builder.Services.AddScoped<JwtTokenService>();
builder.Services.AddAuthentication("Bearer")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, JwtAuthenticationHandler>("Bearer", null);
builder.Services.AddAuthorization();

// Configure Entity Framework Core with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=tt_verein;Username=postgres;Password=password";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
);

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Apply migrations and seed database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
    var importSvenIndex = Array.IndexOf(args, "--import-sven");
    if (importSvenIndex >= 0)
    {
        var importPath = importSvenIndex + 1 < args.Length
            ? args[importSvenIndex + 1]
            : @"C:\Users\maxim\Desktop\Projekt\SvenProjekt\tischtennis-spartenplaner\data\spartenplaner.json";
        await SvenProjectImporter.ImportAsync(dbContext, importPath);
        Console.WriteLine($"Sven project data imported from {importPath}");
        return;
    }

    await DataSeeder.SeedDataAsync(dbContext);
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Serve static files (HTML, CSS, JS)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

app.Run();

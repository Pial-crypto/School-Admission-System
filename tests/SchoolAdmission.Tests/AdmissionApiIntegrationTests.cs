using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolAdmission.Api.Data;
using Testcontainers.PostgreSql;
using Xunit;

namespace SchoolAdmission.Tests;

public class AdmissionApiIntegrationTests : IAsyncLifetime
{
    private PostgreSqlContainer _postgres = null!;
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

    public async Task InitializeAsync()
    {
      
   _postgres = new PostgreSqlBuilder("postgres:16")
    .WithDatabase("school_admission_test")
    .WithUsername("postgres")
    .WithPassword("test_password")
    .Build();

        await _postgres.StartAsync();

   
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");

                builder.ConfigureAppConfiguration((_, configuration) =>
                {
                    configuration.AddInMemoryCollection(
                        new Dictionary<string, string?>
                        {
                            ["ConnectionStrings:DefaultConnection"] =
                                _postgres.GetConnectionString(),

                            ["HoldDurationSeconds"] = "600"
                        });
                });
            });

        _client = _factory.CreateClient();

    
        await using var scope = _factory.Services.CreateAsyncScope();

        var db = scope.ServiceProvider
            .GetRequiredService<ApplicationDbContext>();

        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
        await _postgres.DisposeAsync();
    }


private async Task<Guid> CreateClassAsync(
    string name,
    int totalSeats)
{
    // Generate a unique name to prevent database conflicts
    // when tests share or reuse a test database.
    var uniqueName = $"{name}-{Guid.NewGuid():N}";

    var response = await _client.PostAsJsonAsync(
        "/classes",
        new
        {
            name = uniqueName,
            totalSeats
        });

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);

    using var json = await JsonDocument.ParseAsync(
        await response.Content.ReadAsStreamAsync());

    return json.RootElement
        .GetProperty("id")
        .GetGuid();
}


    private async Task<HttpResponseMessage> CreateHoldAsync(
        Guid classId,
        string studentId)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/classes/{classId}/holds");

        request.Headers.Add("X-Student-Id", studentId);

        return await _client.SendAsync(request);
    }

    [Fact]
    public async Task CreatingHold_ShouldReduceAvailableSeats()
    {
        
        var classId = await CreateClassAsync(
            "Class One",
            totalSeats: 2);

    
        var holdResponse = await CreateHoldAsync(
            classId,
            "student-001");

  
        Assert.Equal(
            HttpStatusCode.Created,
            holdResponse.StatusCode);

    
        var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        using var json = await JsonDocument.ParseAsync(
            await classResponse.Content.ReadAsStreamAsync());

        var availableSeats = json.RootElement
            .GetProperty("availableSeats")
            .GetInt32();

        var heldSeats = json.RootElement
            .GetProperty("heldSeats")
            .GetInt32();

        Assert.Equal(1, availableSeats);
        Assert.Equal(1, heldSeats);
    }

    [Fact]
    public async Task ConfirmingSameHoldTwice_ShouldCountOnlyOneConfirmedSeat()
    {
        // Arrange
        var classId = await CreateClassAsync(
            "Class Two",
            totalSeats: 2);

        var holdResponse = await CreateHoldAsync(
            classId,
            "student-002");

        Assert.Equal(
            HttpStatusCode.Created,
            holdResponse.StatusCode);

        using var holdJson = await JsonDocument.ParseAsync(
            await holdResponse.Content.ReadAsStreamAsync());

        var holdId = holdJson.RootElement
            .GetProperty("holdId")
            .GetGuid();

        // Act: confirm the same hold twice.
        var firstConfirmation = await ConfirmHoldAsync(
            holdId,
            "student-002");

        var secondConfirmation = await ConfirmHoldAsync(
            holdId,
            "student-002");

        // Assert: both requests succeed.
        Assert.Equal(
            HttpStatusCode.OK,
            firstConfirmation.StatusCode);

        Assert.Equal(
            HttpStatusCode.OK,
            secondConfirmation.StatusCode);

       
        var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        using var classJson = await JsonDocument.ParseAsync(
            await classResponse.Content.ReadAsStreamAsync());

        var confirmedSeats = classJson.RootElement
            .GetProperty("confirmedSeats")
            .GetInt32();

        var availableSeats = classJson.RootElement
            .GetProperty("availableSeats")
            .GetInt32();

        Assert.Equal(1, confirmedSeats);
        Assert.Equal(1, availableSeats);
    }

    [Fact]
    public async Task ConcurrentHoldRequests_ShouldNeverExceedClassCapacity()
    {

        const int capacity = 3;
        const int numberOfStudents = 10;

        var classId = await CreateClassAsync(
            "Class Three",
            capacity);

        var requests = Enumerable.Range(1, numberOfStudents)
            .Select(studentNumber =>
                CreateHoldAsync(
                    classId,
                    $"student-{studentNumber:D3}"));

        var responses = await Task.WhenAll(requests);

        // Assert: exactly three students should receive a hold.
        var successfulRequests = responses.Count(response =>
            response.StatusCode == HttpStatusCode.Created);

        var rejectedRequests = responses.Count(response =>
            response.StatusCode == HttpStatusCode.Conflict);

        Assert.Equal(capacity, successfulRequests);
        Assert.Equal(numberOfStudents - capacity, rejectedRequests);

        // Verify the database-backed seat summary.
        var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        using var json = await JsonDocument.ParseAsync(
            await classResponse.Content.ReadAsStreamAsync());

        var heldSeats = json.RootElement
            .GetProperty("heldSeats")
            .GetInt32();

        var availableSeats = json.RootElement
            .GetProperty("availableSeats")
            .GetInt32();

        Assert.Equal(capacity, heldSeats);
        Assert.Equal(0, availableSeats);

  
        foreach (var response in responses)
        {
            response.Dispose();
        }
    }

  
    private async Task<HttpResponseMessage> ConfirmHoldAsync(
        Guid holdId,
        string studentId)
    {
        var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/holds/{holdId}/confirm");

        request.Headers.Add("X-Student-Id", studentId);

        return await _client.SendAsync(request);
    }

    [Fact]
// public async Task ExpiredHold_ShouldReleaseSeatAndUpdateStatus()
// {

//     var classId = await CreateClassAsync(
//         "Expiration Test",
//         totalSeats: 1);

//     var holdResponse = await CreateHoldAsync(
//         classId,
//         "expiration-student");

//     Assert.Equal(
//         HttpStatusCode.Created,
//         holdResponse.StatusCode);

//     using var holdJson = await JsonDocument.ParseAsync(
//         await holdResponse.Content.ReadAsStreamAsync());

//     var holdId = holdJson.RootElement
//         .GetProperty("holdId")
//         .GetGuid();

   
//     await Task.Delay(TimeSpan.FromSeconds(3));

    
//     var getHoldResponse = await _client.GetAsync(
//         $"/holds/{holdId}");

//     getHoldResponse.EnsureSuccessStatusCode();

//     using var expiredJson = await JsonDocument.ParseAsync(
//         await getHoldResponse.Content.ReadAsStreamAsync());

//     var status = expiredJson.RootElement
//         .GetProperty("status")
//         .GetString();

//     Assert.Equal("EXPIRED", status);

  
//     var classResponse = await _client.GetAsync(
//         $"/classes/{classId}");

//     classResponse.EnsureSuccessStatusCode();

//     using var classJson = await JsonDocument.ParseAsync(
//         await classResponse.Content.ReadAsStreamAsync());

//     Assert.Equal(
//         0,
//         classJson.RootElement.GetProperty("heldSeats").GetInt32());

//     Assert.Equal(
//         1,
//         classJson.RootElement.GetProperty("availableSeats").GetInt32());
// }
}